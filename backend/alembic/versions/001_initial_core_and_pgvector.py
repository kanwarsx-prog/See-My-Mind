"""001 Initial Core Tables and pgvector

Revision ID: 001_initial_core
Revises:
Create Date: 2026-10-22 10:35:00.000000

"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

try:
    from pgvector.sqlalchemy import Vector

    vector_type = Vector(1536)
except ImportError:
    vector_type = sa.JSON()

revision: str = "001_initial_core"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. Enable pgvector on Postgres
    op.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    # 2. Schools & Academic Years
    op.create_table(
        "schools",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("school_name", sa.String(140), nullable=False),
        sa.Column("school_reference", sa.String(140), unique=True, nullable=True),
        sa.Column("address_line_1", sa.String(140), nullable=True),
        sa.Column("address_line_2", sa.String(140), nullable=True),
        sa.Column("town_city", sa.String(140), nullable=True),
        sa.Column("county", sa.String(140), nullable=True),
        sa.Column("postcode", sa.String(20), nullable=True),
        sa.Column("main_email", sa.String(140), nullable=True),
        sa.Column("main_telephone", sa.String(50), nullable=True),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "academic_years",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("current", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 3. Staff
    op.create_table(
        "staff_members",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("first_name", sa.String(140), nullable=False),
        sa.Column("last_name", sa.String(140), nullable=False),
        sa.Column("email", sa.String(140), unique=True, nullable=False),
        sa.Column("telephone", sa.String(50), nullable=True),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "staff_school_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "staff_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("staff_members.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("role", sa.String(50), nullable=False),
        sa.Column("job_title", sa.String(140), nullable=True),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 4. Pupils & Guardians
    op.create_table(
        "children",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("first_name", sa.String(140), nullable=False),
        sa.Column("last_name", sa.String(140), nullable=False),
        sa.Column("full_name", sa.String(280), nullable=True),
        sa.Column("preferred_name", sa.String(140), nullable=True),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("sex", sa.String(20), nullable=False),
        sa.Column("year_group", sa.String(50), nullable=True),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "guardians",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("first_name", sa.String(140), nullable=False),
        sa.Column("last_name", sa.String(140), nullable=False),
        sa.Column("email", sa.String(140), unique=True, nullable=False),
        sa.Column("mobile_phone", sa.String(50), nullable=True),
        sa.Column("relationship_to_child", sa.String(50), nullable=True),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_guardian_links",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "guardian_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("guardians.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("parental_responsibility", sa.Boolean(), default=True, nullable=False),
        sa.Column("emergency_contact", sa.Boolean(), default=True, nullable=False),
        sa.Column("primary_carer", sa.Boolean(), default=False, nullable=False),
        sa.Column("receive_daily_updates", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_school_enrolments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "academic_year_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("academic_years.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("year_group", sa.String(50), nullable=True),
        sa.Column("start_date", sa.Date(), nullable=True),
        sa.Column("end_date", sa.Date(), nullable=True),
        sa.Column("current", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 5. Child Support Profile
    op.create_table(
        "child_support_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("primary_need", sa.String(140), nullable=True),
        sa.Column("secondary_need", sa.String(140), nullable=True),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("communication_preferences", sa.Text(), nullable=True),
        sa.Column("sensory_profile", sa.Text(), nullable=True),
        sa.Column("strengths_interests", sa.Text(), nullable=True),
        sa.Column("has_ehcp", sa.Boolean(), default=False, nullable=False),
        sa.Column("active", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "support_strategies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("title", sa.String(140), nullable=False),
        sa.Column("category", sa.String(50), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("suggested_steps", sa.Text(), nullable=True),
        sa.Column("evidence_base", sa.Text(), nullable=True),
        sa.Column("is_global", sa.Boolean(), default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_support_strategies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_support_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "strategy_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("support_strategies.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("custom_title", sa.String(140), nullable=True),
        sa.Column("custom_instructions", sa.Text(), nullable=False),
        sa.Column("priority", sa.Integer(), default=1),
        sa.Column("effective_rating", sa.String(50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_triggers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_support_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("trigger_title", sa.String(140), nullable=False),
        sa.Column("trigger_category", sa.String(50), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("typical_reaction", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_distress_indicators",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "profile_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_support_profiles.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("stage", sa.String(50), nullable=False),
        sa.Column("observable_behaviour", sa.Text(), nullable=False),
        sa.Column("recommended_staff_action", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 6. Transactional Spine (Child Event & Details)
    op.create_table(
        "child_events",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=True,
            index=True,
        ),
        sa.Column("event_time", sa.DateTime(timezone=True), nullable=False, index=True),
        sa.Column("event_type", sa.String(50), nullable=False, index=True),
        sa.Column("reporter_type", sa.String(50), nullable=False),
        sa.Column("reporter_name", sa.String(140), nullable=True),
        sa.Column("reporter_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("significance", sa.String(50), default="Routine"),
        sa.Column("visibility", sa.String(50), default="Shared"),
        sa.Column("status", sa.String(50), default="Logged"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "observations",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("activity_context", sa.String(140), nullable=True),
        sa.Column("engagement_level", sa.String(50), nullable=True),
        sa.Column("strategy_used", sa.String(140), nullable=True),
        sa.Column("strategy_worked", sa.Boolean(), nullable=True),
        sa.Column("strengths_observed", sa.Text(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "transition_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("transition_type", sa.String(50), nullable=False),
        sa.Column("sleep_quality", sa.String(50), nullable=True),
        sa.Column("morning_mood", sa.String(50), nullable=True),
        sa.Column("breakfast_eaten", sa.Boolean(), nullable=True),
        sa.Column("medication_given", sa.Boolean(), nullable=True),
        sa.Column("special_notes_for_day", sa.Text(), nullable=True),
        sa.Column("acknowledged_by_staff", sa.Boolean(), default=False),
        sa.Column("acknowledged_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "child_check_ins",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("mood_emoji", sa.String(20), nullable=False),
        sa.Column("mood_label", sa.String(50), nullable=False),
        sa.Column("energy_level", sa.Integer(), nullable=True),
        sa.Column("self_regulation_need", sa.String(140), nullable=True),
        sa.Column("voice_note_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "behavioural_incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="CASCADE"),
            unique=True,
            nullable=False,
        ),
        sa.Column("location", sa.String(100), nullable=True),
        sa.Column("severity", sa.String(50), nullable=False),
        sa.Column("antecedent", sa.Text(), nullable=False),
        sa.Column("behaviour", sa.Text(), nullable=False),
        sa.Column("consequence", sa.Text(), nullable=False),
        sa.Column("de_escalation_strategy_used", sa.String(140), nullable=True),
        sa.Column("recovery_time_minutes", sa.Integer(), nullable=True),
        sa.Column("parent_notified", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "follow_up_actions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("assigned_to_role", sa.String(50), nullable=True),
        sa.Column("assigned_to_name", sa.String(140), nullable=True),
        sa.Column("due_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed", sa.Boolean(), default=False, nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # 7. AI & RAG (NOYA)
    op.create_table(
        "rag_source_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=True,
            index=True,
        ),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("document_type", sa.String(50), nullable=False),
        sa.Column("storage_path", sa.String(500), nullable=False),
        sa.Column("file_size_bytes", sa.Integer(), nullable=True),
        sa.Column("mime_type", sa.String(100), default="application/pdf"),
        sa.Column("is_indexed", sa.Boolean(), default=False, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "rag_chunk_indexes",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "source_document_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("rag_source_documents.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "school_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("schools.id", ondelete="CASCADE"),
            nullable=True,
            index=True,
        ),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("section_heading", sa.String(200), nullable=True),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("embedding", vector_type, nullable=True),
        sa.Column("token_count", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "ai_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("requester_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("requester_role", sa.String(50), nullable=False),
        sa.Column("prompt_type", sa.String(50), nullable=False),
        sa.Column("model_name", sa.String(50), nullable=False),
        sa.Column("prompt_version", sa.String(20), default="1.0"),
        sa.Column("input_tokens", sa.Integer(), default=0),
        sa.Column("output_tokens", sa.Integer(), default=0),
        sa.Column("latency_ms", sa.Integer(), default=0),
        sa.Column("status", sa.String(50), default="Success"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "ai_insights",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "child_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("children.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "run_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ai_runs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("insight_type", sa.String(50), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("content_markdown", sa.Text(), nullable=False),
        sa.Column("confidence_level", sa.String(20), default="High"),
        sa.Column("review_status", sa.String(50), default="Draft"),
        sa.Column("reviewed_by_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    op.create_table(
        "ai_insight_evidence",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "insight_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("ai_insights.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column(
            "chunk_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("rag_chunk_indexes.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "event_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("child_events.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("citation_text", sa.String(255), nullable=False),
        sa.Column("snippet", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table("ai_insight_evidence")
    op.drop_table("ai_insights")
    op.drop_table("ai_runs")
    op.drop_table("rag_chunk_indexes")
    op.drop_table("rag_source_documents")
    op.drop_table("follow_up_actions")
    op.drop_table("behavioural_incidents")
    op.drop_table("child_check_ins")
    op.drop_table("transition_logs")
    op.drop_table("observations")
    op.drop_table("child_events")
    op.drop_table("child_distress_indicators")
    op.drop_table("child_triggers")
    op.drop_table("child_support_strategies")
    op.drop_table("support_strategies")
    op.drop_table("child_support_profiles")
    op.drop_table("child_school_enrolments")
    op.drop_table("child_guardian_links")
    op.drop_table("guardians")
    op.drop_table("children")
    op.drop_table("staff_school_assignments")
    op.drop_table("staff_members")
    op.drop_table("academic_years")
    op.drop_table("schools")
