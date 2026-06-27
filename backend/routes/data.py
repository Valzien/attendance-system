from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import date
import pandas as pd
from pydantic import BaseModel

from database import get_db

router = APIRouter()

# =====================================================
# GET SEMUA DATA SISWA
# =====================================================

@router.get("/students")
def get_all_students(db: Session = Depends(get_db)):

    try:

        students = db.execute(text("""

            SELECT
                s.nis,
                s.nisn,
                s.nama_siswa,

                s.id_kelas,
                k.nama_kelas,

                s.wali_kelas,
                s.alamat,
                s.no_wa_siswa,
                s.no_wa_ortu,
                s.tanggal_lahir

            FROM student_data s

            LEFT JOIN kelas k
            ON s.id_kelas = k.id

            ORDER BY s.nama_siswa

        """)).fetchall()

        return [
            dict(row._mapping)
            for row in students
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# =====================================================
# GET DATA SISWA BERDASARKAN NIS
# =====================================================

@router.get("/students/{nis}")
def get_student_by_nis(
    nis: str,
    db: Session = Depends(get_db)
):

    try:

        student = db.execute(text("""
            SELECT
                nis,
                nisn,
                nama_siswa,
                id_kelas,
                wali_kelas,
                alamat,
                no_wa_siswa,
                no_wa_ortu,
                tanggal_lahir
            FROM student_data
            WHERE nis = :nis
        """), {
            "nis": nis
        }).fetchone()

        if not student:

            raise HTTPException(
                status_code=404,
                detail="Siswa tidak ditemukan"
            )

        return dict(student._mapping)

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/teachers")
def get_all_teachers(
    db: Session = Depends(get_db)
):

    try:

        teachers = db.execute(text("""
            SELECT
                NIP,
                Nama,
                Tanggal_lahir,
                Alamat,
                Guru_Pengampu,
                Nomor_Telepon,
                role
            FROM teacher_data
            ORDER BY Nama
        """)).fetchall()

        return [
            dict(row._mapping)
            for row in teachers
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET DETAIL GURU BERDASARKAN NIP
# =====================================================

@router.get("/teachers/{nip}")
def get_teacher_by_nip(
    nip: str,
    db: Session = Depends(get_db)
):

    try:

        teacher = db.execute(text("""
            SELECT
                NIP,
                Nama,
                Tanggal_lahir,
                Alamat,
                Guru_Pengampu,
                Nomor_Telepon
            FROM teacher_data
            WHERE NIP = :nip
        """), {
            "nip": nip
        }).fetchone()

        if not teacher:

            raise HTTPException(
                status_code=404,
                detail="Guru tidak ditemukan"
            )

        return dict(teacher._mapping)

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =====================================================
# UPDATE DATA GURU
# =====================================================

@router.put("/teachers/{nip}")
def update_teacher(
    nip: str,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):

    try:

        cek = db.execute(text("""
            SELECT NIP
            FROM teacher_data
            WHERE NIP = :nip
        """), {
            "nip": nip
        }).fetchone()

        if not cek:

            raise HTTPException(
                status_code=404,
                detail="Guru tidak ditemukan"
            )

        query = text("""
            UPDATE teacher_data
            SET
                Nama = :Nama,
                Tanggal_lahir = :Tanggal_lahir,
                Alamat = :Alamat,
                Guru_Pengampu = :Guru_Pengampu,
                Nomor_Telepon = :Nomor_Telepon
            WHERE NIP = :nip
        """)

        db.execute(query, {
            "nip": nip,
            "Nama": data.get("Nama"),
            "Tanggal_lahir": data.get("Tanggal_lahir"),
            "Alamat": data.get("Alamat"),
            "Guru_Pengampu": data.get("Guru_Pengampu"),
            "Nomor_Telepon": data.get("Nomor_Telepon")
        })

        db.commit()

        return {
            "success": True,
            "message": "Data guru berhasil diupdate"
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
# =====================================================
# DELETE DATA GURU
# =====================================================

@router.delete("/teacher/{nip}")
def delete_teacher(
    nip: str,
    db: Session = Depends(get_db)
):

    try:

        cek = db.execute(text("""
            SELECT NIP
            FROM teacher_data
            WHERE NIP = :nip
        """), {
            "nip": nip
        }).fetchone()

        if not cek:

            raise HTTPException(
                status_code=404,
                detail="Guru tidak ditemukan"
            )

        db.execute(text("""
            DELETE FROM teacher_data
            WHERE NIP = :nip
        """), {
            "nip": nip
        })

        db.commit()

        return {
            "success": True,
            "message": "Data guru berhasil dihapus"
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )    

# =====================================================
# GET PROFILE ADMIN
# =====================================================

@router.get("/admin-profile/{nip}")
def get_admin_profile(
    nip: str,
    db: Session = Depends(get_db)
):

    try:

        admin = db.execute(text("""
            SELECT
                NIP,
                Nama,
                username,
                role,
                Tanggal_lahir,
                Alamat,
                Guru_Pengampu,
                Nomor_Telepon
            FROM teacher_data
            WHERE NIP = :nip
        """), {
            "nip": nip
        }).fetchone()

        if not admin:

            raise HTTPException(
                status_code=404,
                detail="Admin tidak ditemukan"
            )

        return dict(admin._mapping)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET SEMUA NOTIF IZIN
# =====================================================

@router.get("/permission-forms")
def get_all_permission_forms(
    db: Session = Depends(get_db)
):

    try:

        forms = db.execute(text("""
            SELECT
                nis,
                nama_siswa,
                tanggal,
                alasan,
                status,
                lampiran
            FROM data_form_izin
            ORDER BY tanggal DESC
        """)).fetchall()

        return [
            dict(row._mapping)
            for row in forms
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET SEMUA KELAS
# =====================================================

@router.get("/classes")
def get_all_classes(
    db: Session = Depends(get_db)
):

    try:

        classes = db.execute(text("""
            SELECT
                id,
                nama_kelas,
                wali_kelas,
                jam_pulang
            FROM kelas
            ORDER BY nama_kelas
        """)).fetchall()

        return [
            dict(row._mapping)
            for row in classes
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET SEMUA JADWAL
# =====================================================

@router.get("/schedules")
def get_all_schedules(
    db: Session = Depends(get_db)
):

    try:

        schedules = db.execute(text("""
            SELECT
                id_mapel,
                mapel,
                jam,
                hari,
                guru,
                kelas
            FROM jadwal_pelajaran
            ORDER BY hari, jam
        """)).fetchall()

        return [
            dict(row._mapping)
            for row in schedules
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET JADWAL BERDASARKAN KELAS
# =====================================================

@router.get("/schedules/class/{class_name}")
def get_schedules_by_class(
    class_name: str,
    db: Session = Depends(get_db)
):

    try:

        schedules = db.execute(text("""
            SELECT
                id_mapel,
                mapel,
                jam,
                hari,
                guru,
                kelas
            FROM jadwal_pelajaran
            WHERE kelas = :kelas
            ORDER BY hari, jam
        """), {
            "kelas": class_name
        }).fetchall()

        return [
            dict(row._mapping)
            for row in schedules
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# GET DETAIL JADWAL
# =====================================================

@router.get("/schedule/{id_mapel}")
def get_schedule_by_id(
    id_mapel: str,
    db: Session = Depends(get_db)
):

    try:

        query = text("""
            SELECT
                id_mapel,
                mapel,
                jam,
                hari,
                guru,
                kelas
            FROM jadwal_pelajaran
            WHERE id_mapel = :id_mapel
        """)

        result = db.execute(query, {
            "id_mapel": id_mapel
        }).fetchone()

        if not result:

            raise HTTPException(
                status_code=404,
                detail="Jadwal tidak ditemukan"
            )

        return dict(result._mapping)

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
# =====================================================
# IMPORT JADWAL DARI EXCEL
# =====================================================

@router.post("/schedules/import")
async def import_schedules(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    try:

        df = pd.read_excel(file.file)

        for _, row in df.iterrows():

            query = text("""
                INSERT INTO jadwal_pelajaran (
                    id_mapel,
                    mapel,
                    jam,
                    hari,
                    guru,
                    kelas
                )
                VALUES (
                    :id_mapel,
                    :mapel,
                    :jam,
                    :hari,
                    :guru,
                    :kelas
                )
            """)

            db.execute(query, {
                "id_mapel": str(row["id_mapel"]),
                "mapel": row["mapel"],
                "jam": row["jam"],
                "hari": row["hari"],
                "guru": row["guru"],
                "kelas": row["kelas"]
            })

        db.commit()

        return {
            "success": True,
            "message": "Import jadwal berhasil"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# UPDATE JADWAL
# =====================================================

from fastapi import Body

@router.put("/schedule/{id_mapel}")
def update_schedule(
    id_mapel: str,
    data: dict = Body(...),
    db: Session = Depends(get_db)
):
    try:

        # cek apakah jadwal ada
        cek = db.execute(text("""
            SELECT id_mapel
            FROM jadwal_pelajaran
            WHERE id_mapel = :id_mapel
        """), {
            "id_mapel": id_mapel
        }).fetchone()

        if not cek:
            raise HTTPException(
                status_code=404,
                detail="Jadwal tidak ditemukan"
            )

        query = text("""
            UPDATE jadwal_pelajaran
            SET
                mapel = :mapel,
                jam = :jam,
                hari = :hari,
                guru = :guru,
                kelas = :kelas
            WHERE id_mapel = :id_mapel
        """)

        db.execute(query, {
            "id_mapel": id_mapel,
            "mapel": data.get("mapel"),
            "jam": data.get("jam"),
            "hari": data.get("hari"),
            "guru": data.get("guru"),
            "kelas": data.get("kelas")
        })

        db.commit()

        return {
            "success": True,
            "message": "Jadwal berhasil diupdate"
        }

    except HTTPException:
        raise

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# =====================================================
# DELETE JADWAL
# =====================================================

@router.delete("/schedule/{id_mapel}")
def delete_schedule(
    id_mapel: int,
    db: Session = Depends(get_db)
):

    try:

        query = text("""
            DELETE FROM jadwal_pelajaran
            WHERE id_mapel = :id_mapel
        """)

        db.execute(query, {
            "id_mapel": id_mapel
        })

        db.commit()

        return {
            "success": True,
            "message": "Jadwal berhasil dihapus"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    
@router.get("/student-history/{nis}")
def get_student_history(
    nis: str,
    db: Session = Depends(get_db)
):
    try:
        query = text("""
            SELECT
                id_absen,
                nis,
                nama_siswa,
                tanggal,
                jam_masuk,
                jam_keluar,
                status_kehadiran,
                keterangan,

                foto_absen AS foto_masuk,
                foto_keluar,

                latitude_masuk,
                longitude_masuk,
                latitude_keluar,
                longitude_keluar

            FROM student_attendance_data
            WHERE nis = :nis
            ORDER BY tanggal DESC
        """)

        result = db.execute(query, {
            "nis": nis
        }).fetchall()

        return [
            dict(row._mapping)
            for row in result
        ]

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
# # =====================================================
# # UPDATE DATA SISWA
# # =====================================================

# @router.put("/students/{nis}")
# def update_student(
#     nis: str,
#     data: dict = Body(...),
#     db: Session = Depends(get_db)
# ):

#     try:

#         cek = db.execute(text("""
#             SELECT nis
#             FROM student_data
#             WHERE nis = :nis
#         """), {
#             "nis": nis
#         }).fetchone()

#         if not cek:

#             raise HTTPException(
#                 status_code=404,
#                 detail="Siswa tidak ditemukan"
#             )

#         query = text("""
#             UPDATE student_data
#             SET
#                 nisn = :nisn,
#                 nama_siswa = :nama_siswa,
#                 id_kelas = :id_kelas,
#                 wali_kelas = :wali_kelas,
#                 alamat = :alamat,
#                 no_wa_siswa = :no_wa_siswa,
#                 no_wa_ortu = :no_wa_ortu,
#                 tanggal_lahir = :tanggal_lahir
#             WHERE nis = :nis
#         """)

#         db.execute(query, {
#             "nis": nis,
#             "nisn": data.get("nisn"),
#             "nama_siswa": data.get("nama_siswa"),
#             "id_kelas": data.get("id_kelas"),
#             "wali_kelas": data.get("wali_kelas"),
#             "alamat": data.get("alamat"),
#             "no_wa_siswa": data.get("no_wa_siswa"),
#             "no_wa_ortu": data.get("no_wa_ortu"),
#             "tanggal_lahir": data.get("tanggal_lahir")
#         })

#         db.commit()

#         return {
#             "success": True,
#             "message": "Data siswa berhasil diupdate"
#         }

#     except HTTPException:
#         raise

#     except Exception as e:

#         db.rollback()

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )      

# # =====================================================
# # DELETE DATA SISWA
# # =====================================================

# @router.delete("/students/{nis}")
# def delete_student(
#     nis: str,
#     db: Session = Depends(get_db)
# ):

#     try:

#         cek = db.execute(text("""
#             SELECT nis
#             FROM student_data
#             WHERE nis = :nis
#         """), {
#             "nis": nis
#         }).fetchone()

#         if not cek:

#             raise HTTPException(
#                 status_code=404,
#                 detail="Siswa tidak ditemukan"
#             )

#         db.execute(text("""
#             DELETE FROM student_data
#             WHERE nis = :nis
#         """), {
#             "nis": nis
#         })

#         db.commit()

#         return {
#             "success": True,
#             "message": "Data siswa berhasil dihapus"
#         }

#     except HTTPException:
#         raise

#     except Exception as e:

#         db.rollback()

#         raise HTTPException(
#             status_code=500,
#             detail=str(e)
#         )    
    
# =====================================================
# WEEKLY ATTENDANCE
# =====================================================

@router.get("/attendance/weekly")
def get_weekly_attendance(
    db: Session = Depends(get_db)
):

    try:

        result = db.execute(text("""
            SELECT
                DAYNAME(tanggal) AS hari,
                COUNT(*) AS total
            FROM student_attendance_data
            WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY DAYNAME(tanggal)
        """)).fetchall()

        hari_order = {
            "Monday": "Sen",
            "Tuesday": "Sel",
            "Wednesday": "Rab",
            "Thursday": "Kam",
            "Friday": "Jum",
            "Saturday": "Sab",
            "Sunday": "Min"
        }

        data = []

        for row in result:

            data.append({
                "hari": hari_order.get(
                    row.hari,
                    row.hari
                ),
                "total": row.total
            })

        return data

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
        
# # =====================================================
# # Validate
# # =====================================================
# class ValidateRequest(BaseModel):
#     nisn: str
#     tanggal_lahir: str

# @router.post("/students/validate")
# async def validate_student(req: ValidateRequest):

#     conn = mysql.connector.connect(
#         host="localhost",
#         user="root",
#         password="",
#         database="absen_nepul"
#     )

#     cursor = conn.cursor(dictionary=True)

#     # cek siswa
#     cursor.execute("""
#         SELECT *
#         FROM student_data
#         WHERE nisn = %s
#         AND tanggal_lahir = %s
#     """, (req.nisn, req.tanggal_lahir))

#     student = cursor.fetchone()

#     if not student:
#         return {
#             "success": False,
#             "message": "Tanggal lahir salah"
#         }

#     # ambil presensi
#     cursor.execute("""
#         SELECT *
#         FROM attendance
#         WHERE nisn = %s
#         ORDER BY tanggal DESC
#     """, (req.nisn,))

#     attendance = cursor.fetchall()

#     return {
#         "success": True,
#         "attendance": attendance
#     }


# =====================================================
# HISTORY ABSENSI SEMUA SISWA
# =====================================================

@router.get("/attendance-history")
def get_attendance_history(
    kelas: str = "",
    tanggal: str = "",
    search: str = "",
    db: Session = Depends(get_db)
):

    try:

        sql = """
            SELECT
                a.id_absen,
                a.nis,
                a.nama_siswa,
                a.id_kelas,
                k.nama_kelas,
                a.tanggal,
                a.jam_masuk,
                a.jam_keluar,
                a.status_kehadiran,
                a.keterangan,
                a.foto_absen AS foto_masuk,
                a.foto_keluar,
                a.latitude_masuk,
                a.longitude_masuk,
                a.latitude_keluar,
                a.longitude_keluar
            FROM student_attendance_data a

            LEFT JOIN kelas k
            ON a.id_kelas = k.id

            WHERE 1=1
        """

        params = {}

        if kelas:
            sql += " AND k.nama_kelas = :kelas"
            params["kelas"] = kelas

        if tanggal:
            sql += " AND tanggal = :tanggal"
            params["tanggal"] = tanggal

        if search:
            sql += """
            AND (
                nama_siswa LIKE :search
                OR nis LIKE :search
            )
            """
            params["search"] = f"%{search}%"

        sql += " ORDER BY tanggal DESC"

        result = db.execute(
            text(sql),
            params
        ).fetchall()

        return [
            dict(row._mapping)
            for row in result
        ]

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )