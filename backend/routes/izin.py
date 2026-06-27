import os
import shutil
from datetime import datetime

from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db

router = APIRouter()


# =====================================================
# CONFIG UPLOAD
# =====================================================

UPLOAD_DIR = "uploads"


# =====================================================
# SUBMIT FORM IZIN + UPLOAD LAMPIRAN
# =====================================================

@router.post("/izin/submit")
def submit_izin(
    nis: str = Form(...),
    nama_siswa: str = Form(...),
    kelas: str = Form(...),
    tanggal: str = Form(...),
    alasan: str = Form(...),
    lampiran: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    try:

        lampiran_path = ""

        if lampiran:

            os.makedirs(UPLOAD_DIR, exist_ok=True)

            file_ext = os.path.splitext(
                lampiran.filename
            )[1]

            safe_filename = (
                f"{nis}_{tanggal}_{int(datetime.now().timestamp())}{file_ext}"
            )

            file_path = os.path.join(
                UPLOAD_DIR,
                safe_filename
            )

            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(
                    lampiran.file,
                    buffer
                )

            lampiran_path = file_path.replace("\\", "/")

        db.execute(text("""
            INSERT INTO data_form_izin
            (
                nis,
                nama_siswa,
                kelas,
                tanggal,
                lampiran,
                alasan,
                status,
                keterangan_admin
            )
            VALUES
            (
                :nis,
                :nama_siswa,
                :kelas,
                :tanggal,
                :lampiran,
                :alasan,
                'pending',
                ''
            )
        """), {
            "nis": nis,
            "nama_siswa": nama_siswa,
            "kelas": kelas,
            "tanggal": tanggal,
            "lampiran": lampiran_path,
            "alasan": alasan
        })

        db.commit()

        return {
            "success": True,
            "message": "Form izin berhasil dikirim",
            "lampiran": lampiran_path
        }

    except Exception as e:

        db.rollback()

        print("ERROR IZIN:", e)

        return {
            "success": False,
            "message": f"Gagal mengirim izin: {str(e)}"
        }


# =====================================================
# AMBIL FORM IZIN BERDASARKAN NIS
# =====================================================

@router.get("/permission-forms/{nis}")
def get_permission_forms_by_nis(
    nis: str,
    db: Session = Depends(get_db)
):
    try:

        data = db.execute(text("""
            SELECT
                nis,
                nama_siswa,
                kelas,
                tanggal,
                lampiran,
                alasan,
                status,
                keterangan_admin
            FROM data_form_izin
            WHERE nis = :nis
            ORDER BY tanggal DESC
        """), {
            "nis": nis
        }).mappings().all()

        return data

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# =====================================================
# AMBIL DATA PENGAJUAN IZIN
# =====================================================

@router.get("/izin")
def get_pengajuan_izin(
    db: Session = Depends(get_db)
):
    try:

        data = db.execute(text("""
            SELECT
                nis,
                nama_siswa,
                kelas,
                tanggal,
                lampiran,
                alasan,
                status,
                keterangan_admin
            FROM data_form_izin
            ORDER BY tanggal DESC
        """)).mappings().all()

        return data

    except Exception as e:

        return {
            "success": False,
            "error": str(e)
        }


# =====================================================
# UPDATE STATUS IZIN
# =====================================================

@router.post("/izin/update-status")
def update_status_izin(
    nis: str,
    tanggal: str,
    status: str,
    keterangan: str = "",
    db: Session = Depends(get_db)
):
    try:

        if status not in ["disetujui", "ditolak"]:

            return {
                "success": False,
                "error": "Status tidak valid"
            }

        # =========================================
        # UPDATE STATUS + KETERANGAN ADMIN
        # =========================================

        db.execute(text("""
            UPDATE data_form_izin
            SET
                status = :status,
                keterangan_admin = :keterangan_admin
            WHERE nis = :nis
            AND tanggal = :tanggal
        """), {
            "status": status,
            "keterangan_admin": keterangan,
            "nis": nis,
            "tanggal": tanggal
        })

        # =========================================
        # JIKA DISETUJUI -> MASUKKAN KE ABSENSI
        # =========================================

        if status == "disetujui":

            cek_absensi = db.execute(text("""
                SELECT id_absen
                FROM student_attendance_data
                WHERE nis = :nis
                AND tanggal = :tanggal
            """), {
                "nis": nis,
                "tanggal": tanggal
            }).fetchone()

            if not cek_absensi:

                data_izin = db.execute(text("""
                    SELECT
                        nis,
                        nama_siswa,
                        kelas,
                        tanggal,
                        alasan
                    FROM data_form_izin
                    WHERE nis = :nis
                    AND tanggal = :tanggal
                """), {
                    "nis": nis,
                    "tanggal": tanggal
                }).mappings().first()

                if data_izin:

                    db.execute(text("""
                        INSERT INTO student_attendance_data
                        (
                            nis,
                            nama_siswa,
                            id_kelas,
                            tanggal,
                            jam_masuk,
                            jam_keluar,
                            status_kehadiran,
                            keterangan
                        )
                        VALUES
                        (
                            :nis,
                            :nama_siswa,
                            :id_kelas,
                            :tanggal,
                            '00:00:00',
                            '00:00:00',
                            'izin',
                            :keterangan
                        )
                    """), {
                        "nis": data_izin["nis"],
                        "nama_siswa": data_izin["nama_siswa"],
                        "id_kelas": data_izin["kelas"],
                        "tanggal": data_izin["tanggal"],
                        "keterangan": data_izin["alasan"]
                    })

            else:

                db.execute(text("""
                    UPDATE student_attendance_data
                    SET
                        status_kehadiran = 'izin',
                        keterangan = :keterangan
                    WHERE nis = :nis
                    AND tanggal = :tanggal
                """), {
                    "nis": nis,
                    "tanggal": tanggal,
                    "keterangan": keterangan
                })

        # =========================================
        # NOTIFIKASI SISWA
        # =========================================

        title = "Pengajuan Izin"

        if status == "disetujui":

            pesan = (
                "Pengajuan izin kamu telah disetujui."
            )

        else:

            pesan = (
                f"Pengajuan izin kamu ditolak. "
                f"Alasan: {keterangan}"
            )

        db.execute(text("""
            INSERT INTO notifications
            (
                nis,
                title,
                message,
                is_read
            )
            VALUES
            (
                :nis,
                :title,
                :message,
                0
            )
        """), {
            "nis": nis,
            "title": title,
            "message": pesan
        })

        db.commit()

        return {
            "success": True,
            "message": f"Pengajuan berhasil {status}"
        }

    except Exception as e:

        db.rollback()

        print("ERROR UPDATE STATUS:", e)

        return {
            "success": False,
            "error": str(e)
        }