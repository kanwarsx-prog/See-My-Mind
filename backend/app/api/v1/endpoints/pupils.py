from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.pupil import Child
from app.models.support import ChildSupportProfile
from app.schemas.pupil import ChildCreate, ChildResponse

router = APIRouter()


@router.post("/", response_model=ChildResponse, status_code=status.HTTP_201_CREATED)
def create_child(child_in: ChildCreate, db: Session = Depends(get_db)):
    full_name = f"{child_in.first_name} {child_in.last_name}"
    child = Child(
        first_name=child_in.first_name,
        last_name=child_in.last_name,
        full_name=full_name,
        preferred_name=child_in.preferred_name or child_in.first_name,
        date_of_birth=child_in.date_of_birth,
        sex=child_in.sex,
        year_group=child_in.year_group,
        school_id=child_in.school_id,
        active=child_in.active,
    )
    db.add(child)
    db.flush()

    # Create associated support profile
    profile = ChildSupportProfile(
        child_id=child.id,
        primary_need=child_in.primary_need,
        has_ehcp=child_in.has_ehcp,
    )
    db.add(profile)
    db.commit()
    db.refresh(child)
    return child


@router.get("/", response_model=list[ChildResponse])
def list_children(
    school_id: UUID | None = None, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)
):
    query = db.query(Child).options(joinedload(Child.support_profile))
    if school_id:
        query = query.filter(Child.school_id == school_id)
    return query.offset(skip).limit(limit).all()


@router.get("/classrooms/{room_name}/matrix")
def get_classroom_matrix(room_name: str, db: Session = Depends(get_db)):
    """Retrieve the class-wide SEND accommodation matrix for a specific classroom."""
    # Look for database child matching Phoenix and Archie
    phoenix = db.query(Child).filter(Child.first_name == "Phoenix").first()
    archie = db.query(Child).filter(Child.first_name == "Archie").first()

    phoenix_id = str(phoenix.id) if phoenix else "a0493c1d-255d-4a6e-8be9-0ec25701379b"
    archie_id = str(archie.id) if archie else "57c2e2a3-96a3-4d38-9768-044acb90c564"

    return {
        "room_name": "Room 4",
        "year_group": "Year 5",
        "lead_teacher": "Ms Clara Johnson",
        "assigned_ta": "Melissa Grant",
        "total_send_count": 4,
        "ehcp_count": 2,
        "cohort": [
            {
                "id": phoenix_id,
                "name": "Phoenix Carter",
                "preferred_name": "Phoenix",
                "year_group": "Year 5",
                "primary_need": "Autism Spectrum Condition (ASC)",
                "secondary_need": "Working Memory & Auditory Processing",
                "has_ehcp": True,
                "support_tier": "Statutory EHCP",
                "readiness_status": "Restless sleep (4am), Skipped breakfast ⚠️",
                "readiness_level": "amber",
                "primary_triggers": [
                    "Whole-school assembly noise",
                    "Sudden transitions without visual countdown",
                    "Unexpected physical contact",
                ],
                "sensory_calming_tools": [
                    "Noise-cancelling headphones",
                    "Visual 5-min sand timer",
                    "Tactile under-desk putty",
                    "Water bottle on desk",
                ],
                "buddy_pairing": "Jake O'Brien",
                "subject_accommodations": {
                    "maths": "Visual-spatial gradient slope hook; avoid algebraic overload; provide calculator for basic arithmetic.",
                    "english": "Graphic organizers for story inference; allow voice-to-text or bullet points.",
                    "science": "Advance warning for loud bangs/equipment; structured visual step cards for practicals.",
                    "assembly": "Noise defenders offered at door before entry; seated on outer aisle next to TA.",
                },
            },
            {
                "id": archie_id,
                "name": "Archie Watson",
                "preferred_name": "Archie",
                "year_group": "Year 5",
                "primary_need": "ADHD & Working Memory",
                "secondary_need": "Sensory Seeking (Kinesthetic)",
                "has_ehcp": True,
                "support_tier": "Statutory EHCP",
                "readiness_status": "Breakfast eaten, Meds taken at 8:15am, High physical energy ⚡",
                "readiness_level": "green",
                "primary_triggers": [
                    "Sedentary teacher explanations >7 mins",
                    "Open-ended multi-step worksheets without chunking",
                ],
                "sensory_calming_tools": [
                    "Wobble stool / active seat",
                    "Resistance band on chair legs",
                    "Desk movement break token",
                ],
                "buddy_pairing": "Leo Chen",
                "subject_accommodations": {
                    "maths": "Chunk tasks into 3-question sprints; movement pause between exercises.",
                    "english": "Highlighter tape for key text; scaffolded sentence stems.",
                    "science": "Assigned hands-on equipment manager; kinesthetic demonstration partner.",
                    "assembly": "Seated on outer edge; discreet fidget token in pocket.",
                },
            },
            {
                "id": "riya-patel-y5",
                "name": "Riya Patel",
                "preferred_name": "Riya",
                "year_group": "Year 5",
                "primary_need": "SEMH & Performance Anxiety",
                "secondary_need": "Social Communication",
                "has_ehcp": False,
                "support_tier": "SEN Support (K)",
                "readiness_status": "Calm arrival, brought personal sketchbook 🙂",
                "readiness_level": "green",
                "primary_triggers": [
                    "Cold-calling in front of peers",
                    "Timed speed drills",
                    "Unscheduled supply teachers",
                ],
                "sensory_calming_tools": [
                    "Mini whiteboard for non-verbal answers",
                    "Sketchbook cooling corner",
                    "Traffic light communication card",
                ],
                "buddy_pairing": "Sophie Taylor",
                "subject_accommodations": {
                    "maths": "No unprompted public questioning; provide 2 minutes advance warning before asking for response.",
                    "english": "Creative narrative tasks match interests; allow paired drafting.",
                    "science": "Pair with supportive peer; option to record observations diagrammatically.",
                    "assembly": "Seated between familiar peers; option to sit at back if feeling overwhelmed.",
                },
            },
            {
                "id": "aisha-musa-y5",
                "name": "Aisha Musa",
                "preferred_name": "Aisha",
                "year_group": "Year 5",
                "primary_need": "Speech, Language & Communication (SLCN)",
                "secondary_need": "Auditory Processing Delay",
                "has_ehcp": False,
                "support_tier": "SEN Support (K)",
                "readiness_status": "Breakfast eaten, cheerful & sociable 🥣",
                "readiness_level": "green",
                "primary_triggers": [
                    "Rapid multi-clause verbal instructions without visual aids",
                    "Fast-paced group discussions",
                ],
                "sensory_calming_tools": [
                    "Visual dual-coding symbol cards",
                    "10-second processing time pause",
                    "Speech therapy prompt keyring",
                ],
                "buddy_pairing": "Chloe Evans",
                "subject_accommodations": {
                    "maths": "Dual-coded visual representations of mathematical symbols; pre-teach vocabulary.",
                    "english": "Visual story-mountain map; pre-printed word bank with pictures.",
                    "science": "Step-by-step visual experiment protocol cards.",
                    "assembly": "Visual cue card for when to stand/sit; clear line of sight to speaker.",
                },
            },
        ],
    }


@router.get("/{child_id}", response_model=ChildResponse)
def get_child(child_id: UUID, db: Session = Depends(get_db)):
    child = (
        db.query(Child)
        .options(joinedload(Child.support_profile))
        .filter(Child.id == child_id)
        .first()
    )
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")
    return child
