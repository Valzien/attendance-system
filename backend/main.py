from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from database import engine
from routes import (
    auth,
    absensi,
    orangtua,
    data,
    izin,
    notif,
    student_import,
    teacher_import,
    jadwal_import,
)
from jam_pulang import router as jam_pulang_router

# Pastikan folder upload ada
Path("uploads").mkdir(exist_ok=True)
Path("attendance_photos").mkdir(exist_ok=True)

app = FastAPI(
    title="Attendance API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.attendance-system-1uj\.pages\.dev",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router
app.include_router(teacher_import.router)
app.include_router(auth.router)
app.include_router(absensi.router)
app.include_router(orangtua.router)
app.include_router(data.router)
app.include_router(izin.router)
app.include_router(notif.router)
app.include_router(student_import.router)
app.include_router(jadwal_import.router)
app.include_router(jam_pulang_router)

# Static files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

app.mount(
    "/attendance_photos",
    StaticFiles(directory="attendance_photos"),
    name="attendance_photos"
)

# Root
@app.get("/")
def root():
    return {
        "status": "success",
        "message": "API Absensi Jalan 🔥"
    }

# Test Database
@app.get("/test-db")
def test_db():
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))

        return {
            "status": "success",
            "database": "connected ✅"
        }

    except Exception as e:
        return {
            "status": "failed",
            "error": str(e)
        }