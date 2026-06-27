import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "./Layout";
import {
  UserCheck,
  ClipboardList,
  CalendarDays,
  TrendingUp,
  Users,
  BookOpen,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";
import { getWeeklyAttendance } from "../../api";

// ── Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-3 text-xs">
      <p className="font-black text-[#1d2433] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-bold text-[#1d2433]">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// ── Quick access menu ─────────────────────────────────────
const menuItems = [
  {
    to: "/guru/rekap",
    title: "Rekap Absensi",
    icon: UserCheck,
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    border: "border-[#e8d96a]",
    desc: "Lihat rekap kehadiran siswa",
  },
  {
    to: "/guru/pengajuan",
    title: "Data Pengajuan",
    icon: ClipboardList,
    bg: "bg-[#c7f5d8]",
    text: "text-[#2b8a57]",
    border: "border-[#6ddda0]",
    desc: "Kelola pengajuan izin siswa",
  },
  {
    to: "/guru/jadwal",
    title: "Jadwal Pelajaran",
    icon: CalendarDays,
    bg: "bg-[#ffd8c7]",
    text: "text-[#cf6136]",
    border: "border-[#f5a07a]",
    desc: "Lihat jadwal mengajar",
  },
];

export default function Home() {
  const [name, setName]           = useState("");
  const [greeting, setGreeting]   = useState("Selamat Pagi");
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.name) setName(parsed.name);
    }

    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11)       setGreeting("Selamat Pagi");
    else if (hour >= 11 && hour < 15) setGreeting("Selamat Siang");
    else if (hour >= 15 && hour < 18) setGreeting("Selamat Sore");
    else                              setGreeting("Selamat Malam");

    (async () => {
      try {
        const weekly = await getWeeklyAttendance();
        if (weekly) setWeeklyData(weekly);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Summary dari weeklyData (ambil hari terakhir / total)
  const totalHadir = weeklyData.reduce((s, d) => s + (d.hadir || 0), 0);
  const totalIzin  = weeklyData.reduce((s, d) => s + (d.izin  || 0), 0);
  const totalAlpha = weeklyData.reduce((s, d) => s + (d.alpha || 0), 0);

  return (
    <Layout>
      <div className="space-y-6">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-black text-[#1d2433]">
            {greeting}, {name || "Guru"}
          </h1>
          <p className="text-sm text-gray-400 font-medium mt-1">
            Berikut ringkasan aktivitas kelas minggu ini
          </p>
        </div>

        {/* Stat chips — ringkasan minggu ini */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Hadir', value: totalHadir, icon: UserCheck,  bg: 'bg-[#c7f5d8]', iconColor: 'text-[#2b8a57]', valColor: 'text-[#2b8a57]' },
            { label: 'Total Izin',  value: totalIzin,  icon: BookOpen,   bg: 'bg-[#cbeeff]',  iconColor: 'text-[#2f6fa1]', valColor: 'text-[#2f6fa1]' },
            { label: 'Total Alpha', value: totalAlpha, icon: Users,      bg: 'bg-[#ffc8d0]',  iconColor: 'text-[#cf3450]', valColor: 'text-[#cf3450]' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={card.iconColor} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-gray-400">{card.label}</p>
                  <p className={`text-2xl font-black ${card.valColor} leading-tight`}>
                    {loading ? '—' : card.value}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium">minggu ini</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-4">

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[14px] font-black text-[#1d2433]">Absensi Mingguan</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Rekap kehadiran per hari</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#1d2433] inline-block" /> Hadir</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#f7c548] inline-block" /> Izin</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#ff8a8a] inline-block" /> Alpha</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData} barGap={4} barCategoryGap="30%">
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hari" tick={{ fontSize: 12, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hadir" name="Hadir" fill="#1d2433" radius={[6, 6, 0, 0]} />
                <Bar dataKey="izin"  name="Izin"  fill="#f7c548" radius={[6, 6, 0, 0]} />
                <Bar dataKey="alpha" name="Alpha" fill="#ff8a8a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="mb-4">
              <p className="text-[14px] font-black text-[#1d2433]">Tren Kehadiran</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Siswa hadir per hari</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="hari" tick={{ fontSize: 12, fontWeight: 700, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={28} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="hadir"
                  name="Hadir"
                  stroke="#1d2433"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#1d2433", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </Layout>
  );
}