from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from sqlalchemy import text
import os
import base64

from database import get_db
from utils.location import hitung_jarak
from utils.whatsapp import kirim_wa


# =====================================================
# REQUEST MODEL
# =====================================================

class AbsenRequest(BaseModel):
    nis: str
    latitude: float
    longitude: float
    accuracy: float
    image_base64: str


class UpdateAttendanceStatusRequest(BaseModel):
    status_kehadiran: str
    keterangan: str = ""


router = APIRouter()


# =====================================================
# CONFIG GPS SEKOLAH
# =====================================================

SEKOLAH_LAT = -6.2817627
SEKOLAH_LON = 106.7205926

MAX_RADIUS = 1000
MAX_ACCURACY = 100


# =====================================================
# FUNCTION SIMPAN FOTO
# =====================================================

def simpan_foto_absen(
    image_base64,
    nama_kelas,
    nis
):

    try:

        # =====================================
        # VALIDASI IMAGE
        # =====================================

        if not image_base64:

            raise Exception("Image kosong")

        if "," not in image_base64:

            raise Exception("Format base64 tidak valid")

        # =====================================
        # BASE DIRECTORY
        # =====================================

        BASE_DIR = os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )

        # =====================================
        # FOLDER
        # =====================================

        folder = os.path.join(
            BASE_DIR,
            "attendance_photos",
            str(nama_kelas),
            str(nis)
        )

        os.makedirs(
            folder,
            exist_ok=True
        )

        # =====================================
        # FILE NAME
        # =====================================

        filename = datetime.now().strftime(
            "%Y-%m-%d_%H-%M-%S.jpg"
        )

        filepath = os.path.join(
            folder,
            filename
        )

        # =====================================
        # DECODE BASE64
        # =====================================

        image_data = image_base64.split(",")[1]

        with open(filepath, "wb") as f:

            f.write(
                base64.b64decode(image_data)
            )

        print("FOTO BERHASIL DISIMPAN:")
        print(filepath)

        relative_path = os.path.join(
            "attendance_photos",
            str(nama_kelas),
            str(nis),
            filename
        )

        return relative_path.replace("\\", "/")

    except Exception as e:

        print("ERROR SIMPAN FOTO:", str(e))

        raise Exception(
            f"Gagal simpan foto: {str(e)}"
        )


# =====================================================
# ABSEN MASUK
# =====================================================

@router.post("/absen/masuk")
def absen_masuk(
    payload: AbsenRequest,
    db: Session = Depends(get_db)
):

    now = datetime.now()

    jam = now.time()
    tanggal = now.date()

    batas_buka = datetime.strptime(
        "06:45",
        "%H:%M"
    ).time()

    batas_terlambat = datetime.strptime(
        "07:45",
        "%H:%M"
    ).time()

    batas_tutup = datetime.strptime(
        "08:00",
        "%H:%M"
    ).time()

    # =========================================
    # VALIDASI WAKTU
    # =========================================

    if jam < batas_buka:

        raise HTTPException(
            status_code=400,
            detail="Belum waktu absen"
        )

    if jam > batas_tutup:

        status = "alfa"
        keterangan = "Melewati batas waktu absen"

    elif jam > batas_terlambat:

        status = "terlambat"
        keterangan = "Datang terlambat"

    else:

        status = "hadir"
        keterangan = "-"

    # =========================================
    # SUDAH ABSEN?
    # =========================================

    cek = db.execute(
        text("""
            SELECT id_absen
            FROM student_attendance_data
            WHERE nis = :nis
            AND tanggal = :tanggal
        """),
        {
            "nis": payload.nis,
            "tanggal": tanggal
        }
    ).fetchone()

    if cek:

        raise HTTPException(
            status_code=400,
            detail="Kamu sudah absen hari ini"
        )

    # =========================================
    # AMBIL DATA SISWA
    # =========================================

    siswa = db.execute(
        text("""
            SELECT
                s.nis,
                s.nama_siswa,
                s.id_kelas,
                s.no_wa_ortu,
                k.nama_kelas
            FROM student_data s
            JOIN kelas k
                ON s.id_kelas = k.id
            WHERE s.nis = :nis
        """),
        {
            "nis": payload.nis
        }
    ).fetchone()

    if not siswa:

        raise HTTPException(
            status_code=404,
            detail="Data siswa tidak ditemukan"
        )

    # =========================================
    # VALIDASI GPS
    # =========================================

    jarak = hitung_jarak(
        payload.latitude,
        payload.longitude,
        SEKOLAH_LAT,
        SEKOLAH_LON
    )

    print("JARAK:", jarak)
    print("ACCURACY:", payload.accuracy)

    if jarak > MAX_RADIUS:

        raise HTTPException(
            status_code=400,
            detail=f"Kamu berada di luar area sekolah ({int(jarak)} meter)"
        )

    if payload.accuracy > MAX_ACCURACY:

        raise HTTPException(
            status_code=400,
            detail=f"GPS tidak valid / terindikasi fake GPS (accuracy: {payload.accuracy} m)"
        )

    # =========================================
    # SIMPAN FOTO
    # =========================================

    try:

        foto_path = simpan_foto_absen(
            payload.image_base64,
            siswa.nama_kelas,
            siswa.nis
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    # =========================================
    # INSERT ABSENSI
    # =========================================

    try:

        db.execute(
            text("""
                INSERT INTO student_attendance_data
                (
                    nis,
                    nama_siswa,
                    id_kelas,
                    tanggal,
                    jam_masuk,
                    status_kehadiran,
                    keterangan,
                    latitude_masuk,
                    latitude_keluar,
                    longitude_masuk,
                    longitude_keluar,
                    foto_absen,
                    foto_keluar
                )
                VALUES
                (
                    :nis,
                    :nama_siswa,
                    :id_kelas,
                    :tanggal,
                    :jam_masuk,
                    :status,
                    :keterangan,
                    :latitude_masuk,
                    :latitude_keluar,
                    :longitude_masuk,
                    :longitude_keluar,
                    :foto_absen,
                    :foto_keluar
                )
            """),
                {
                    "nis": payload.nis,
                    "nama_siswa": siswa.nama_siswa,
                    "id_kelas": siswa.id_kelas,
                    "tanggal": tanggal,
                    "jam_masuk": jam,
                    "status": status,
                    "keterangan": keterangan,

                    "latitude_masuk": payload.latitude,
                    "longitude_masuk": payload.longitude,

                    "latitude_keluar": None,
                    "longitude_keluar": None,

                    "foto_absen": foto_path,
                    "foto_keluar": None,
                }
        )

        db.commit()

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Insert absensi gagal: {str(e)}"
        )

    # =========================================
    # WHATSAPP
    # =========================================

    try:

        pesan = f"""
Halo Bapak/Ibu,

Ananda {siswa.nama_siswa}
telah melakukan absen masuk
pada {str(jam)}

Status Kehadiran: {status.upper()}

Terima kasih.
SMAN 10 Tangerang Selatan
"""

        if siswa.no_wa_ortu:

            kirim_wa(
                siswa.no_wa_ortu,
                pesan
            )

    except Exception as e:

        print("WA gagal dikirim:", str(e))

    return {
        "success": True,
        "message": "Absen masuk berhasil",
        "status": status,
        "jam_masuk": str(jam),
        "tanggal": str(tanggal),
        "foto_path": foto_path
    }


