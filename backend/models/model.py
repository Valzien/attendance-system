from sqlalchemy import Column, String, Integer, Date, Time, Enum
from database import Base

class Attendance(Base):
    __tablename__ = "student_attendance_data"

    id_absen = Column(Integer, primary_key=True)
    nis = Column(String(12))
    tanggal = Column(Date)
    jam_masuk = Column(Time)
    jam_keluar = Column(Time)
    status_kehadiran = Column(Enum('hadir','terlambat','alfa'))