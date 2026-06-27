import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from "./Layout";
import { Search, User, Lock, Unlock, ShieldCheck, AlertCircle } from 'lucide-react';
import { searchUser, resetUserPassword } from '../../api';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm]       = useState('');
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedUser, setSelectedUser]   = useState(null);
  const [loading, setLoading]             = useState(false);
  const [toast, setToast]                 = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const passwordMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const passwordMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;

  const handleSearch = async (value) => {
    setSearchTerm(value);
    if (value.trim().length < 2) { setSelectedUser(null); return; }
    try {
      const result = await searchUser(value);
      if (result.found) {
        setSelectedUser({ id: result.id, name: result.name, role: result.role });
      } else {
        setSelectedUser(null);
      }
    } catch (error) {
      console.error(error);
      setSelectedUser(null);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    console.log(selectedUser);
    if (!selectedUser) { showToast('error', 'Pilih pengguna terlebih dahulu'); return; }
    if (!newPassword || !confirmPassword) { showToast('error', 'Password wajib diisi'); return; }
    if (newPassword !== confirmPassword) { showToast('error', 'Password tidak cocok'); return; }

    setLoading(true);
    try {
      const result = await resetUserPassword(selectedUser.role, selectedUser.id, newPassword);
      if (result.success) {
        showToast('success', result.message || 'Password berhasil direset');
        setTimeout(() => navigate('/admin/home'), 1500);
      } else {
        showToast('error', result.message || 'Reset password gagal');
      }
    } catch (error) {
      console.error(error);
      showToast('error', 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const isGuru = selectedUser?.role === 'guru';

  return (
    <Layout>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-[13px] font-bold transition-all
          ${toast.type === 'success' ? 'bg-[#c7f5d8] text-[#2b8a57]' : 'bg-[#ffc8d0] text-[#cf3450]'}`}>
          {toast.type === 'success'
            ? <ShieldCheck size={16} />
            : <AlertCircle size={16} />}
          {toast.message}
        </div>
      )}

      <div className="max-w-lg mx-auto space-y-4">

        {/* Header card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-[#ffc8d0] flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-[#cf3450]" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-[16px] font-black text-[#1d2433]">Reset Password</h2>
            <p className="text-[12px] text-gray-400 font-medium mt-0.5">Cari pengguna lalu atur password baru</p>
          </div>
        </div>

        <form onSubmit={handleReset} className="space-y-4">

          {/* Search */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Cari Pengguna</p>

            <div className="relative">
              <Search size={16} className="text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Ketik nama guru atau siswa..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-[#f8f9fa] border border-gray-100 text-[#1d2433] font-semibold py-3 pl-11 pr-4 rounded-xl outline-none focus:border-gray-300 transition-colors text-[13px] placeholder:text-gray-300"
              />
            </div>

            {/* Selected user result */}
            {selectedUser ? (
              <div className={`flex items-center gap-3 p-3.5 rounded-2xl border ${isGuru ? 'bg-[#c7f5d8]/40 border-[#c7f5d8]' : 'bg-[#cbeeff]/40 border-[#cbeeff]'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[12px] font-black
                  ${isGuru ? 'bg-[#c7f5d8] text-[#2b8a57]' : 'bg-[#cbeeff] text-[#2f6fa1]'}`}>
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-black text-[#1d2433] truncate">{selectedUser.name}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg inline-block mt-0.5
                    ${isGuru ? 'bg-[#c7f5d8] text-[#2b8a57]' : 'bg-[#cbeeff] text-[#2f6fa1]'}`}>
                    {selectedUser.role}
                  </span>
                </div>
                <ShieldCheck size={16} className={isGuru ? 'text-[#2b8a57]' : 'text-[#2f6fa1]'} />
              </div>
            ) : searchTerm.trim().length >= 2 ? (
              <div className="flex items-center gap-2 text-[12px] text-gray-400 font-semibold px-1">
                <AlertCircle size={14} />
                Pengguna tidak ditemukan
              </div>
            ) : null}
          </div>

          {/* Password fields */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            <p className="text-[11px] font-black text-gray-300 uppercase tracking-widest">Password Baru</p>

            <div className="relative">
              <Unlock size={15} className="text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="Masukkan password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full bg-[#f8f9fa] border border-gray-100 text-[#1d2433] font-semibold py-3 pl-11 pr-4 rounded-xl outline-none focus:border-gray-300 transition-colors text-[13px] placeholder:text-gray-300"
              />
            </div>

            <div className="relative">
              <Lock size={15} className="text-gray-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                placeholder="Konfirmasi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full bg-[#f8f9fa] border text-[#1d2433] font-semibold py-3 pl-11 pr-4 rounded-xl outline-none transition-colors text-[13px] placeholder:text-gray-300
                  ${passwordMismatch ? 'border-[#ffc8d0]' : passwordMatch ? 'border-[#c7f5d8]' : 'border-gray-100'}`}
              />
            </div>

            {/* Password feedback */}
            {passwordMismatch && (
              <p className="text-[11px] font-bold text-[#cf3450] flex items-center gap-1.5 px-1">
                <AlertCircle size={12} /> Password tidak cocok
              </p>
            )}
            {passwordMatch && (
              <p className="text-[11px] font-bold text-[#2b8a57] flex items-center gap-1.5 px-1">
                <ShieldCheck size={12} /> Password cocok
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/home')}
              className="flex-1 py-3 rounded-2xl font-bold border border-gray-200 text-[13px] text-gray-500 hover:bg-gray-50 transition-colors bg-white shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || !!passwordMismatch}
              className="flex-2 flex-[2] flex items-center justify-center gap-2 bg-[#1d2433] hover:bg-[#2d3748] disabled:opacity-40 text-white font-black py-3 rounded-2xl transition-colors shadow-sm text-[13px]"
            >
              <Lock size={14} />
              {loading ? 'Memproses...' : 'Reset Password'}
            </button>
          </div>

        </form>
      </div>
    </Layout>
  );
}