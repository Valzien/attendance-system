import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";

import {
  UserCheck,
  Contact,
  CalendarDays,
  Lock,
  ClipboardList,
  History,
  Users,
  BookOpen,
} from "lucide-react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";

import {
  getAdminSummary,
  getWeeklyAttendance
} from "../../api";

const menuItems = [
  {
    to: "/admin/rekap",
    title: "Rekap Absensi",
    icon: UserCheck,
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    border: "border-[#e8d96a]",
  },
  {
    to: "/admin/pengajuan",
    title: "Data Pengajuan",
    icon: ClipboardList,
    bg: "bg-[#c7f5d8]",
    text: "text-[#2b8a57]",
    border: "border-[#6ddda0]",
  },
  {
    to: "/admin/reset-password",
    title: "Reset Password",
    icon: Lock,
    bg: "bg-[#ffc8d0]",
    text: "text-[#cf3450]",
    border: "border-[#f7778a]",
  },
  {
    to: "/admin/data-guru",
    title: "Data Guru",
    icon: Contact,
    bg: "bg-[#cbeeff]",
    text: "text-[#2f6fa1]",
    border: "border-[#7ac5f5]",
  },
  {
    to: "/admin/data-siswa",
    title: "Data Siswa",
    icon: Contact,
    bg: "bg-[#ffd5fb]",
    text: "text-[#c218b8]",
    border: "border-[#eb7de5]",
  },
  {
    to: "/admin/jadwal",
    title: "Jadwal Pelajaran",
    icon: CalendarDays,
    bg: "bg-[#ffd8c7]",
    text: "text-[#cf6136]",
    border: "border-[#f5a07a]",
  },
  {
    to: "/admin/history-absensi",
    title: "History Absensi",
    icon: History,
    bg: "bg-[#f7f8bf]",
    text: "text-[#8f9120]",
    border: "border-[#d5d84a]",
  },
];

const CustomTooltip = ({ active, payload, label }) => {

  if (active && payload && payload.length) {

    return (

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-3 text-xs">

        <p className="font-black text-[#1d2433] mb-2">
          {label}
        </p>

        {payload.map((p) => (

          <div
            key={p.dataKey}
            className="flex items-center gap-2 mb-1"
          >

            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{
                background: p.color
              }}
            />

            <span className="text-gray-500 capitalize">
              {p.name}:
            </span>

            <span className="font-bold text-[#1d2433]">
              {p.value}
            </span>

          </div>

        ))}

      </div>

    );

  }

  return null;
};

export default function Home() {

  const [summary, setSummary] = useState({
    total_students: 0,
    attendance_today: 0,
    total_classes: 0,
  });

  const [weeklyData, setWeeklyData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");

  const [greeting, setGreeting] =
    useState("Selamat Pagi");

  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user");

    if (storedUser) {

      const parsed = JSON.parse(storedUser);

      if (parsed?.name) {
        setName(parsed.name);
      }

    }

    const hour = new Date().getHours();

    if (hour >= 4 && hour < 11) {
      setGreeting("Selamat Pagi");
    }

    else if (hour >= 11 && hour < 15) {
      setGreeting("Selamat Siang");
    }

    else if (hour >= 15 && hour < 18) {
      setGreeting("Selamat Sore");
    }

    else {
      setGreeting("Selamat Malam");
    }

    // =========================================
    // LOAD SUMMARY + WEEKLY DATA
    // =========================================

    const loadData = async () => {

      try {

        const summaryData =
          await getAdminSummary();

        if (summaryData) {
          setSummary(summaryData);
        }

        const weekly =
          await getWeeklyAttendance();

        if (weekly) {
          setWeeklyData(weekly);
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, []);

  // =====================================================
  // PERSENTASE HADIR
  // =====================================================

  const attendanceRate =
    summary.total_students > 0
      ? Math.round(
          (
            summary.attendance_today /
            summary.total_students
          ) * 100
        )
      : 0;

  return (

    <Layout>

      <div className="space-y-6">

        {/* Greeting */}

        <div>

          <h1 className="text-2xl font-black text-[#1d2433]">

            {greeting}, {name || "Admin"}

          </h1>

          <p className="text-sm text-gray-400 font-medium mt-1">

            Berikut ringkasan aktivitas sekolah hari ini

          </p>

        </div>

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Total Siswa */}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-[#cbeeff] flex items-center justify-center flex-shrink-0">

              <Users
                size={22}
                className="text-[#2f6fa1]"
                strokeWidth={2.5}
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-gray-400">

                Total Siswa

              </p>

              <p className="text-3xl font-black text-[#1d2433] leading-tight mt-0.5">

                {loading
                  ? "—"
                  : summary.total_students.toLocaleString("id-ID")}

              </p>

            </div>

          </div>

          {/* Absensi Hari Ini */}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-[#c7f5d8] flex items-center justify-center flex-shrink-0">

              <UserCheck
                size={22}
                className="text-[#2b8a57]"
                strokeWidth={2.5}
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-gray-400">

                Absensi Hari Ini

              </p>

              <p className="text-3xl font-black text-[#1d2433] leading-tight mt-0.5">

                {loading
                  ? "—"
                  : summary.attendance_today.toLocaleString("id-ID")}

              </p>

              {!loading &&
                summary.total_students > 0 && (

                <p className="text-[11px] text-[#2b8a57] font-semibold mt-0.5">

                  {attendanceRate}% dari total siswa

                </p>

              )}

            </div>

          </div>

          {/* Kelas */}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-[#f7f0c6] flex items-center justify-center flex-shrink-0">

              <BookOpen
                size={22}
                className="text-[#756d24]"
                strokeWidth={2.5}
              />

            </div>

            <div>

              <p className="text-xs font-semibold text-gray-400">

                Kelas Terdaftar

              </p>

              <p className="text-3xl font-black text-[#1d2433] leading-tight mt-0.5">

                {loading
                  ? "—"
                  : summary.total_classes}

              </p>

            </div>

          </div>

        </div>

        {/* CHART */}

        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">

          {/* BAR CHART */}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">

            <div className="mb-4">

              <p className="text-[14px] font-black text-[#1d2433]">

                Absensi Mingguan

              </p>

            </div>

            <ResponsiveContainer width="100%" height={220}>

              <BarChart data={weeklyData}>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="hari" />

                <YAxis />

                <Tooltip
                  content={<CustomTooltip />}
                />

                <Bar
                  dataKey="hadir"
                  fill="#1d2433"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="izin"
                  fill="#f7c548"
                  radius={[6, 6, 0, 0]}
                />

                <Bar
                  dataKey="alpha"
                  fill="#ff8a8a"
                  radius={[6, 6, 0, 0]}
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

          {/* LINE CHART */}

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">

            <div className="mb-4">

              <p className="text-[14px] font-black text-[#1d2433]">

                Tren Kehadiran

              </p>

            </div>

            <ResponsiveContainer width="100%" height={220}>

            <LineChart data={weeklyData}>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
              />

              <XAxis dataKey="hari" />

              <YAxis />

              <Tooltip
                content={<CustomTooltip />}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="hadir"
                stroke="#1d2433"
                strokeWidth={3}
                dot={{
                  r: 4,
                  fill: "#1d2433"
                }}
                activeDot={{
                  r: 6
                }}
              />

            </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </Layout>

  );

}