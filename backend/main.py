from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from routes import auth, absensi, orangtua, data, izin, notif, student_import, face, teacher_import, jadwal_import
from database import engine
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from jam_pulang import router as jam_pulang_router



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(teacher_import.router)
app.include_router(auth.router)
app.include_router(absensi.router)
app.include_router(orangtua.router)
app.include_router(data.router)
app.include_router(izin.router)
app.include_router(notif.router)
app.include_router(student_import.router)
app.include_router(jadwal_import.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(face.router)
app.include_router(jam_pulang_router)
app.mount(
    "/attendance_photos",
    StaticFiles(directory="attendance_photos"),
    name="attendance_photos"
)

@app.get("/")
def root():
    return {"message": "API Absensi Jalan 🔥"}

@app.get("/test-db")
def test_db():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return {"db": "connected ✅"}