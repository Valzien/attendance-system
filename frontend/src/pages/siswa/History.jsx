import { useEffect, useState } from "react";
import Layout from "./Layout";

import { getStudentHistory } from "../../api";

import {
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MinusCircle,
  Eye,
  MapPin,
  X
} from 'lucide-react';

const API_URL = "http://127.0.0.1:8000";

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

const STATUS_CONFIG = {
  hadir: {
    label: "Hadir",
    bg: "bg-[#c7f5d8]",
    text: "text-[#2b8a57]",
    icon: CheckCircle2,
  },

  telat: {
    label: "Terlambat",
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    icon: AlertCircle,
  },

  terlambat: {
    label: "Terlambat",
    bg: "bg-[#f7f0c6]",
    text: "text-[#756d24]",
    icon: AlertCircle,
  },

  izin: {
    label: "Izin",
    bg: "bg-[#cbeeff]",
    text: "text-[#2f6fa1]",
    icon: MinusCircle,
  },

  sakit: {
    label: "Sakit",
    bg: "bg-[#ffd8c7]",
    text: "text-[#cf6136]",
    icon: AlertCircle,
  },

  alfa: {
    label: "Tidak Hadir",
    bg: "bg-[#ffc8d0]",
    text: "text-[#cf3450]",
    icon: XCircle,
  },

  tidak_hadir: {
    label: "Tidak Hadir",
    bg: "bg-[#ffc8d0]",
    text: "text-[#cf3450]",
    icon: XCircle,
  },
};

