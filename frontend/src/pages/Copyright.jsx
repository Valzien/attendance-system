import { useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Code2, Database, Palette } from 'lucide-react';
import logobanten from '../assets/images/logobanten.png';
import logosman from '../assets/images/logosman.jpg';
import amayPhoto from '../assets/images/amay.jpeg';
import delaPhoto from '../assets/images/dela.jpeg';
import nailaPhoto from '../assets/images/naila.jpeg';

export default function Copyright() {
  const navigate = useNavigate();

  const teamMembers = [
    {
      name: 'Cahya Amaylia. F. R.',
      role: 'Frontend Developer',
      icon: Code2,
      iconBg: 'bg-[#cbeeff]',
      iconColor: 'text-[#2f6fa1]',
      roleBg: 'bg-[#FFD1DC]',
      roleText: 'text-[#C2185B]',
      photo: amayPhoto,
      description: 'Saya adalah mahasiswi Universitas Pamulang yang berperan sebagai frontend developer. Saya bertanggung jawab dalam mengembangkan tampilan antarmuka yang interaktif dan responsif agar mudah digunakan oleh pengguna.'
    },
    {
      name: 'Dela Azizah',
      role: 'Backend Developer',
      icon: Database,
      iconBg: 'bg-[#c7f5d8]',
      iconColor: 'text-[#2b8a57]',
      roleBg: 'bg-[#c7f5d8]',
      roleText: 'text-[#2b8a57]',
      photo: delaPhoto,
      description: 'Saya adalah mahasiswi Universitas Pamulang yang berperan sebagai backend developer dalam tim. Saya bertanggung jawab dalam mengelola logika sistem, pengolahan data, serta memastikan koneksi antara database dan aplikasi berjalan dengan baik.'
    },
    {
      name: 'Naila Faiza Azzahra',
      role: 'UI/UX Designer',
      icon: Palette,
      iconBg: 'bg-[#ffd5fb]',
      iconColor: 'text-[#c218b8]',
      roleBg: 'bg-[#ffd5fb]',
      roleText: 'text-[#c218b8]',
      photo: nailaPhoto,
      description: 'Saya adalah mahasiswi Universitas Pamulang yang berperan sebagai UI/UX designer. Saya bertanggung jawab dalam merancang tampilan dan pengalaman pengguna agar aplikasi menjadi lebih intuitif, menarik, dan mudah dipahami.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col w-full pb-12">

      {/* Header */}
      <header className="w-full px-6 py-4 flex items-center gap-4 border-b border-gray-100 bg-white shadow-[0_1px_8px_rgb(0,0,0,0.03)] sticky top-0 z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div className="flex items-center gap-2.5">
          <img src={logobanten} alt="Logo Banten" className="h-9 object-contain" />
          <img src={logosman}   alt="Logo SMAN"   className="h-9 object-contain" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-5 py-10">

        {/* Title section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1d2433] mb-4">
            <GraduationCap size={24} className="text-white" />
          </div>
          <h1 className="text-[22px] font-black text-[#1d2433]">Tim Srikandi</h1>
          <p className="text-[13px] text-gray-400 font-medium mt-1">
            Universitas Pamulang &middot; &copy; Copyright Srikandi
          </p>
        </div>

        {/* Team cards */}
        <div className="space-y-4">
          {teamMembers.map((member, index) => {
            const Icon = member.icon;
            const initials = member.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
            return (
              <div
                key={index}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex gap-4"
              >
                {/* Photo / Avatar */}
                <div className="flex-shrink-0">
                  {member.photo ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100">
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl ${member.iconBg} flex items-center justify-center text-[18px] font-black ${member.iconColor}`}>
                      {initials}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-2">
                    <h2 className="text-[15px] font-black text-[#1d2433] leading-tight">{member.name}</h2>
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-lg flex-shrink-0 ${member.roleBg} ${member.roleText}`}>
                      <Icon size={11} strokeWidth={2.5} />
                      {member.role}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                    {member.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}