from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from database import get_db

router = APIRouter()


@router.get("/notifications/{nis}")
def get_notifications(
    nis: str,
    db: Session = Depends(get_db)
):
    data = db.execute(text("""
        SELECT *
        FROM notifications
        WHERE nis = :nis
        ORDER BY created_at DESC
    """), {
        "nis": nis
    }).mappings().all()

    return data

@router.get("/notifications/unread-count/{nis}")
def unread_count(
    nis: str,
    db: Session = Depends(get_db)
):
    try:

        total = db.execute(text("""
            SELECT COUNT(*) as total
            FROM notifications
            WHERE nis = :nis
            AND is_read = 0
        """), {
            "nis": nis
        }).fetchone()

        return {
            "total": total.total
        }

    except Exception as e:
        return {
            "error": str(e)
        }

@router.post("/notifications/read/{nis}")
def read_notifications(
    nis: str,
    db: Session = Depends(get_db)
):
    try:

        db.execute(text("""
            UPDATE notifications
            SET is_read = 1
            WHERE nis = :nis
            AND is_read = 0
        """), {
            "nis": nis
        })

        db.commit()

        return {
            "message": "Notif dibaca"
        }

    except Exception as e:
        return {
            "error": str(e)
        }
    
# =====================================================
# NOTIFIKASI ADMIN - PENGAJUAN IZIN BARU
# =====================================================

@router.get("/admin/notifications")
def get_admin_notifications(db: Session = Depends(get_db)):
    try:
        data = db.execute(text("""
            SELECT
                nis,
                nama_siswa,
                kelas,
                tanggal,
                alasan,
                lampiran,
                status
            FROM data_form_izin
            WHERE status = 'pending'
               OR status IS NULL
               OR status = ''
            ORDER BY tanggal DESC
        """)).mappings().all()

        return data

    except Exception as e:
        return {"error": str(e)}

# =====================================================
# COUNT NOTIFIKASI ADMIN
# =====================================================

@router.get("/admin/notifications/count")
def get_admin_notification_count(
    db: Session = Depends(get_db)
):

    try:

        total = db.execute(text("""
            SELECT COUNT(*) as total
            FROM data_form_izin
            WHERE status = 'pending'
               OR status IS NULL
               OR status = ''
        """)).fetchone()

        return {
            "total": total.total
        }

    except Exception as e:

        return {
            "total": 0,
            "error": str(e)
        }


# =====================================================
# COUNT NOTIFIKASI GURU
# =====================================================

@router.get("/guru/notifications/count")
def guru_notification_count(
    db: Session = Depends(get_db)
):
    try:

        total = db.execute(text("""
            SELECT COUNT(*) AS total
            FROM data_form_izin
            WHERE (
                status = 'pending'
                OR status = 'disetujui'
                OR status = 'ditolak'
            )
            AND (
                guru_read = 0
                OR guru_read IS NULL
            )
        """)).fetchone()

        return {
            "total": total.total
        }

    except Exception as e:

        return {
            "total": 0,
            "error": str(e)
        }

# =====================================================
# MARK NOTIFIKASI GURU SUDAH DIBACA
# =====================================================

@router.post("/guru/notifications/read")
def read_guru_notifications(
    db: Session = Depends(get_db)
):
    try:

        db.execute(text("""
            UPDATE data_form_izin
            SET guru_read = 1
            WHERE guru_read = 0
               OR guru_read IS NULL
        """))

        db.commit()

        return {
            "success": True
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }    

@router.post("/admin/approve/{id}")
def approve_izin(
    id: int,
    db: Session = Depends(get_db)
):

    try:

        # update status
        db.execute(text("""
            UPDATE data_form_izin
            SET status = 'disetujui'
            WHERE id = :id
        """), {
            "id": id
        })

        # ambil data siswa
        siswa = db.execute(text("""
            SELECT nis, nama_siswa
            FROM data_form_izin
            WHERE id = :id
        """), {
            "id": id
        }).fetchone()

        # insert notif
        db.execute(text("""
            INSERT INTO notifications
            (
                nis,
                title,
                message,
                is_read,
                created_at
            )
            VALUES
            (
                :nis,
                :title,
                :message,
                0,
                NOW()
            )
        """), {
            "nis": siswa.nis,
            "title": "Pengajuan Disetujui",
            "message": "Pengajuan izin kamu telah disetujui admin"
        })

        db.commit()

        return {
            "success": True
        }

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }    
