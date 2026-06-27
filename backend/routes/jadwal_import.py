from fastapi import APIRouter, UploadFile, File, HTTPException
from sqlalchemy import text
from database import SessionLocal
import pandas as pd
import math
import traceback

router = APIRouter()


@router.post("/schedules/import")
async def import_schedules(
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
            "id_mapel",
            "mapel",
            "jam",
            "hari",
            "guru",
            "kelas"
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

                id_mapel = clean_value(row["id_mapel"])

                # SKIP BARIS KOSONG
                if not id_mapel:
                    skipped += 1
                    continue

                db.execute(
                    text("""
                        INSERT INTO jadwal_pelajaran
                        (
                            id_mapel,
                            mapel,
                            jam,
                            hari,
                            guru,
                            kelas
                        )
                        VALUES
                        (
                            :id_mapel,
                            :mapel,
                            :jam,
                            :hari,
                            :guru,
                            :kelas
                        )
                    """),
                    {
                        "id_mapel": id_mapel,
                        "mapel": clean_value(row["mapel"]),
                        "jam": clean_value(row["jam"]),
                        "hari": clean_value(row["hari"]),
                        "guru": clean_value(row["guru"]),
                        "kelas": clean_value(row["kelas"]),
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
            "message": f"{inserted} jadwal berhasil diimport"
        }

    except Exception as e:

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

    finally:

        db.close()