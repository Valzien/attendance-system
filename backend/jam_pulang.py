from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()

@router.get("/jam-pulang/{kelas}")
def get_jam_pulang(
    kelas: str,
    db: Session = Depends(get_db)
):

    data = db.execute(text("""
        SELECT jam_pulang
        FROM kelas
        WHERE nama_kelas = :kelas
        LIMIT 1
    """), {
        "kelas": kelas
    }).fetchone()

    if not data:
        return {
            "jam_pulang": "14:40:00"
        }

    return {
        "jam_pulang": str(data.jam_pulang)
    }