export default function History() {
  const [history, setHistory] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");

  const [loading, setLoading] = useState(true);

  const [limit, setLimit] = useState(10);

  const [currentPage, setCurrentPage] = useState(1);

  const [previewPhoto, setPreviewPhoto] = useState(null);

  const [previewMap, setPreviewMap] = useState(null);

  const formatJam = (value) => {
    if (value === null || value === undefined || value === "") return "-";

    if (typeof value === "string" && value.includes(":")) {
      return value.slice(0, 5);
    }

    const num = Number(value);

    if (!isNaN(num)) {
      const jam = Math.floor(num / 3600)
        .toString()
        .padStart(2, "0");

      const menit = Math.floor((num % 3600) / 60)
        .toString()
        .padStart(2, "0");

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

    const batas = 7 * 60;

    if (totalMasuk <= batas) return 0;

    return totalMasuk - batas;
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user?.nis) return;

      const data = await getStudentHistory(user.nis);

      setHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      setHistory([]);
    }

    setLoading(false);
  };

  const filteredHistory = history.filter((item) => {
    if (!selectedMonth) return true;

    const bulan = new Date(item.tanggal).toLocaleString("id-ID", {
      month: "long",
    });

    return bulan === selectedMonth;
  });

  // PAGINATION

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
      (item.status_kehadiran === "hadir" ||
        item.status_kehadiran === "telat")
    ) {
      return {
        key: "terlambat",
        label: `Terlambat ${lateMinutes} Menit`,
        config: STATUS_CONFIG.terlambat,
      };
    }

    const key =
      item.status_kehadiran || "tidak_hadir";

    const config =
      STATUS_CONFIG[key] ||
      STATUS_CONFIG.tidak_hadir;

    return {
      key,
      label: config.label,
      config,
    };
  };

  // SUMMARY

  const counts = {
    hadir: filteredHistory.filter(
      (d) =>
        d.status_kehadiran === "hadir" ||
        d.status_kehadiran === "telat" ||
        d.status_kehadiran === "terlambat"
    ).length,

    izin: filteredHistory.filter(
      (d) => d.status_kehadiran === "izin"
    ).length,

    sakit: filteredHistory.filter(
      (d) => d.status_kehadiran === "sakit"
    ).length,

    tidak_hadir: filteredHistory.filter(
      (d) =>
        d.status_kehadiran === "alfa" ||
        d.status_kehadiran === "tidak_hadir"
    ).length,
  };

  return (
    <Layout>
      <div className="w-full px-4 mt-4 pb-20">

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">
            History Absensi Saya
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Riwayat lengkap absensi masuk & keluar
          </p>
        </div>

        {/* FILTER */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">

          <div className="flex flex-wrap gap-3">

            {/* BULAN */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
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

            {/* LIMIT */}
            <div className="relative">
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
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
          </div>

          {/* SUMMARY */}
          <div className="flex flex-wrap gap-2">
            {[
              {
                label: "Hadir",
                val: counts.hadir,
                bg: "bg-[#c7f5d8]",
                text: "text-[#2b8a57]",
              },

              {
                label: "Izin",
                val: counts.izin,
                bg: "bg-[#cbeeff]",
                text: "text-[#2f6fa1]",
              },

              {
                label: "Sakit",
                val: counts.sakit,
                bg: "bg-[#ffd8c7]",
                text: "text-[#cf6136]",
              },

              {
                label: "Alpha",
                val: counts.tidak_hadir,
                bg: "bg-[#ffc8d0]",
                text: "text-[#cf3450]",
              },
            ].map((c) => (
              <div
                key={c.label}
                className={`${c.bg} ${c.text} text-[12px] font-black px-3 py-1 rounded-lg`}
              >
                {c.label}: {c.val}
              </div>
            ))}
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto bg-white rounded-3xl shadow-sm border border-gray-100">

          <table className="w-full min-w-[1100px]">

            <thead className="bg-[#f8f9fa]">
              <tr className="border-b border-gray-200 text-left">

                <th className="px-5 py-4">
                  Tanggal
                </th>

                <th className="px-5 py-4 text-center">
                  Jam Masuk
                </th>

                <th className="px-5 py-4 text-center">
                  Jam Keluar
                </th>

                <th className="px-5 py-4 text-center">
                  Status
                </th>

                <th className="px-5 py-4 text-center">
                  Keterangan
                </th>

              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-[#1d2433] animate-spin" />

                      <p className="text-sm text-gray-400">
                        Memuat data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-16 text-center text-gray-400"
                  >
                    Tidak ada history absensi
                  </td>
                </tr>
              ) : (
                paginatedHistory.map((item, index) => {
                  const status =
                    getDisplayStatus(item);

                  const cfg = status.config;

                  const Icon = cfg.icon;

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {formatTanggal(item.tanggal)}
                      </td>

                      {/* MASUK */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">

                          <Clock
                            size={13}
                            className="text-gray-400"
                          />

                          <span>
                            {formatJam(item.jam_masuk)}
                          </span>

                          {item.foto_masuk && (
                            <button
                              onClick={() =>
                                setPreviewPhoto(
                                  item.foto_masuk
                                )
                              }
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {item.latitude_masuk &&
                            item.longitude_masuk && (
                              <button
                                onClick={() =>
                                  setPreviewMap({
                                    lat: item.latitude_masuk,
                                    lng: item.longitude_masuk,
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <MapPin size={16} />
                              </button>
                            )}

                        </div>
                      </td>

                      {/* KELUAR */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">

                          <Clock
                            size={13}
                            className="text-gray-400"
                          />

                          <span>
                            {formatJam(item.jam_keluar)}
                          </span>

                          {item.foto_keluar && (
                            <button
                              onClick={() =>
                                setPreviewPhoto(
                                  item.foto_keluar
                                )
                              }
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Eye size={16} />
                            </button>
                          )}

                          {item.latitude_keluar &&
                            item.longitude_keluar && (
                              <button
                                onClick={() =>
                                  setPreviewMap({
                                    lat: item.latitude_keluar,
                                    lng: item.longitude_keluar,
                                  })
                                }
                                className="text-red-500 hover:text-red-700"
                              >
                                <MapPin size={16} />
                              </button>
                            )}

                        </div>
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${cfg.bg} ${cfg.text}`}
                        >
                          <Icon size={12} />
                          {status.label}
                        </span>
                      </td>

                      {/* KETERANGAN */}
                      <td className="px-5 py-4 text-center">
                        <span
                          className={`text-sm font-semibold ${cfg.text}`}
                        >
                          {item.keterangan || "-"}
                        </span>
                      </td>

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

        {/* PREVIEW FOTO */}
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

        {/* PREVIEW MAP */}
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