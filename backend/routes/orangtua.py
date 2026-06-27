from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from database import engine

router = APIRouter()

class ValidateRequest(BaseModel):
    nisn: str
    tanggal_lahir: str


# =========================================
# GET SISWA BERDASARKAN NISN
# =========================================

@router.get("/students/nisn/{nisn}")
def get_student_by_nisn(nisn: str):

    with engine.connect() as conn:

        result = conn.execute(
            text("""
                SELECT
                    nis,
                    nisn,
                    nama_siswa,
                    id_kelas,
                    tanggal_lahir
                FROM student_data
                WHERE nisn = :nisn
            """),
            {"nisn": nisn}
        ).mappings().fetchone()

        if not result:
            raise HTTPException(
                status_code=404,
                detail="Siswa tidak ditemukan"
            )

        return dict(result)


# =========================================
# VALIDASI TANGGAL LAHIR
# =========================================

@router.post("/students/validate")
def validate_student(data: ValidateRequest):

    with engine.connect() as conn:

        student = conn.execute(
            text("""
                SELECT
                    nis,
                    nisn,
                    nama_siswa,
                    id_kelas,
                    tanggal_lahir
                FROM student_data
                WHERE nisn = :nisn
            """),
            {"nisn": data.nisn}
        ).mappings().fetchone()

        if not student:
            raise HTTPException(
                status_code=404,
                detail="Siswa tidak ditemukan"
            )

        tanggal_db = str(student["tanggal_lahir"])

        if tanggal_db != data.tanggal_lahir:
            raise HTTPException(
                status_code=401,
                detail="Tanggal lahir tidak sesuai"
            )

        attendance = conn.execute(
            text("""
                SELECT
                    tanggal,
                    jam_masuk,
                    jam_keluar,
                    status_kehadiran,
                    keterangan
                FROM student_attendance_data
                WHERE nis = (
                    SELECT nis
                    FROM student_data
                    WHERE nisn = :nisn
                )
                ORDER BY tanggal DESC
            """),
            {"nisn": data.nisn}
        ).mappings().fetchall()

        return {
            "success": True,
            "attendance": [dict(x) for x in attendance]
        }