# =====================================================
# ABSEN KELUAR
# =====================================================

@router.post("/absen/keluar")
def absen_keluar(
    payload: AbsenRequest,
    db: Session = Depends(get_db)
):

    now = datetime.now()

    jam = now.time()
    tanggal = now.date()

    data = db.execute(
        text("""
            SELECT *
            FROM student_attendance_data
            WHERE nis = :nis
            AND tanggal = :tanggal
        """),
        {
            "nis": payload.nis,
            "tanggal": tanggal
        }
    ).fetchone()

    if not data:

        raise HTTPException(
            status_code=400,
            detail="Kamu belum absen masuk"
        )

    if data.jam_keluar is not None:

        raise HTTPException(
            status_code=400,
            detail="Kamu sudah absen keluar"
        )

    # =========================================
    # AMBIL JAM PULANG
    # =========================================

    kelas = db.execute(
        text("""
            SELECT
                k.jam_pulang,
                k.nama_kelas
            FROM student_data s
            JOIN kelas k
                ON s.id_kelas = k.id
            WHERE s.nis = :nis
        """),
        {
            "nis": payload.nis
        }
    ).fetchone()

    if not kelas:

        raise HTTPException(
            status_code=404,
            detail="Data kelas tidak ditemukan"
        )

    jam_pulang = kelas.jam_pulang

    if isinstance(jam_pulang, timedelta):

        jam_pulang = (
            datetime.min + jam_pulang
        ).time()

    if jam < jam_pulang:

        raise HTTPException(
            status_code=400,
            detail=f"Belum waktunya pulang ({jam_pulang})"
        )

    # =========================================
    # VALIDASI GPS
    # =========================================

    jarak = hitung_jarak(
        payload.latitude,
        payload.longitude,
        SEKOLAH_LAT,
        SEKOLAH_LON
    )

    print("JARAK:", jarak)
    print("ACCURACY:", payload.accuracy)

    if jarak > MAX_RADIUS:

        raise HTTPException(
            status_code=400,
            detail=f"Kamu berada di luar area sekolah ({int(jarak)} meter)"
        )

    if payload.accuracy > MAX_ACCURACY:

        raise HTTPException(
            status_code=400,
            detail=f"GPS tidak valid / terindikasi fake GPS (accuracy: {payload.accuracy} m)"
        )

    # =========================================
    # SIMPAN FOTO
    # =========================================

    try:

        foto_keluar = simpan_foto_absen(
            payload.image_base64,
            kelas.nama_kelas,
            payload.nis
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    # =========================================
    # UPDATE ABSEN KELUAR
    # =========================================

    try:

        db.execute(
            text("""
                UPDATE student_attendance_data
                SET
                    jam_keluar = :jam_keluar,
                    foto_keluar = :foto_keluar,
                    latitude_keluar = :latitude_keluar,
                    longitude_keluar = :longitude_keluar
                WHERE nis = :nis
                AND tanggal = :tanggal
            """),
            {
                "jam_keluar": jam,
                "foto_keluar": foto_keluar,
                "latitude_keluar": payload.latitude,
                "longitude_keluar": payload.longitude,
                "nis": payload.nis,
                "tanggal": tanggal
            }
        )

        db.commit()

    except Exception as e:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=f"Update absen keluar gagal: {str(e)}"
        )

    return {
        "success": True,
        "message": "Absen keluar berhasil",
        "jam_keluar": str(jam),
        "tanggal": str(tanggal),
        "foto_keluar": foto_keluar
    }