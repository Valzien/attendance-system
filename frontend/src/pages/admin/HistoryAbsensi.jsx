import { useEffect, useState } from "react";
import Layout from "./Layout";

import { getAttendanceHistory, getKelas } from "../../api";

import {
  Search,
  ChevronDown,
  Clock,
  Download,
  Eye,
  MapPin,
  X,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

const STATUS_CONFIG = {
  hadir: {
    bg: "bg-[#c7f5d8]",
    text: "text-[#2b8a57]",
    label: "Hadir",
  },
  telat: {
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    label: "Terlambat",
  },
  terlambat: {
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    label: "Terlambat",
  },
  izin: {
    bg: "bg-[#cbeeff]",
    text: "text-[#2f6fa1]",
    label: "Izin",
  },
  sakit: {
    bg: "bg-[#ffd8c7]",
    text: "text-[#cf6136]",
    label: "Sakit",
  },
  alfa: {
    bg: "bg-[#ffc8d0]",
    text: "text-[#cf3450]",
    label: "Tidak Hadir",
  },
};

const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function HistoryAbsensi() {
  const [history, setHistory] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedTanggal, setSelectedTanggal] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [previewMap, setPreviewMap] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportKelas, setExportKelas] = useState("");
  const [exportStatus, setExportStatus] = useState("semua");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");

  const formatJam = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "string" && value.includes(":")) {
      return value.slice(0, 5);
    }

    const num = Number(value);

    if (!isNaN(num)) {
      const jam = Math.floor(num / 3600).toString().padStart(2, "0");
      const menit = Math.floor((num % 3600) / 60).toString().padStart(2, "0");

      return `${jam}:${menit}`;
    }

    return "-";
  };

  const formatTanggal = (dateStr) => {
    if (!dateStr) return "-";

    return new Date(dateStr).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getFileUrl = (path) => {
    if (!path) return null;

    if (String(path).startsWith("http")) {
      return path;
    }

    return `${API_URL}/${path}`;
  };

  const getLateMinutes = (jamMasuk) => {
    if (!jamMasuk) return 0;

    let jam = 0;
    let menit = 0;

    if (typeof jamMasuk === "string" && jamMasuk.includes(":")) {
      const parts = jamMasuk.split(":");
      jam = Number(parts[0]);
      menit = Number(parts[1]);
    } else {
      const total = Number(jamMasuk);

      if (isNaN(total)) return 0;

      jam = Math.floor(total / 3600);
      menit = Math.floor((total % 3600) / 60);
    }

    const totalMasuk = jam * 60 + menit;
    const totalBatas = 7 * 60;

    if (totalMasuk <= totalBatas) return 0;

    return totalMasuk - totalBatas;
  };

  const loadKelas = async () => {
    try {
      const data = await getKelas();
      setKelasList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setKelasList([]);
    }
  };

  const loadHistory = async () => {
    setLoading(true);

    try {
      const data = await getAttendanceHistory(
        selectedKelas,
        selectedTanggal,
        search
      );

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setHistory([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadKelas();
  }, []);

  useEffect(() => {
    loadHistory();
  }, [selectedKelas, selectedTanggal, search]);

  const filteredHistory = history.filter((item) => {

    if (!selectedMonth) return true;

    const bulan = new Date(item.tanggal).toLocaleString(
      "id-ID",
      {
        month: "long",
      }
    );

    return bulan === selectedMonth;

  });

  // =========================
  // PAGINATION
  // =========================

  const totalPages = Math.ceil(
    filteredHistory.length / limit
  );

  const startIndex =
    (currentPage - 1) * limit;

  const paginatedHistory =
    filteredHistory.slice(
      startIndex,
      startIndex + limit
    );

  const getDisplayStatus = (item) => {
    const lateMinutes = getLateMinutes(item.jam_masuk);

    if (
      lateMinutes > 0 &&
      (item.status_kehadiran === "hadir" || item.status_kehadiran === "telat")
    ) {
      return {
        key: "terlambat",
        label: `Terlambat ${lateMinutes} Menit`,
        config: STATUS_CONFIG.terlambat,
      };
    }

    const key = item.status_kehadiran || "alfa";
    const config = STATUS_CONFIG[key] || STATUS_CONFIG.alfa;

    return {
      key,
      label: config.label,
      config,
    };
  };

  const exportCSV = (dataExport = filteredHistory) => {
    const rows = [
      [
        "NIS",
        "Nama Siswa",
        "Kelas",
        "Tanggal",
        "Jam Masuk",
        "Jam Keluar",
        "Status Kehadiran",
        "Keterangan",
        "Foto Absen",
        "Foto Keluar",
        "Latitude Masuk",
        "Longitude Masuk",
        "Latitude Keluar",
        "Longitude Keluar",
      ],
      ...dataExport.map((item) => {
        const status = getDisplayStatus(item);

        return [
          
          item.nis,
          item.nama_siswa,
          item.id_kelas,
          item.tanggal,
          item.jam_masuk || "",
          item.jam_keluar || "",
          item.status_kehadiran,
          item.keterangan,
          item.created_at || "",
          item.foto_absen || "",
          item.foto_keluar || "",
          item.latitude_masuk || "",
          item.longitude_masuk || "",
          item.latitude_keluar || "",
          item.longitude_keluar || "",
        ];
      }),
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "rekap_absensi.csv");

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
  const result = history.filter((item) => {
    const kelasMatch =
      !exportKelas || item.nama_kelas === exportKelas;

    const statusMatch =
      exportStatus === "semua" ||
      item.status_kehadiran === exportStatus;

    const current = new Date(item.tanggal);

    const start = exportStartDate
      ? new Date(exportStartDate)
      : null;

    const end = exportEndDate
      ? new Date(exportEndDate + "T23:59:59")
      : null;

    const dateMatch =
      (!start || current >= start) &&
      (!end || current <= end);

    return kelasMatch && statusMatch && dateMatch;
  });

  exportCSV(result);
  setShowExportModal(false);
};

  return (
    <Layout>
      <div className="w-full px-4 mt-4 pb-20">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">History Absensi Siswa</h1>

          <p className="text-gray-500 text-sm mt-1">
            Riwayat lengkap absensi masuk & keluar siswa
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Cari nama atau NIS"
                value={search}
                onChange={(e) => {setSearch(e.target.value); setCurrentPage(1);
                }}
                className="border border-gray-200 rounded-2xl pl-10 pr-4 py-3 text-sm outline-none w-[240px] focus:border-[#3abef8]"
              />
            </div>

            <div className="relative">
              <select
                value={selectedKelas}
                onChange={(e) => {setSelectedKelas(e.target.value); setCurrentPage(1);
                }}
                className="appearance-none border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm outline-none min-w-[180px] focus:border-[#3abef8]"
              >
                <option value="">Semua Kelas</option>

                {kelasList.map((kelas) => (
                  <option key={kelas.id} value={kelas.nama_kelas}>
                    {kelas.nama_kelas}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {setSelectedMonth(e.target.value); setCurrentPage(1);
                }}
                className="appearance-none border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm outline-none min-w-[180px] focus:border-[#3abef8]"
              >
                <option value="">Semua Bulan</option>

                {BULAN.map((bulan) => (
                  <option key={bulan} value={bulan}>
                    {bulan}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            <input
              type="date"
              value={selectedTanggal}
              onChange={(e) => {setSelectedTanggal(e.target.value);setCurrentPage(1);
              }}
              className="border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#3abef8]"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => {setLimit(Number(e.target.value)); setCurrentPage(1);
                }}
                className="appearance-none border border-gray-200 rounded-2xl px-4 py-3 pr-10 text-sm font-semibold outline-none focus:border-[#3abef8]"
              >
                <option value={10}>10 Data</option>
                <option value={20}>20 Data</option>
                <option value={50}>50 Data</option>
                <option value={100}>100 Data</option>
              </select>

              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-[#1d2433] hover:bg-[#2d3748] text-white px-5 py-3 rounded-2xl text-sm font-bold transition"
            >
              <Download size={16} />
              Export Data
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-gray-100">
          <table className="w-full min-w-[1250px]">
            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-gray-200 text-left">
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">NIS</th>
                <th className="px-5 py-4">Kelas</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Jam Masuk</th>
                <th className="px-5 py-4">Jam Keluar</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Keterangan</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-[#1d2433] animate-spin" />

                      <p className="text-sm text-gray-400">Memuat data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-gray-400">
                    Tidak ada history absensi
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => {
                  const status = getDisplayStatus(item);
                  const cfg = status.config;

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 font-bold">{item.nama_siswa}</td>
                      <td className="px-5 py-4">{item.nis}</td>
                      <td className="px-5 py-4">{item.nama_kelas}</td>
                      <td className="px-5 py-4">{formatTanggal(item.tanggal)}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-gray-400" />
                          <span>{formatJam(item.jam_masuk)}</span>

                          {item.foto_masuk && (
                            <button
                              onClick={() => setPreviewPhoto(item.foto_masuk)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Preview foto masuk"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {item.latitude_masuk && item.longitude_masuk && (
                            <button
                              onClick={() =>
                                setPreviewMap({
                                  lat: item.latitude_masuk,
                                  lng: item.longitude_masuk,
                                })
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Lihat lokasi masuk"
                            >
                              <MapPin size={16} />
                            </button>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-gray-400" />
                          <span>{formatJam(item.jam_keluar)}</span>

                          {item.foto_keluar && (
                            <button
                              onClick={() => setPreviewPhoto(item.foto_keluar)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Preview foto keluar"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {item.latitude_keluar && item.longitude_keluar && (
                              <button
                                onClick={() =>
                                  setPreviewMap({
                                    lat: item.latitude_keluar,
                                    lng: item.longitude_keluar,
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                                title="Lihat lokasi keluar"
                              >
                                <MapPin size={16} />
                              </button>
                            )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.text}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td className="px-5 py-4">{item.keterangan || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          {/* PAGINATION */}
          <div className="
            flex
            flex-col
            lg:flex-row
            items-center
            justify-between
            gap-4
            p-5
            border-t
            border-gray-100
          ">

            <div className="text-sm text-gray-500 font-semibold">

              Menampilkan {paginatedHistory.length} dari{" "}
              {filteredHistory.length} data

            </div>

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

        {showExportModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-xl shadow-xl relative">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-black"
              >
                <X size={22} />
              </button>

              <h2 className="text-xl font-extrabold mb-2">
                Ekspor Rekap Absensi
              </h2>

              <p className="text-sm text-gray-500 mb-6">
                Pilih filter data sebelum mengunduh rekap absensi.
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Kelas
                  </label>

                  <select
                    value={exportKelas}
                    onChange={(e) => setExportKelas(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="">Semua Kelas</option>

                    {kelasList.map((kelas) => (
                      <option key={kelas.id} value={kelas.nama_kelas}>
                        {kelas.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Mulai Tanggal
                  </label>

                  <input
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Sampai Tanggal
                  </label>

                  <input
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Status
                  </label>

                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="mt-2 w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none"
                  >
                    <option value="semua">Semua</option>
                    <option value="hadir">Hadir</option>
                    <option value="izin">Izin</option>
                    <option value="alfa">Tidak Hadir</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleExport}
                className="mt-6 w-full bg-[#1d2433] hover:bg-[#2d3748] text-white py-3 rounded-2xl font-bold"
              >
                Unduh Rekap
              </button>
            </div>
          </div>
        )}

        {previewPhoto && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-5 max-w-3xl w-full relative">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow"
              >
                <X size={20} />
              </button>

              <img
                src={getFileUrl(previewPhoto)}
                alt="Foto Absensi"
                className="w-full max-h-[75vh] object-contain rounded-2xl bg-black"
              />
            </div>
          </div>
        )}

        {previewMap && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-5 max-w-4xl w-full relative">
              <button
                onClick={() => setPreviewMap(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow z-10"
              >
                <X size={20} />
              </button>

              <iframe
                title="Lokasi Presensi"
                src={`https://www.google.com/maps?q=${previewMap.lat},${previewMap.lng}&z=18&output=embed`}
                className="w-full h-[500px] rounded-2xl"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}