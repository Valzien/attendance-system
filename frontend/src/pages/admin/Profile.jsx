import { useEffect, useState } from "react";
import Layout from "./Layout";
import {
  Phone,
  User,
  BookOpen,
  MapPin,
  CreditCard,
 Calendar,
  Pencil,
} from "lucide-react";

export default function Profile() {

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [savingPassword, setSavingPassword] = useState(false);

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {

  try {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    console.log("USER LOGIN:", user);

    const nip = user?.nip;

    if (!nip) {

      console.error("NIP tidak ditemukan di localStorage");

      setAdmin(null);
      setLoading(false);

      return;

    }

    const response = await fetch(
      `http://localhost:8000/teacher-profile/${nip}`
    );

    if (!response.ok) {

      throw new Error("Gagal mengambil profile");

    }

    const data = await response.json();

    setAdmin(data);

  } catch (error) {

    console.error(error);

    setAdmin(null);

  }

  setLoading(false);

};

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handleChangePassword = async () => {

    if (!oldPassword || !newPassword || !confirmPassword) {

      alert("Semua field password wajib diisi");

      return;

    }

    if (newPassword !== confirmPassword) {

      alert("Konfirmasi password tidak cocok");

      return;

    }

    if (newPassword.length < 4) {

      alert("Password minimal 4 karakter");

      return;

    }

    try {

      setSavingPassword(true);

      const res = await fetch(
        "http://localhost:8000/change-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            username: admin.username,

            old_password: oldPassword,

            new_password: newPassword,

            role: "admin"

          }),

        }
      );

      const result = await res.json();

      if (!result.success) {

        alert(
          result.message ||
          "Gagal mengubah password"
        );

        return;

      }

      alert("Password berhasil diubah");

      setShowPasswordModal(false);

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {

      console.error(error);

      alert("Terjadi kesalahan");

    } finally {

      setSavingPassword(false);

    }

  };

  // =====================================================
  // USE EFFECT
  // =====================================================

  useEffect(() => {

    fetchProfile();

  }, []);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <Layout>
        <div className="flex items-center justify-center py-24">

          <div className="flex flex-col items-center gap-3">

            <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-[#1d2433] animate-spin" />

            <p className="text-sm text-gray-400 font-medium">
              Memuat profil...
            </p>

          </div>

        </div>
      </Layout>
    );

  }

  // =====================================================
  // DATA TIDAK ADA
  // =====================================================

  if (!admin) {

    return (
      <Layout>

        <div className="flex flex-col items-center justify-center py-24 gap-3">

          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <User size={24} className="text-red-400" />
          </div>

          <p className="text-sm font-semibold text-red-400">
            Data admin tidak ditemukan
          </p>

        </div>

      </Layout>
    );

  }

  // =====================================================
  // INFO ITEMS
  // =====================================================

  const infoItems = [

    {
      icon: CreditCard,
      label: "NIP",
      value: admin.NIP,
      color: "bg-[#cbeeff]",
      iconColor: "text-[#2f6fa1]",
    },

    {
      icon: BookOpen,
      label: "Pengampu",
      value: admin.Guru_Pengampu,
      color: "bg-[#c7f5d8]",
      iconColor: "text-[#2b8a57]",
    },

    {
      icon: Phone,
      label: "Telepon",
      value: admin.Nomor_Telepon,
      color: "bg-[#f7f0c6]",
      iconColor: "text-[#756d24]",
    },

    {
      icon: Calendar,
      label: "Tanggal Lahir",
      value: admin.Tanggal_lahir,
      color: "bg-[#ffd5fb]",
      iconColor: "text-[#c218b8]",
    },

    {
      icon: MapPin,
      label: "Alamat",
      value: admin.Alamat,
      color: "bg-[#ffd8c7]",
      iconColor: "text-[#cf6136]",
    },

  ];

  // =====================================================
  // INITIALS
  // =====================================================

  const initials = admin.Nama
    ? admin.Nama
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "A";

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <Layout>

      <div className="max-w-xl mx-auto space-y-4">

        {/* PROFILE CARD */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center gap-5">

            {/* AVATAR */}

            <div className="w-16 h-16 rounded-2xl bg-[#1d2433] flex items-center justify-center flex-shrink-0 text-white text-xl font-black tracking-tight">
              {initials}
            </div>

            {/* INFO */}

            <div className="flex-1 min-w-0">

              <h2 className="text-[18px] font-black text-[#1d2433] truncate">
                {admin.Nama}
              </h2>

              <p className="text-[12px] text-gray-400 font-medium mt-0.5">
                Administrator &middot; SMAN 10 Tangsel
              </p>

              <span className="inline-block mt-2 text-[11px] font-bold text-[#2b8a57] bg-[#c7f5d8] px-2.5 py-0.5 rounded-lg">
                Aktif
              </span>

            </div>

          </div>

          {/* ACTION BUTTON */}

          <div className="mt-5">

            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full flex items-center justify-center gap-2 bg-[#1d2433] hover:bg-[#2c3547] text-white py-3 rounded-2xl text-sm font-bold transition"
            >

              <Pencil size={16} />

              Ubah Password

            </button>

          </div>

        </div>

        {/* INFO ITEMS */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

          <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest mb-4">
            Informasi Detail
          </p>

          <div className="space-y-1">

            {infoItems.map((item, i) => {

              const Icon = item.icon;

              return (

                <div key={item.label}>

                  <div className="flex items-start gap-3 py-3 px-2 rounded-2xl hover:bg-gray-50 transition-colors">

                    <div
                      className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >

                      <Icon
                        size={14}
                        className={item.iconColor}
                        strokeWidth={2.3}
                      />

                    </div>

                    <div className="flex-1 min-w-0">

                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wide leading-none">
                        {item.label}
                      </p>

                      <p className="text-[13px] font-semibold text-[#1d2433] mt-1 break-words leading-snug">
                        {item.value || "—"}
                      </p>

                    </div>

                  </div>

                  {i < infoItems.length - 1 && (
                    <div className="ml-11 border-b border-gray-50" />
                  )}

                </div>

              );

            })}

          </div>

        </div>

      </div>

      {/* MODAL UBAH PASSWORD */}

      {showPasswordModal && (

        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl">

            <h2 className="text-2xl font-black text-[#1d2433] mb-1">
              Ubah Password
            </h2>

            <p className="text-sm text-gray-400 mb-6">
              Pastikan password baru mudah diingat
            </p>

            <div className="space-y-4">

              {/* PASSWORD LAMA */}

              <div>

                <label className="text-xs font-bold text-gray-400 uppercase">
                  Password Lama
                </label>

                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1d2433]"
                  placeholder="Masukkan password lama"
                />

              </div>

              {/* PASSWORD BARU */}

              <div>

                <label className="text-xs font-bold text-gray-400 uppercase">
                  Password Baru
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1d2433]"
                  placeholder="Masukkan password baru"
                />

              </div>

              {/* KONFIRMASI PASSWORD */}

              <div>

                <label className="text-xs font-bold text-gray-400 uppercase">
                  Konfirmasi Password
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#1d2433]"
                  placeholder="Ulangi password baru"
                />

              </div>

            </div>

            {/* BUTTON */}

            <div className="flex gap-3 mt-7">

              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-sm font-bold text-gray-600 transition"
              >
                Batal
              </button>

              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="flex-1 py-3 rounded-2xl bg-[#1d2433] hover:bg-[#2c3547] text-white text-sm font-bold transition disabled:opacity-50"
              >
                {savingPassword ? "Menyimpan..." : "Simpan"}
              </button>

            </div>

          </div>

        </div>

      )}

    </Layout>

  );

}