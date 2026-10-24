from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session

from app import models
from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.schemas.analytics import (
    IncidentHeatmapResponse,
    ProvisionAuditResponse,
    SchoolAnalyticsOverview,
    StrategyEfficacyResponse,
    TriggersReportResponse,
)
from app.schemas.sen_report import SenInformationReportResponse
from app.services.analytics_service import AnalyticsService
from app.services.sen_report_service import SenReportService

router = APIRouter()


@router.get("/overview", response_model=SchoolAnalyticsOverview)
def get_analytics_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Retrieve school-wide macro analytics, caseload counts, and provision delivery rates."""
    return AnalyticsService.get_school_overview(db, school_id=current_user.school_id)


@router.get("/incidents/heatmap", response_model=IncidentHeatmapResponse)
def get_incident_heatmap(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Retrieve 5-day x 7-period incident and dysregulation heatmap matrix."""
    return AnalyticsService.get_incident_heatmap(db, school_id=current_user.school_id)


@router.get("/incidents/triggers", response_model=TriggersReportResponse)
def get_trigger_frequencies(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Retrieve frequency breakdown of antecedent triggers across neurodivergent vulnerability domains."""
    return AnalyticsService.get_trigger_frequencies(db, school_id=current_user.school_id)


@router.get("/strategies/win-rates", response_model=StrategyEfficacyResponse)
def get_strategy_win_rates(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Retrieve ranked empirical resolution success rates across de-escalation strategies."""
    return AnalyticsService.get_strategy_win_rates(db, school_id=current_user.school_id)


@router.get("/provision/audit", response_model=ProvisionAuditResponse)
def get_provision_audit(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Retrieve High Needs Block funding band audit and weekly 1:1 TA hours allocated vs delivered."""
    return AnalyticsService.get_provision_audit(db, school_id=current_user.school_id)


@router.get("/export/csv")
def export_analytics_csv(
    report_type: str = Query("provision", pattern="^(provision|strategies|triggers)$"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin", "teacher", "ta"])),
):
    """Export statutory provision, strategy efficacy, or incident triggers data as an RFC 4180 CSV."""
    csv_content = AnalyticsService.generate_csv_export(
        report_type=report_type, db=db, school_id=current_user.school_id
    )
    filename = f"seemy-mind-{report_type}-audit.csv"
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.get("/governor-report", response_model=SenInformationReportResponse)
def get_statutory_governor_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_roles(["senco", "admin"])),
):
    """Generate the official Statutory SEN Information Report and Governor Pack
    under Regulation 51 & Schedule 1 of the SEND Regulations 2014."""
    return SenReportService.generate_sen_information_report(
        db=db, school_id=current_user.school_id
    )

