import { useEffect, useState } from 'react';

import {
  useLocation,
  useNavigate
} from 'react-router-dom';

import {
  Clock,
  ArrowLeft
} from 'lucide-react';

const formatTanggal = (dateStr) =>
  new Date(dateStr).toLocaleDateString(
    'id-ID',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }
  );

const formatTime = (val) => {

  if (val === null || val === undefined) {
    return '-';
  }

  // kalau format "08:00:00"
  if (
    typeof val === 'string' &&
    val.includes(':')
  ) {
    return val.slice(0, 5);
  }

  // convert ke number
  const num = Number(val);

  // kalau ternyata angka detik
  if (!isNaN(num)) {

    const jam = Math.floor(num / 3600)
      .toString()
      .padStart(2, '0');

    const menit = Math.floor((num % 3600) / 60)
      .toString()
      .padStart(2, '0');

    return `${jam}:${menit}`;
  }

  return '-';
};

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

export default function PresensiPage() {

  const navigate = useNavigate();

  const location = useLocation();
  
  const [selectedMonth, setSelectedMonth] =
  useState('');
  
  const [limit, setLimit] =
  useState(10);

  const student = location.state?.student;

  const attendance =
    location.state?.attendance || [];
    
    const filteredAttendance = attendance
    .filter((item) => {

        if (!selectedMonth) return true;

        const bulan =
        new Date(item.tanggal)
            .toLocaleString('id-ID', {
            month: 'long'
            });

        return bulan === selectedMonth;
    })
    .slice(0, limit);

  // redirect kalau buka page langsung
  useEffect(() => {

    if (!student) {
      navigate('/login');
    }

  }, [student, navigate]);

  if (!student) return null;

  return (
    <div className="min-h-screen bg-[#f5f6fa] p-8">

      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">

          <div>

            <h1 className="text-2xl font-black text-[#1d2433]">
              Data Presensi
            </h1>

            <p className="text-gray-400 mt-1">
              {student.nama_siswa}
            </p>

            <p className="text-sm text-gray-400">
              NISN: {student.nisn}
            </p>

          </div>

          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 bg-[#1d2433] hover:bg-[#2d3748] text-white px-5 py-3 rounded-2xl font-bold transition"
          >
            <ArrowLeft size={16} />
            Kembali
          </button>

        </div>

        {/* FILTER */}
        <div className="p-5 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">

        {/* FILTER BULAN */}
        <div className="flex items-center gap-2">

            <p className="text-sm font-bold text-gray-500">
            Filter Bulan
            </p>

            <select
            value={selectedMonth}
            onChange={(e) =>
                setSelectedMonth(e.target.value)
            }
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none"
            >

            <option value="">
                Semua Bulan
            </option>

            {BULAN.map((bulan) => (
                <option
                key={bulan}
                value={bulan}
                >
                {bulan}
                </option>
            ))}

            </select>

        </div>

        {/* LIMIT DATA */}
        <div className="flex items-center gap-2">

            <p className="text-sm font-bold text-gray-500">
            Tampilkan
            </p>

            <select
            value={limit}
            onChange={(e) =>
                setLimit(Number(e.target.value))
            }
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none"
            >

            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>

            </select>

        </div>

        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead className="bg-[#f8f9fa]">

              <tr>

                <th className="text-left p-4 text-sm font-black text-gray-500">
                  Tanggal
                </th>

                <th className="text-center p-4 text-sm font-black text-gray-500">
                  Status
                </th>

                <th className="text-center p-4 text-sm font-black text-gray-500">
                  Jam Masuk
                </th>

                <th className="text-center p-4 text-sm font-black text-gray-500">
                  Jam Keluar
                </th>

              </tr>

            </thead>

            <tbody>

              {filteredAttendance.length > 0 ? (

                filteredAttendance.map((item, index) => (

                  <tr
                    key={index}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >

                    <td className="p-4 text-sm font-bold text-[#1d2433]">
                      {formatTanggal(item.tanggal)}
                    </td>

                    <td className="text-center">

                      <span className="bg-[#cbeeff] text-[#2f6fa1] px-3 py-1 rounded-xl text-sm font-bold">
                        {item.status_kehadiran}
                      </span>

                    </td>

                    <td className="text-center">

                      <div className="flex items-center justify-center gap-1">

                        <Clock
                          size={12}
                          className="text-gray-400"
                        />

                        <span className="text-sm font-bold">
                          {formatTime(item.jam_masuk)}
                        </span>

                      </div>

                    </td>

                    <td className="text-center">

                      <div className="flex items-center justify-center gap-1">

                        <Clock
                          size={12}
                          className="text-gray-400"
                        />

                        <span className="text-sm font-bold">
                          {formatTime(item.jam_keluar)}
                        </span>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="p-10 text-center text-gray-400"
                  >
                    Tidak ada data presensi
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}