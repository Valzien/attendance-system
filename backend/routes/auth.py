from datetime import date

from fastapi import APIRouter, HTTPException, Depends
from database import engine, get_db, SessionLocal
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

router = APIRouter()

# =====================================================
# LOGIN
# =====================================================

class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
def login(payload: LoginRequest):

    username = payload.username.strip()
    password = payload.password.strip()

    db = SessionLocal()

    try:

        # =========================================
        # LOGIN GURU / ADMIN
        # =========================================

        teacher = db.execute(
            text("""
                SELECT
                    NIP,
                    Nama,
                    role
                FROM teacher_data
                WHERE username = :username
                AND password = :password
            """),
            {
                "username": username,
                "password": password
            }
        ).mappings().first()

        if teacher:

            return {
                "success": True,
                "role": teacher["role"],
                "name": teacher["Nama"],
                "nip": teacher["NIP"]
            }

        # =========================================
        # LOGIN SISWA
        # =========================================

        student = db.execute(
            text("""
                SELECT
                    s.nis,
                    s.nisn,
                    s.nama_siswa,
                    s.id_kelas,
                    k.nama_kelas
                FROM student_data s
                LEFT JOIN kelas k
                    ON s.id_kelas = k.id
                WHERE s.username = :username
                AND s.password = :password
            """),
            {
                "username": username,
                "password": password
            }
        ).mappings().first()

        if student:

            return {
                "success": True,
                "role": "siswa",
                "name": student["nama_siswa"],
                "nis": student["nis"],
                "nisn": student["nisn"],

                # INI YANG DIKIRIM KE FRONTEND
                "kelas": student["nama_kelas"]
            }

        raise HTTPException(
            status_code=401,
            detail="Username atau password salah"
        )

    finally:

        db.close()


# =====================================================
# ADMIN SUMMARY
# =====================================================

@router.get("/admin/summary")
def admin_summary():

    db = SessionLocal()

    today = date.today()

    try:

        total_students = db.execute(
            text("""
                SELECT COUNT(*)
                FROM student_data
            """)
        ).scalar()

        total_attendance_today = db.execute(
            text("""
                SELECT COUNT(*)
                FROM student_attendance_data
                WHERE tanggal = :today
            """),
            {
                "today": today
            }
        ).scalar()

        total_classes = db.execute(
            text("""
                SELECT COUNT(*)
                FROM kelas
            """)
        ).scalar()

        return {
            "total_students": int(total_students or 0),
            "attendance_today": int(total_attendance_today or 0),
            "total_classes": int(total_classes or 0),
        }

    finally:

        db.close()


# =====================================================
# AMBIL DATA KELAS
# =====================================================

@router.get("/kelas")
def get_kelas():

    query = text("""
        SELECT
            id,
            nama_kelas
        FROM kelas
        ORDER BY nama_kelas ASC
    """)

    with engine.connect() as conn:

        result = conn.execute(query)

        data = [
            dict(row._mapping)
            for row in result
        ]

    return data


# =====================================================
# AMBIL JADWAL BERDASARKAN KELAS
# =====================================================

@router.get("/jadwal/{kelas}")
def get_jadwal(kelas: str):

    query = text("""
        SELECT
            id_mapel,
            mapel,
            jam,
            hari,
            guru,
            kelas
        FROM jadwal_pelajaran
        WHERE kelas = :kelas
        ORDER BY hari ASC, jam ASC
    """)

    with engine.connect() as conn:

        result = conn.execute(
            query,
            {
                "kelas": kelas
            }
        )

        data = [
            dict(row._mapping)
            for row in result
        ]

    return data


# =====================================================
# SEARCH USER RESET PASSWORD
# =====================================================

@router.get("/admin/search-user")
def search_user(q: str):

    db = SessionLocal()

    try:

        # =========================================
        # CARI SISWA
        # =========================================

        siswa = db.execute(
            text("""
                SELECT
                    nis,
                    nisn,
                    nama_siswa
                FROM student_data
                WHERE nama_siswa LIKE :search
                LIMIT 1
            """),
            {
                "search": f"%{q}%"
            }
        ).mappings().first()

        if siswa:

            return {
                "found": True,
                "role": "siswa",
                "id": siswa["nis"],
                "name": siswa["nama_siswa"]
            }

        # =========================================
        # CARI GURU / ADMIN
        # =========================================

        guru = db.execute(
            text("""
                SELECT
                    NIP,
                    Nama,
                    role
                FROM teacher_data
                WHERE Nama LIKE :search
                LIMIT 1
            """),
            {
                "search": f"%{q}%"
            }
        ).mappings().first()

        if guru:

            return {
                "found": True,
                "role": guru["role"],
                "id": guru["NIP"],
                "name": guru["Nama"]
            }

        return {
            "found": False
        }

    finally:

        db.close()


# =====================================================
# RESET PASSWORD
# =====================================================

class ResetPasswordRequest(BaseModel):
    role: str
    user_id: str
    new_password: str


