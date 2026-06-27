from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy import text
from database import SessionLocal
import pandas as pd
import traceback
import math

router = APIRouter()


@router.post("/students/import")
async def import_students(
    file: UploadFile = File(...)
):

    # VALIDASI FILE
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
            .str.replace("*", "", regex=False)
            .str.replace("(1-21)", "", regex=False)
            .str.strip()
        )

        print("KOLOM EXCEL:")
        print(df.columns.tolist())

        # =========================
        # VALIDASI KOLOM
        # =========================
        required_columns = [
            "nis",
            "nisn",
            "nama_siswa",
            "id_kelas",
            "wali_kelas",
            "alamat",
            "no_wa_siswa",
            "no_wa_ortu",
            "tanggal_lahir",
            "username",
            "password"
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

            # HANDLE NULL / NaN / NaT
            if pd.isna(value):
                return None

            # HANDLE STRING "NaT"
            if str(value).strip().lower() in ["nat", "nan", "none", ""]:
                return None

            # HANDLE FLOAT
            if isinstance(value, float):

                if math.isnan(value):
                    return None

                # HILANGKAN .0
                if value.is_integer():
                    return str(int(value))

            return str(value).strip()

        # =========================
        # HAPUS BARIS KOSONG TOTAL
        # =========================
        df = df.dropna(how="all")

        # =========================
        # LOOP DATA
        # =========================
        for index, row in df.iterrows():

            try:

                nis = clean_value(row["nis"])
                nisn = clean_value(row["nisn"])

                print(f"ROW {index + 2}")
                print("NIS :", nis)
                print("NISN:", nisn)

                # =========================
                # SKIP DATA KOSONG
                # =========================
                if not nis or not nisn:
                    skipped += 1
                    print("SKIP: NIS/NISN kosong")
                    continue

                # =========================
                # CEK DUPLIKAT NIS
                # =========================
                existing_nis = db.execute(
                    text("""
                        SELECT nis
                        FROM student_data
                        WHERE nis = :nis
                    """),
                    {"nis": nis}
                ).fetchone()

                if existing_nis:
                    skipped += 1
                    print(f"SKIP DUPLIKAT NIS: {nis}")
                    continue

                # =========================
                # CEK DUPLIKAT NISN
                # =========================
                existing_nisn = db.execute(
                    text("""
                        SELECT nisn
                        FROM student_data
                        WHERE nisn = :nisn
                    """),
                    {"nisn": nisn}
                ).fetchone()

                if existing_nisn:
                    skipped += 1
                    print(f"SKIP DUPLIKAT NISN: {nisn}")
                    continue

                # =========================
                # FORMAT TANGGAL
                # =========================
                tanggal_lahir = None

                if not pd.isna(row["tanggal_lahir"]):

                    tanggal_lahir = (
                        pd.to_datetime(row["tanggal_lahir"])
                        .strftime("%Y-%m-%d")
                    )

                # =========================
                # INSERT DATABASE
                # =========================
                db.execute(
                    text("""
                        INSERT INTO student_data
                        (
                            nis,
                            nisn,
                            nama_siswa,
                            id_kelas,
                            wali_kelas,
                            alamat,
                            username,
                            password,
                            no_wa_siswa,
                            no_wa_ortu,
                            tanggal_lahir
                        )
                        VALUES
                        (
                            :nis,
                            :nisn,
                            :nama_siswa,
                            :id_kelas,
                            :wali_kelas,
                            :alamat,
                            :username,
                            :password,
                            :no_wa_siswa,
                            :no_wa_ortu,
                            :tanggal_lahir
                        )
                    """),
                    {
                        "nis": nis,
                        "nisn": nisn,
                        "nama_siswa": clean_value(row["nama_siswa"]),
                        "id_kelas": int(row["id_kelas"]) if clean_value(row["id_kelas"]) else None,
                        "wali_kelas": clean_value(row["wali_kelas"]),
                        "alamat": clean_value(row["alamat"]),
                        "username": nisn,
                        "password": clean_value(row["password"]),
                        "no_wa_siswa": clean_value(row["no_wa_siswa"]),
                        "no_wa_ortu": clean_value(row["no_wa_ortu"]),
                        "tanggal_lahir": tanggal_lahir
                    }
                )

                inserted += 1

            except Exception as e:

                print("\n========== ERROR IMPORT ==========")
                print(f"BARIS EXCEL: {index + 2}")
                traceback.print_exc()
                print("==================================\n")

                skipped += 1
                continue

        # =========================
        # COMMIT
        # =========================
        db.commit()

        return {
            "success": True,
            "inserted": inserted,
            "skipped": skipped
        }

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db.close()