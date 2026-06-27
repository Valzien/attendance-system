from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy import text
from database import SessionLocal
import pandas as pd
import math
import traceback

router = APIRouter()


@router.post("/teachers/import")
async def import_teachers(
    file: UploadFile = File(...)
):

    # =========================
    # VALIDASI FILE
    # =========================
    if not file.filename.endswith(".xlsx"):

        raise HTTPException(
            status_code=400,
            detail="File harus .xlsx"
        )

    db = SessionLocal()

    try:

        # =========================
        # BACA EXCEL
        # =========================
        df = pd.read_excel(file.file)

        # =========================
        # NORMALISASI KOLOM
        # =========================
        df.columns = (
            df.columns
            .str.strip()
            .str.lower()
        )

        print("KOLOM EXCEL:")
        print(df.columns.tolist())

        # =========================
        # VALIDASI KOLOM
        # =========================
        required_columns = [
            "nip",
            "nama",
            "tanggal_lahir",
            "alamat",
            "guru_pengampu",
            "nomor_telepon",
            "username",
            "password",
            "role"
        ]

        for col in required_columns:

            if col not in df.columns:

                raise HTTPException(
                    status_code=400,
                    detail=f"Kolom '{col}' tidak ditemukan"
                )

        inserted = 0
        skipped = 0

        # =========================
        # CLEAN VALUE
        # =========================
        def clean_value(value):

            if pd.isna(value):
                return None

            if isinstance(value, float):

                if math.isnan(value):
                    return None

                if value.is_integer():
                    return str(int(value))

            return str(value).strip()

        # =========================
        # LOOP DATA
        # =========================
        for _, row in df.iterrows():

            try:

                nip = clean_value(row["nip"])

                # SKIP BARIS KOSONG
                if not nip:
                    skipped += 1
                    continue

                # CEK DUPLIKAT
                existing = db.execute(
                    text("""
                        SELECT nip
                        FROM teacher_data
                        WHERE nip = :nip
                    """),
                    {
                        "nip": nip
                    }
                ).fetchone()

                if existing:
                    skipped += 1
                    continue

                # FORMAT TANGGAL
                tanggal_lahir = None

                if not pd.isna(row["tanggal_lahir"]):

                    tanggal_lahir = (
                        pd.to_datetime(
                            row["tanggal_lahir"]
                        ).strftime("%Y-%m-%d")
                    )

                # INSERT
                db.execute(
                    text("""
                        INSERT INTO teacher_data
                        (
                            nip,
                            nama,
                            tanggal_lahir,
                            alamat,
                            guru_pengampu,
                            nomor_telepon,
                            username,
                            password,
                            role
                        )
                        VALUES
                        (
                            :nip,
                            :nama,
                            :tanggal_lahir,
                            :alamat,
                            :guru_pengampu,
                            :nomor_telepon,
                            :username,
                            :password,
                            :role
                        )
                    """),
                    {
                        "nip": nip,
                        "nama": clean_value(row["nama"]),
                        "tanggal_lahir": tanggal_lahir,
                        "alamat": clean_value(row["alamat"]),
                        "guru_pengampu": clean_value(row["guru_pengampu"]),
                        "nomor_telepon": clean_value(row["nomor_telepon"]),
                        "username": clean_value(row["username"]),
                        "password": clean_value(row["password"]),
                        "role": clean_value(row["role"]),
                    }
                )

                inserted += 1

            except Exception as row_error:

                print("ERROR ROW:")
                print(row.to_dict())
                print(row_error)

                skipped += 1

        db.commit()

        return {
            "success": True,
            "inserted": inserted,
            "skipped": skipped,
            "message": f"{inserted} data berhasil diimport"
        }

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db.close()