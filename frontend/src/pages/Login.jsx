import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  ArrowLeft,
  Search,
  Shield,
  CheckCircle2,
  XCircle,
  MinusCircle,
  AlertCircle,
  Clock,
  ChevronDown,
  Eye
} from 'lucide-react';

import { loginUser } from '../api';

import logobanten from '../assets/images/logobanten.png';
import logosman from '../assets/images/logosman.jpg';

const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
];

const STATUS_CONFIG = {

  hadir: {
    label: 'Hadir',
    keterangan: 'Tepat Waktu',
    bg: 'bg-[#c7f5d8]',
    text: 'text-[#2b8a57]',
    icon: CheckCircle2
  },

  telat: {
    label: 'Hadir',
    keterangan: 'Terlambat',
    bg: 'bg-[#f7f0c6]',
    text: 'text-[#756d24]',
    icon: CheckCircle2
  },

  izin: {
    label: 'Izin',
    keterangan: 'Izin',
    bg: 'bg-[#cbeeff]',
    text: 'text-[#2f6fa1]',
    icon: MinusCircle
  },

  sakit: {
    label: 'Sakit',
    keterangan: 'Sakit',
    bg: 'bg-[#ffd8c7]',
    text: 'text-[#cf6136]',
    icon: AlertCircle
  },

  tidak_hadir: {
    label: 'Tidak Hadir',
    keterangan: 'Alpha',
    bg: 'bg-[#ffc8d0]',
    text: 'text-[#cf3450]',
    icon: XCircle
  },
};

const formatTanggal = (dateStr) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

const formatTime = (val) => {

  if (val === null || val === undefined) {
    return null;
  }

  if (typeof val === 'number') {

    const jam = Math.floor(val / 3600)
      .toString()
      .padStart(2, '0');

    const menit = Math.floor((val % 3600) / 60)
      .toString()
      .padStart(2, '0');

    return `${jam}:${menit}`;
  }

  if (typeof val === 'string') {

    if (val.includes(':')) {
      return val.slice(0, 5);
    }

    const num = Number(val);

    if (!isNaN(num)) {

      const jam = Math.floor(num / 3600)
        .toString()
        .padStart(2, '0');

      const menit = Math.floor((num % 3600) / 60)
        .toString()
        .padStart(2, '0');

      return `${jam}:${menit}`;
    }
  }

  return null;
};

