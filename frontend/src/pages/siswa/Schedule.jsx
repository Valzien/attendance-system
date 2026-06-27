import { useState, useEffect } from 'react';
import Layout from "./Layout";

export default function JadwalPelajaran() {

  const [kelasSiswa, setKelasSiswa] =
    useState('');

  const [scheduleData, setScheduleData] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // =====================================
  // FORMAT JAM
  // =====================================

  const formatJam = (value) => {

    if (!value) return '-';

    if (typeof value === 'number') {

      const jam = Math.floor(value / 3600)
        .toString()
        .padStart(2, '0');

      const menit = Math.floor((value % 3600) / 60)
        .toString()
        .padStart(2, '0');

      return `${jam}:${menit}`;
    }

    return String(value)
      .split(':')
      .slice(0, 2)
      .join(':');
  };

  // =====================================
  // LOAD PROFILE SISWA
  // =====================================

  const loadStudentProfile = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user?.nisn) {

        console.error(
          "User belum login"
        );

        return;
      }

      // =========================
      // GET PROFILE
      // =========================

      const response = await fetch(
        `http://localhost:8000/student-profile/${user.nisn}`
      );

      const profile =
        await response.json();

      console.log(
        "PROFILE:",
        profile
      );

    if (profile?.nama_kelas) {

      setKelasSiswa(
        profile.nama_kelas
      );

      fetchSchedule(
        profile.nama_kelas
      );

    }

    } catch (error) {

      console.error(error);

    }

  };

  // =====================================
  // GET JADWAL
  // =====================================

  const fetchSchedule = async (
    kelas
  ) => {

    setLoading(true);

    try {

      const response = await fetch(
        `http://localhost:8000/schedules/class/${kelas}`
      );

      const data =
        await response.json();

      console.log(
        "SCHEDULE:",
        data
      );

      setScheduleData(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(error);

      setScheduleData([]);

    }

    setLoading(false);

  };

  // =====================================
  // LOAD AWAL
  // =====================================

  useEffect(() => {

    loadStudentProfile();

  }, []);

  return (
    <Layout>
      <div className="space-y-5">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-black text-[#1d2433]">
            Jadwal Pelajaran
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Kelas : {kelasSiswa || '-'}
          </p>
        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">

              <thead>
                <tr className="bg-[#f8f9fa] border-b border-gray-100">
                  <th className="py-4 px-5 text-left text-[11px] font-black text-gray-400 uppercase">ID</th>
                  <th className="py-4 px-5 text-left text-[11px] font-black text-gray-400 uppercase">Mata Pelajaran</th>
                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">Jam</th>
                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">Hari</th>
                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">Guru</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-[#1d2433] animate-spin" />
                        <p className="text-[12px] text-gray-400 font-medium">Memuat data...</p>
                      </div>
                    </td>
                  </tr>
                ) : scheduleData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-16 text-center">
                      <p className="text-[13px] text-gray-400 font-semibold">Tidak ada jadwal</p>
                      <p className="text-[11px] text-gray-300 mt-1">Belum ada data jadwal pelajaran</p>
                    </td>
                  </tr>
                ) : (
                  scheduleData.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-5 text-[13px] font-bold text-[#1d2433]">{item.id_mapel}</td>
                        <td className="py-4 px-5 text-[13px] font-black text-[#1d2433]">{item.mapel}</td>
                        <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">{formatJam(item.jam)}</td>
                        <td className="py-4 px-4">
                          <span className="bg-[#cbeeff] text-[#2f6fa1] text-[12px] font-black px-3 py-1 rounded-lg">
                            {item.hari}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">{item.guru}</td>
                      </tr>
                    )
                  )
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}