@router.post("/admin/reset-password")
def reset_password(payload: ResetPasswordRequest):

    db = SessionLocal()

    try:

        # =========================================
        # RESET PASSWORD SISWA
        # =========================================

        if payload.role == "siswa":

            db.execute(
                text("""
                    UPDATE student_data
                    SET password = :password
                    WHERE nis = :nis
                """),
                {
                    "password": payload.new_password,
                    "nis": payload.user_id
                }
            )

        # =========================================
        # RESET PASSWORD GURU / ADMIN
        # =========================================

        elif payload.role in ["guru", "admin"]:

            db.execute(
                text("""
                    UPDATE teacher_data
                    SET password = :password
                    WHERE NIP = :nip
                """),
                {
                    "password": payload.new_password,
                    "nip": payload.user_id
                }
            )

        else:

            raise HTTPException(
                status_code=400,
                detail="Role tidak valid"
            )

        db.commit()

        return {
            "success": True,
            "message": "Password berhasil direset"
        }

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db.close()


# =====================================================
# CHANGE PASSWORD
# =====================================================

class ChangePasswordRequest(BaseModel):
    username: str
    old_password: str
    new_password: str
    role: str


@router.post("/change-password")
def change_password(payload: ChangePasswordRequest):

    db = SessionLocal()

    try:

        # =========================================
        # GURU / ADMIN
        # =========================================

        if payload.role in ["guru", "admin"]:

            user = db.execute(
                text("""
                    SELECT *
                    FROM teacher_data
                    WHERE username = :username
                    AND password = :old_password
                """),
                {
                    "username": payload.username,
                    "old_password": payload.old_password
                }
            ).fetchone()

            if not user:

                return {
                    "success": False,
                    "message": "Password lama salah"
                }

            db.execute(
                text("""
                    UPDATE teacher_data
                    SET password = :new_password
                    WHERE username = :username
                """),
                {
                    "new_password": payload.new_password,
                    "username": payload.username
                }
            )

        # =========================================
        # SISWA
        # =========================================

        elif payload.role == "siswa":

            user = db.execute(
                text("""
                    SELECT *
                    FROM student_data
                    WHERE username = :username
                    AND password = :old_password
                """),
                {
                    "username": payload.username,
                    "old_password": payload.old_password
                }
            ).fetchone()

            if not user:

                return {
                    "success": False,
                    "message": "Password lama salah"
                }

            db.execute(
                text("""
                    UPDATE student_data
                    SET password = :new_password
                    WHERE username = :username
                """),
                {
                    "new_password": payload.new_password,
                    "username": payload.username
                }
            )

        else:

            return {
                "success": False,
                "message": "Role tidak valid"
            }

        db.commit()

        return {
            "success": True,
            "message": "Password berhasil diubah"
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        db.close()


# =====================================================
# PROFILE GURU
# =====================================================

@router.get("/teacher-profile/{nip}")
def get_teacher_profile(nip: str):

    db = SessionLocal()

    try:

        teacher = db.execute(
            text("""
                SELECT
                    NIP,
                    Nama,
                    Guru_Pengampu,
                    Tanggal_lahir,
                    Alamat,
                    Nomor_Telepon,
                    role,
                    username
                FROM teacher_data
                WHERE NIP = :nip
            """),
            {
                "nip": nip
            }
        ).fetchone()

        if not teacher:

            raise HTTPException(
                status_code=404,
                detail="Data guru tidak ditemukan"
            )

        return dict(teacher._mapping)

    finally:

        db.close()


# =====================================================
# PROFILE SISWA
# =====================================================

@router.get("/student-profile/{nisn}")
def get_student_profile(nisn: str):

    db = SessionLocal()

    try:

        student = db.execute(
            text("""
                SELECT
                    s.nis,
                    s.nisn,
                    s.nama_siswa,
                    s.id_kelas,
                    k.nama_kelas,
                    s.wali_kelas,
                    s.alamat,
                    s.username,
                    s.no_wa_siswa,
                    s.no_wa_ortu,
                    s.tanggal_lahir
                FROM student_data s
                LEFT JOIN kelas k
                    ON s.id_kelas = k.id
                WHERE s.nisn = :nisn
            """),
            {
                "nisn": nisn
            }
        ).fetchone()

        if not student:

            raise HTTPException(
                status_code=404,
                detail="Siswa tidak ditemukan"
            )

        return dict(student._mapping)

    finally:

        db.close()


# =====================================================
# HISTORY ABSENSI SISWA SENDIRI
# =====================================================

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


# =====================================================
# GET ALL TEACHERS
# =====================================================

@router.get("/teachers")
def get_teachers():

    db = SessionLocal()

    try:

        teachers = db.execute(
            text("""
                SELECT
                    NIP,
                    Nama,
                    Tanggal_lahir,
                    Guru_Pengampu,
                    Alamat,
                    Nomor_Telepon,
                    username,
                    role
                FROM teacher_data
                ORDER BY Nama ASC
            """)
        ).mappings().all()

        return teachers

    finally:

        db.close()


# =====================================================
# UPDATE ROLE GURU / ADMIN
# =====================================================

class UpdateRoleRequest(BaseModel):
    nip: str
    role: str


@router.post("/admin/update-role")
def update_role(payload: UpdateRoleRequest):

    db = SessionLocal()

    try:

        if payload.role not in ["admin", "guru"]:

            return {
                "success": False,
                "message": "Role tidak valid"
            }

        db.execute(
            text("""
                UPDATE teacher_data
                SET role = :role
                WHERE NIP = :nip
            """),
            {
                "role": payload.role,
                "nip": payload.nip
            }
        )

        db.commit()

        return {
            "success": True,
            "message": "Role berhasil diupdate"
        }

    except Exception as e:

        db.rollback()

        return {
            "success": False,
            "message": str(e)
        }

    finally:

        db.close()