export default function Login() {

  const navigate = useNavigate();

  // LOGIN
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // PRESENSI
  const [nisnSearch, setNisnSearch] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [student, setStudent] = useState(null);
  const [attendanceRaw, setAttendanceRaw] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [attendanceError, setAttendanceError] = useState('');
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ==========================
  // LOGIN
  // ==========================

  const handleLogin = async (e) => {

    e.preventDefault();

    setError('');

    const result = await loginUser(username, password);

    if (!result.success) {

      setError(result.message);

      return;
    }

    console.log("LOGIN RESULT:", result);

    localStorage.setItem(
      'user',
      JSON.stringify({

        role: result.role,

        name: result.name,

        nip: result.nip,

        nis: result.nis,

        nisn: result.nisn,

        kelas: result.kelas

      })
    );

    console.log(
      "LOCAL STORAGE USER:",
      JSON.parse(localStorage.getItem("user"))
    );

    if (result.role === 'guru') {

      navigate('/guru/home');

      return;
    }

    if (result.role === 'admin') {

      navigate('/admin/home');

      return;
    }

    navigate('/home');
  };

  // ==========================
  // SEARCH NISN
  // ==========================

  const handleSearchNisn = async (e) => {

    e.preventDefault();

    if (!nisnSearch.trim()) return;

    setAttendanceError('');
    setLoadingAttendance(true);

    try {

      const res = await fetch(
        `http://localhost:8000/students/nisn/${nisnSearch.trim()}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      setStudent(data);

      setShowModal(true);

    } catch {

      setAttendanceError(
        'NISN tidak ditemukan. Periksa kembali.'
      );

    }

    setLoadingAttendance(false);
  };

  // ==========================
  // VALIDASI TANGGAL LAHIR
  // ==========================

  const handleValidate = async (e) => {

      e.preventDefault();

      setAttendanceError('');
      setLoadingAttendance(true);

      try {

        const res = await fetch(
          `http://localhost:8000/students/validate`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              nisn: nisnSearch.trim(),
              tanggal_lahir: tglLahir
            }),
          }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();

        setShowModal(false);

        navigate('/presensi', {
          state: {
            student,
            attendance: data.attendance || []
          }
        });

      } catch {

        setAttendanceError(
          'Tanggal lahir tidak sesuai.'
        );

      }

      setLoadingAttendance(false);
    };

  // ==========================
  // FORMAT DATA PRESENSI
  // ==========================

  const attendance = attendanceRaw
    .map(item => {

      const statusKey =
        item.status_kehadiran || 'tidak_hadir';

      const cfg =
        STATUS_CONFIG[statusKey] ||
        STATUS_CONFIG.tidak_hadir;

      return {
        ...item,

        bulanStr: new Date(item.tanggal)
          .toLocaleString('id-ID', { month: 'long' }),

        tanggalFmt: formatTanggal(item.tanggal),

        masuk: formatTime(item.jam_masuk),

        keluar: formatTime(item.jam_keluar),

        statusKey,

        ...cfg,
      };
    })
    .filter(
      d =>
        !selectedMonth ||
        d.bulanStr === selectedMonth
    );

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center p-8">

      {/* CARD LOGIN */}
      <div className="w-full max-w-xl bg-white rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.08)] p-10">

        {/* HEADER */}
        <div className="flex flex-col items-center gap-6 mb-10">

          <div className="flex items-center gap-6">

            <img
              src={logobanten}
              alt="Logo Banten"
              className="h-20 object-contain"
            />

            <img
              src={logosman}
              alt="Logo SMAN"
              className="h-20 object-contain"
            />

          </div>

          <div className="text-center">

            <h1 className="text-3xl font-extrabold text-black">
              Halaman Login
            </h1>

            <p className="text-sm text-gray-500 mt-2">
              Masuk untuk siswa, guru, atau admin dari satu halaman.
            </p>

          </div>
        </div>

        {/* PRESENSI */}
        <div className="mb-8 bg-[#f8fbff] border border-[#d9efff] rounded-3xl p-5">

          <div className="flex items-center gap-3 mb-4">

            <div className="w-10 h-10 rounded-2xl bg-[#cbeeff] flex items-center justify-center">

              <Eye
                size={18}
                className="text-[#2f6fa1]"
              />

            </div>

            <div>

              <p className="text-[15px] font-black text-[#1d2433]">
                Cek Presensi Siswa
              </p>

              <p className="text-[11px] text-gray-400">
                Sebagai orang tua
              </p>

            </div>
          </div>

          <form
            onSubmit={handleSearchNisn}
            className="flex gap-3"
          >

            <input
              type="text"
              value={nisnSearch}
              onChange={(e) =>
                setNisnSearch(e.target.value)
              }
              placeholder="Masukkan NISN"
              className="flex-1 rounded-2xl border border-gray-200 px-4 py-3 outline-none focus:border-[#3abef8]"
            />

            <button
              type="submit"
              disabled={loadingAttendance}
              className="bg-[#1d2433] hover:bg-[#2d3748] text-white px-5 rounded-2xl font-bold"
            >
              {loadingAttendance ? '...' : 'Cari'}
            </button>

          </form>

          {attendanceError && (
            <p className="mt-3 text-sm text-red-500">
              {attendanceError}
            </p>
          )}
        </div>

        {/* FORM LOGIN */}
        <form
          onSubmit={handleLogin}
          className="space-y-6"
        >

          <div className="grid gap-4">

            <label className="flex flex-col text-sm font-semibold text-gray-700">

              NISN / NIP

              <input
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                placeholder="Masukkan NISN atau NIP"
                className="mt-2 rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#3abef8] focus:ring-2 focus:ring-[#3abef8]/20"
                required
              />

            </label>

            <label className="flex flex-col text-sm font-semibold text-gray-700">

              Kata Sandi

              <input
                type="password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Masukkan kata sandi"
                className="mt-2 rounded-2xl border border-gray-200 px-4 py-3 text-gray-900 outline-none focus:border-[#3abef8] focus:ring-2 focus:ring-[#3abef8]/20"
                required
              />

            </label>

          </div>

          <button
            type="submit"
            className="w-full bg-[#3abef8] hover:bg-[#2f99d6] text-white font-bold py-3 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            Masuk
          </button>

        </form>

        {/* LOGIN ERROR */}
        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">
            {error}
          </p>
        )}

        <p className="text-xs text-gray-400 text-center mt-8">
          Halaman login ini adalah akses tunggal untuk semua user.
        </p>

      </div>

      {/* MODAL */}
      {showModal && student && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white w-full max-w-md rounded-3xl p-6">

            <div className="flex items-center gap-3 mb-5">

              <div className="w-10 h-10 rounded-2xl bg-[#f7f0c6] flex items-center justify-center">

                <Shield
                  size={18}
                  className="text-[#756d24]"
                />

              </div>

              <div>

                <p className="font-black text-[#1d2433]">
                  Verifikasi Identitas
                </p>

                <p className="text-sm text-gray-400">
                  {student.nama_siswa}
                </p>

              </div>
            </div>

            <form
              onSubmit={handleValidate}
              className="space-y-4"
            >

              <input
                type="date"
                value={tglLahir}
                onChange={(e) =>
                  setTglLahir(e.target.value)
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none"
              />

              <div className="flex gap-2">

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 py-3 rounded-2xl font-bold"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={loadingAttendance}
                  className="flex-1 bg-[#1d2433] text-white py-3 rounded-2xl font-bold"
                >
                  {loadingAttendance
                    ? 'Loading...'
                    : 'Verifikasi'}
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="py-5 text-center">
        <p className="text-[10px] text-gray-300 font-medium">
          Supported by Universitas Pamulang
        </p>

        <Link
          to="/copyright"
          className="text-[10px] text-gray-300 hover:text-gray-500 transition-colors"
        >
          &copy; Copyright Srikandi
        </Link>
      </footer>

    </div>
  );
}