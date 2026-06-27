import { useState, useMemo, useEffect } from "react";
import Layout from "./Layout";
import {
  ArrowLeft,
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  CalendarDays,
  User,
  School,
  BadgeCheck,
  FileText,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function DataPengajuan() {
  const [search, setSearch] = useState("");
  const [izinData, setIzinData] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // TAMBAHAN
  const [keteranganPenolakan, setKeteranganPenolakan] = useState("");

  const fetchIzin = async () => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/izin`);
      const data = await res.json();

      if (Array.isArray(data)) {
        setIzinData(data);
      } else {
        setIzinData([]);
      }
    } catch (error) {
      console.error(error);
      setIzinData([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchIzin();
  }, []);

  const filteredStudents = useMemo(() => {
    return izinData.filter((item) => {
      const query = search.toLowerCase();

      return (
        String(item.nis || "")
          .toLowerCase()
          .includes(query) ||
        String(item.nama_siswa || "")
          .toLowerCase()
          .includes(query) ||
        String(item.kelas || "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [search, izinData]);

  const totalPages = Math.ceil(
  filteredStudents.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedStudents =
    filteredStudents.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  const getLampiranUrl = (lampiran) => {
    if (!lampiran) {
      return "https://placehold.co/800x1000?text=Tidak+Ada+Lampiran";
    }

    if (lampiran.startsWith("http")) {
      return lampiran;
    }

    return `${API_URL}/${lampiran}`;
  };

  const updateStatus = async (status) => {
    if (!selectedStudent) return;

    // VALIDASI KETERANGAN PENOLAKAN
    if (
      status === "ditolak" &&
      keteranganPenolakan.trim() === ""
    ) {
      alert("Keterangan penolakan wajib diisi.");
      return;
    }

    try {
      const params = new URLSearchParams({
        nis: selectedStudent.nis,
        tanggal: selectedStudent.tanggal,
        status,
        keterangan:
          status === "ditolak"
            ? keteranganPenolakan
            : "",
      });

      const res = await fetch(
        `${API_URL}/izin/update-status?${params.toString()}`,
        {
          method: "POST",
        }
      );

      const result = await res.json();

      if (result.error || result.success === false) {
        alert(result.error || result.message);
        return;
      }

      alert(`Pengajuan berhasil ${status}`);

      setSelectedStudent(null);
      setShowPreview(false);
      setKeteranganPenolakan("");

      fetchIzin();
    } catch (error) {
      console.error(error);
      alert("Gagal memproses pengajuan.");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "disetujui":
        return "bg-emerald-100 text-emerald-700";

      case "ditolak":
        return "bg-red-100 text-red-700";

      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f6f8fb] p-5">
        {!selectedStudent ? (
          <>
            {/* HEADER */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black text-[#1d2433]">
                  Pengajuan Izin Siswa
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Kelola pengajuan izin siswa dengan lebih mudah
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative w-full lg:w-[340px]">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#3abef8] shadow-sm"
                />
              </div>
            </div>

            {/* CARD */}
            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
              {/* TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">
                        Siswa
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">
                        Kelas
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">
                        Tanggal
                      </th>

                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">
                        Status
                      </th>

                      <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-20 text-center text-sm text-gray-400"
                        >
                          Memuat data...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="py-20 text-center text-sm text-gray-400"
                        >
                          Tidak ada pengajuan izin
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 hover:bg-[#fafcff] transition"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-[#dff4ff] flex items-center justify-center text-[#1d2433] font-black">
                                {student.nama_siswa?.charAt(0)}
                              </div>

                              <div>
                                <h2 className="text-sm font-bold text-[#1d2433]">
                                  {student.nama_siswa}
                                </h2>

                                <p className="text-xs text-gray-400 mt-0.5">
                                  NIS: {student.nis}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold text-gray-700">
                            {student.kelas}
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-600">
                            {student.tanggal}
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black ${statusColor(
                                student.status
                              )}`}
                            >
                              {student.status || "pending"}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setKeteranganPenolakan(
                                    student.keterangan_penolakan || ""
                                  );
                                }}
                                className="flex items-center gap-2 bg-[#1d2433] hover:bg-[#2d3748] text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                              >
                                <Eye size={16} />
                                Detail
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* PAGINATION */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-5 border-t border-gray-100">

                  {/* SHOW DATA */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 font-semibold">

                    <span>Tampilkan</span>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="
                        border
                        border-gray-200
                        rounded-xl
                        px-3
                        py-2
                        bg-white
                        outline-none
                      "
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>

                    <span>data</span>

                  </div>

                  {/* BUTTON PAGE */}
                  <div className="flex items-center gap-2">

                    <button
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => prev - 1)
                      }
                      className="
                        px-4
                        py-2
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-sm
                        font-bold
                        disabled:opacity-40
                      "
                    >
                      Prev
                    </button>

                    <div className="
                      px-4
                      py-2
                      rounded-xl
                      bg-[#1d2433]
                      text-white
                      text-sm
                      font-bold
                    ">
                      {currentPage} / {totalPages || 1}
                    </div>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((prev) => prev + 1)
                      }
                      className="
                        px-4
                        py-2
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-sm
                        font-bold
                        disabled:opacity-40
                      "
                    >
                      Next
                    </button>

                  </div>

                </div>

                
              </div>
            </div>
          </>
        ) : (
          <>
            {/* DETAIL PAGE */}
            <button
              onClick={() => {
                setSelectedStudent(null);
                setKeteranganPenolakan("");
              }}
              className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">
              {/* LEFT */}
              <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-[#dff4ff] flex items-center justify-center text-2xl font-black text-[#1d2433]">
                    {selectedStudent.nama_siswa?.charAt(0)}
                  </div>

                  <div>
                    <h1 className="text-2xl font-black text-[#1d2433]">
                      {selectedStudent.nama_siswa}
                    </h1>

                    <p className="text-sm text-gray-400">
                      Detail Pengajuan Izin
                    </p>
                  </div>
                </div>

                {/* INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-[#f8fafc] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <User size={16} />
                      <span className="text-xs font-bold uppercase">
                        NIS
                      </span>
                    </div>

                    <p className="text-sm font-black text-[#1d2433]">
                      {selectedStudent.nis}
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <School size={16} />
                      <span className="text-xs font-bold uppercase">
                        Kelas
                      </span>
                    </div>

                    <p className="text-sm font-black text-[#1d2433]">
                      {selectedStudent.kelas}
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <CalendarDays size={16} />
                      <span className="text-xs font-bold uppercase">
                        Tanggal
                      </span>
                    </div>

                    <p className="text-sm font-black text-[#1d2433]">
                      {selectedStudent.tanggal}
                    </p>
                  </div>

                  <div className="bg-[#f8fafc] rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                      <BadgeCheck size={16} />
                      <span className="text-xs font-bold uppercase">
                        Status
                      </span>
                    </div>

                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${statusColor(
                        selectedStudent.status
                      )}`}
                    >
                      {selectedStudent.status}
                    </span>
                  </div>
                </div>

                {/* ALASAN */}
                <div className="mt-6">
                  <h2 className="text-sm font-black text-gray-500 uppercase mb-3">
                    Alasan Izin
                  </h2>

                  <div className="bg-[#f8fafc] rounded-2xl p-5 text-sm text-gray-700 leading-relaxed min-h-[120px]">
                    {selectedStudent.alasan || "-"}
                  </div>
                </div>

                {/* KETERANGAN PENOLAKAN */}
                {(selectedStudent.status === "ditolak" ||
                  selectedStudent.status === "pending") && (
                  <div className="mt-6">
                    <h2 className="flex items-center gap-2 text-sm font-black text-gray-500 uppercase mb-3">
                      <FileText size={16} />
                      Keterangan Penolakan
                    </h2>

                    <textarea
                      value={keteranganPenolakan}
                      onChange={(e) =>
                        setKeteranganPenolakan(e.target.value)
                      }
                      disabled={selectedStudent.status !== "pending"}
                      placeholder="Tulis alasan kenapa pengajuan ditolak..."
                      className="w-full min-h-[130px] rounded-2xl border border-gray-200 bg-[#f8fafc] p-5 text-sm text-gray-700 outline-none focus:border-red-300 resize-none disabled:opacity-70"
                    />
                  </div>
                )}

                {/* FOTO */}
                <div className="mt-6">
                  <h2 className="text-sm font-black text-gray-500 uppercase mb-3">
                    Lampiran
                  </h2>

                  <button
                    onClick={() => setShowPreview(true)}
                    className="bg-[#3abef8] hover:bg-[#27aae3] text-white px-5 py-3 rounded-2xl text-sm font-black transition"
                  >
                    Preview Foto
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-7 h-fit">
                <h2 className="text-xl font-black text-[#1d2433] mb-6">
                  Persetujuan
                </h2>

                <div className="space-y-4">
                  <button
                    onClick={() => updateStatus("disetujui")}
                    disabled={selectedStudent.status !== "pending"}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-black transition disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    Setujui Pengajuan
                  </button>

                  <button
                    onClick={() => updateStatus("ditolak")}
                    disabled={selectedStudent.status !== "pending"}
                    className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black transition disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Tolak Pengajuan
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PREVIEW */}
        {showPreview && selectedStudent && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-5 left-5 bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition"
            >
              <ArrowLeft size={24} className="text-white" />
            </button>

            <img
              src={getLampiranUrl(selectedStudent.lampiran)}
              alt="Lampiran"
              className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain"
            />
          </div>
        )}
      </div>
    </Layout>
  );
}