import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from "./Layout";
import {
  ArrowDownRight,
  ArrowUpLeft,
  UserX,
  ClipboardList,
  CalendarDays,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import heroImg from '../../assets/hero.png';

export default function Home() {

  const [name, setName] = useState('');
  const [greeting, setGreeting] = useState('Selamat Pagi');
  const [kelas, setKelas] = useState('');
  const [jamPulang, setJamPulang] = useState('14:40');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed?.name) setName(parsed.name);
      if (parsed?.kelas) setKelas(parsed.kelas);
    }

    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) setGreeting('Selamat Pagi');
    else if (hour >= 11 && hour < 15) setGreeting('Selamat Siang');
    else if (hour >= 15 && hour < 18) setGreeting('Selamat Sore');
    else setGreeting('Selamat Malam');
  }, []);

  useEffect(() => {
    if (!kelas) return;
    fetch(`http://127.0.0.1:8000/jam-pulang/${kelas}`)
      .then(res => res.json())
      .then(data => {
        if (data.jam_pulang) setJamPulang(data.jam_pulang.slice(0, 5));
      })
      .catch(err => console.log("Gagal ambil jam pulang:", err));
  }, [kelas]);

  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const totalMinutes = (hour * 60) + minute;

  const absenMasukOpen =
    totalMinutes >= (6 * 60 + 45) &&
    totalMinutes <= (7 * 60 + 45);

  const [jamKeluarHour, jamKeluarMinute] = jamPulang.split(':').map(Number);
  const jamKeluarMenit = (jamKeluarHour * 60) + jamKeluarMinute;

  const absenKeluarOpen =
    totalMinutes >= (jamKeluarMenit - 10) &&
    totalMinutes <= (16 * 60);

  return (
    <Layout>
      <div className="space-y-5">

        {/* Greeting */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-0">
            <div className="w-full sm:w-64 bg-gradient-to-br from-[#e1f1eb] to-[#fdf1e1] flex items-end justify-center pt-6 sm:pt-0 sm:h-48 flex-shrink-0">
              <img src={heroImg} alt="Students" className="w-48 sm:w-full object-contain" />
            </div>
            <div className="flex-1 p-6">
              <p className="text-[12px] font-bold text-gray-400 mb-1">{greeting}</p>
              <h1 className="text-[22px] font-black text-[#1d2433] leading-tight">{name || 'Siswa'}</h1>
              {kelas && (
                <span className="inline-block mt-2 text-[11px] font-black bg-[#cbeeff] text-[#2f6fa1] px-3 py-1 rounded-xl">
                  Kelas {kelas}
                </span>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl ${absenMasukOpen ? 'bg-[#c7f5d8] text-[#2b8a57]' : 'bg-gray-100 text-gray-400'}`}>
                  {absenMasukOpen ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  Absen Masuk {absenMasukOpen ? 'Dibuka' : '06.45–07.45'}
                </div>
                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-xl ${absenKeluarOpen ? 'bg-[#c7f5d8] text-[#2b8a57]' : 'bg-gray-100 text-gray-400'}`}>
                  {absenKeluarOpen ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  Absen Keluar {absenKeluarOpen ? 'Dibuka' : jamPulang.replace(':', '.')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="grid grid-cols-2 gap-3">

          {/* Absen Masuk */}
          <Link
            to={absenMasukOpen ? "/absen/masuk" : "#"}
            onClick={(e) => {
              if (!absenMasukOpen) {
                e.preventDefault();
                if (totalMinutes < (6 * 60 + 45)) {
                  alert("Absen masuk belum dibuka");
                } else {
                  alert("Absen masuk sudah ditutup");
                }
              }
            }}
            className={`relative rounded-2xl p-5 flex flex-col justify-between min-h-[120px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${absenMasukOpen ? 'bg-[#f5e6a9]' : 'bg-[#f5e6a9]/50'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
              <ArrowDownRight size={20} className="text-[#9c8421]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-[#9c8421] leading-tight">Absen Masuk</h2>
              <p className="text-[11px] font-bold text-[#bfa846] mt-0.5">06.45 – 07.45</p>
            </div>
            {!absenMasukOpen && (
              <div className="absolute top-3 right-3">
                <XCircle size={15} className="text-[#bfa846] opacity-60" />
              </div>
            )}
          </Link>

          {/* Absen Keluar */}
          <Link
            to={absenKeluarOpen ? "/absen/keluar" : "#"}
            onClick={(e) => {
              if (!absenKeluarOpen) {
                e.preventDefault();
                if (totalMinutes < (jamKeluarMenit - 10)) {
                  alert("Absen keluar belum dibuka");
                } else {
                  alert("Absen keluar sudah ditutup");
                }
              }
            }}
            className={`relative rounded-2xl p-5 flex flex-col justify-between min-h-[120px] shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${absenKeluarOpen ? 'bg-[#95e4a8]' : 'bg-[#95e4a8]/50'}`}
          >
            <div className="w-9 h-9 rounded-xl bg-white/50 flex items-center justify-center">
              <ArrowUpLeft size={20} className="text-[#2a8742]" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-[#2a8742] leading-tight">Absen Keluar</h2>
              <p className="text-[11px] font-bold text-[#4eb368] mt-0.5">{jamPulang.replace(':', '.')}</p>
            </div>
            {!absenKeluarOpen && (
              <div className="absolute top-3 right-3">
                <XCircle size={15} className="text-[#4eb368] opacity-60" />
              </div>
            )}
          </Link>

        </div>

        {/* Menu */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { to: '/permission', label: 'Formulir Izin', icon: UserX, bg: 'bg-[#f1edc7]', text: 'text-[#a89d46]', iconBg: 'bg-[#e8d96a]/30' },
            { to: '/history', label: 'Riwayat Presensi', icon: ClipboardList, bg: 'bg-[#acefc8]', text: 'text-[#3b9f5a]', iconBg: 'bg-white/50' },
            { to: '/schedule', label: 'Jadwal Pelajaran', icon: CalendarDays, bg: 'bg-[#ffb6be]', text: 'text-[#d4374b]', iconBg: 'bg-white/50' },
          ].map(({ to, label, icon: Icon, bg, text, iconBg }) => (
            <Link
              key={to}
              to={to}
              className={`${bg} rounded-2xl p-4 flex flex-col items-center justify-center gap-2.5 text-center hover:scale-[1.02] hover:shadow-md transition-all shadow-sm min-h-[90px]`}
            >
              <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                <Icon size={20} className={text} strokeWidth={2.4} />
              </div>
              <span className={`text-[11px] font-black leading-tight ${text}`}>{label}</span>
            </Link>
          ))}
        </div>

      </div>
    </Layout>
  );
}