import { useState, useEffect } from 'react';
import Layout from "./Layout";
import { ChevronDown } from 'lucide-react';

export default function JadwalPelajaran() {

  const [selectedClass, setSelectedClass] = useState('');
  const [kelasList, setKelasList] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // FORMAT JAM
  // =========================
  const formatJam = (value) => {
    if (!value) return '-';
    if (typeof value === 'number') {
      const jam = Math.floor(value / 3600).toString().padStart(2, '0');
      const menit = Math.floor((value % 3600) / 60).toString().padStart(2, '0');
      return `${jam}:${menit}`;
    }
    return String(value).split(':').slice(0, 2).join(':');
  };

  // =========================
  // GET KELAS
  // =========================
  const fetchKelas = async () => {
    try {
      const res = await fetch('http://localhost:8000/classes');
      const data = await res.json();
      setKelasList(Array.isArray(data) ? data : []);
      if (data.length > 0) {
        setSelectedClass(data[0].nama_kelas);
      }
    } catch (error) {
      console.error(error);
      setKelasList([]);
    }
  };

  // =========================
  // GET JADWAL
  // =========================
  const fetchSchedule = async (kelas) => {
    if (!kelas) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/schedules/class/${kelas}`);
      const data = await res.json();
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setScheduleData([]);
    }
    setLoading(false);
  };

  // =========================
  // LOAD AWAL
  // =========================
  useEffect(() => {
    fetchKelas();
  }, []);

  // =========================
  // LOAD JADWAL
  // =========================
  useEffect(() => {
    if (selectedClass) {
      fetchSchedule(selectedClass);
    }
  }, [selectedClass]);

  return (
    <Layout>
      <div className="space-y-5">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-black text-[#1d2433]">
            Jadwal Pelajaran
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Lihat jadwal pelajaran setiap kelas
          </p>
        </div>

        {/* TOP BAR */}
        <div className="flex justify-end">
          <div className="relative">
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="
                appearance-none
                bg-white
                border
                border-gray-200
                text-[13px]
                font-bold
                text-[#1d2433]
                py-3
                pl-4
                pr-10
                rounded-xl
                outline-none
                cursor-pointer
                shadow-sm
                hover:border-gray-300
                transition-colors
                min-w-[180px]
              "
            >
              {kelasList.map((kelas) => (
                <option key={kelas.id} value={kelas.nama_kelas}>
                  {kelas.nama_kelas}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
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
                  scheduleData.map((item) => (
                    <tr
                      key={item.id_mapel}
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
                  ))
                )}
              </tbody>

            </table>
          </div>
        </div>

      </div>
    </Layout>
  );
}