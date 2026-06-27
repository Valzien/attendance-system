import { useState, useMemo, useEffect } from "react";
import Layout from "./Layout";
import {
  ArrowLeft,
  Search,
  Eye,
  CalendarDays,
  User,
  School,
  BadgeCheck,
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

  const fetchIzin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/izin`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setIzinData(data);
      } else {
        console.error("Data izin bukan array:", data);
        setIzinData([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data izin:", error);
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
      const nis = String(item.nis || "").toLowerCase();
      const nama = String(item.nama_siswa || "").toLowerCase();
      const kelas = String(item.kelas || "").toLowerCase();
      return nis.includes(query) || nama.includes(query) || kelas.includes(query);
    });
  }, [search, izinData]);

  // PAGINATION
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

  const statusColor = (status) => {
    switch (status) {
      case "disetujui": return "bg-emerald-100 text-emerald-700";
      case "ditolak":   return "bg-red-100 text-red-700";
      default:          return "bg-amber-100 text-amber-700";
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
                  Lihat pengajuan izin siswa
                </p>
              </div>

              {/* SEARCH */}
              <div className="relative w-full lg:w-[340px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari siswa..."
                  className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#3abef8] shadow-sm"
                />
              </div>
            </div>

            {/* TABLE CARD */}
            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-gray-100">
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Siswa</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Kelas</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Tanggal</th>
                      <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                      <th className="text-center px-6 py-4 text-xs font-black text-gray-400 uppercase">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-sm text-gray-400">
                          Memuat data...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-20 text-center text-sm text-gray-400">
                          Tidak ada pengajuan izin
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student, index) => (
                        <tr
                          key={`${student.nis}-${student.tanggal}-${index}`}
                          className="border-b border-gray-100 hover:bg-[#fafcff] transition"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl bg-[#dff4ff] flex items-center justify-center text-[#1d2433] font-black">
                                {student.nama_siswa?.charAt(0)}
                              </div>
                              <div>
                                <h2 className="text-sm font-bold text-[#1d2433]">{student.nama_siswa}</h2>
                                <p className="text-xs text-gray-400 mt-0.5">NIS: {student.nis}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-gray-700">{student.kelas}</td>
                          <td className="px-6 py-5 text-sm text-gray-600">{student.tanggal}</td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${statusColor(student.status)}`}>
                              {student.status || "pending"}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-center">
                              <button
                                onClick={() => setSelectedStudent(student)}
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
                <div
                  className="
                    flex
                    flex-col
                    lg:flex-row
                    items-center
                    justify-between
                    gap-4
                    p-5
                    border-t
                    border-gray-100
                  "
                >

                  {/* INFO */}
                  <div className="text-[13px] font-semibold text-gray-500">
                    Menampilkan {paginatedStudents.length} dari{" "}
                    {filteredStudents.length} data
                  </div>

                  {/* RIGHT */}
                  <div className="flex items-center gap-3">

                    {/* LIMIT */}
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
                        text-sm
                        outline-none
                      "
                    >
                      <option value={5}>5 Data</option>
                      <option value={10}>10 Data</option>
                      <option value={20}>20 Data</option>
                      <option value={50}>50 Data</option>
                    </select>

                    {/* BUTTON */}
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
                          text-[13px]
                          font-bold
                          disabled:opacity-40
                        "
                      >
                        Prev
                      </button>

                      <div
                        className="
                          px-4
                          py-2
                          rounded-xl
                          bg-[#1d2433]
                          text-white
                          text-[13px]
                          font-bold
                        "
                      >
                        {currentPage} / {totalPages || 1}
                      </div>

                      <button
                        disabled={
                          currentPage === totalPages ||
                          totalPages === 0
                        }
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
                          text-[13px]
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
            </div>
          </>
        ) : (
          <>
            {/* DETAIL PAGE */}
            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="mb-5 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black"
            >
              <ArrowLeft size={18} />
              Kembali
            </button>

            <div className="bg-white rounded-[30px] shadow-sm border border-gray-100 p-8">

              {/* DETAIL HEADER */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-3xl bg-[#dff4ff] flex items-center justify-center text-2xl font-black text-[#1d2433]">
                  {selectedStudent.nama_siswa?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#1d2433]">{selectedStudent.nama_siswa}</h1>
                  <p className="text-sm text-gray-400">Detail Pengajuan Izin</p>
                </div>
              </div>

              {/* INFO GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-[#f8fafc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <User size={16} />
                    <span className="text-xs font-bold uppercase">NIS</span>
                  </div>
                  <p className="text-sm font-black text-[#1d2433]">{selectedStudent.nis}</p>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <School size={16} />
                    <span className="text-xs font-bold uppercase">Kelas</span>
                  </div>
                  <p className="text-sm font-black text-[#1d2433]">{selectedStudent.kelas}</p>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <CalendarDays size={16} />
                    <span className="text-xs font-bold uppercase">Tanggal</span>
                  </div>
                  <p className="text-sm font-black text-[#1d2433]">{selectedStudent.tanggal}</p>
                </div>

                <div className="bg-[#f8fafc] rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <BadgeCheck size={16} />
                    <span className="text-xs font-bold uppercase">Status</span>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black ${statusColor(selectedStudent.status)}`}>
                    {selectedStudent.status || "pending"}
                  </span>
                </div>
              </div>

              {/* ALASAN */}
              <div className="mt-6">
                <h2 className="text-sm font-black text-gray-500 uppercase mb-3">Alasan Izin</h2>
                <div className="bg-[#f8fafc] rounded-2xl p-5 text-sm text-gray-700 leading-relaxed min-h-[120px]">
                  {selectedStudent.alasan || "-"}
                </div>
              </div>

              {/* LAMPIRAN */}
              <div className="mt-6">
                <h2 className="text-sm font-black text-gray-500 uppercase mb-3">Lampiran</h2>
                <button
                  onClick={() => setShowPreview(true)}
                  className="bg-[#3abef8] hover:bg-[#27aae3] text-white px-5 py-3 rounded-2xl text-sm font-black transition"
                >
                  Preview Foto
                </button>
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