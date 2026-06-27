import { useEffect, useState } from "react";
import Layout from "./Layout";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from "lucide-react";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER
  const [selectedMonth, setSelectedMonth] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(
          "http://localhost:8000/permission-forms"
        );

        const data = await res.json();

        setNotifications(
          Array.isArray(data) ? data : []
        );

        await fetch(
          "http://127.0.0.1:8000/guru/notifications/read",
          {
            method: "POST",
          }
        );
      } catch (err) {
        console.log(
          "Gagal mengambil notifikasi:",
          err
        );

        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // =========================================
  // FILTER BULAN
  // =========================================

  const filteredNotifications =
    notifications.filter((item) => {
      if (!selectedMonth) return true;

      const bulan = new Date(
        item.tanggal
      ).toLocaleString("id-ID", {
        month: "long",
      });

      return bulan === selectedMonth;
    });

  // =========================================
  // PAGINATION
  // =========================================

  const totalPages = Math.ceil(
    filteredNotifications.length /
      itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedNotifications =
    filteredNotifications.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  return (
    <Layout>
      <div className="w-full max-w-5xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">
            Notifikasi
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Riwayat notifikasi pengajuan izin siswa
          </p>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="text-center py-10 font-bold">
            Memuat...
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-10 text-gray-400 font-bold">
            Tidak ada notifikasi
          </div>
        ) : (
          <>
            {/* FILTER */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex flex-wrap items-center gap-3">
                {/* FILTER BULAN */}
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(
                        e.target.value
                      );

                      setCurrentPage(1);
                    }}
                    className="
                      appearance-none
                      border
                      border-gray-200
                      rounded-2xl
                      px-4
                      py-3
                      pr-10
                      text-sm
                      outline-none
                      min-w-[180px]
                      focus:border-[#3abef8]
                    "
                  >
                    <option value="">
                      Semua Bulan
                    </option>

                    {BULAN.map((bulan) => (
                      <option
                        key={bulan}
                        value={bulan}
                      >
                        {bulan}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                      pointer-events-none
                    "
                  />
                </div>
              </div>

              {/* LIMIT */}
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(
                      Number(e.target.value)
                    );

                    setCurrentPage(1);
                  }}
                  className="
                    appearance-none
                    border
                    border-gray-200
                    rounded-2xl
                    px-4
                    py-3
                    pr-10
                    text-sm
                    font-semibold
                    outline-none
                    focus:border-[#3abef8]
                  "
                >
                  <option value={10}>
                    10 Data
                  </option>

                  <option value={25}>
                    25 Data
                  </option>

                  <option value={50}>
                    50 Data
                  </option>

                  <option value={100}>
                    100 Data
                  </option>
                </select>

                <ChevronDown
                  size={15}
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-gray-400
                    pointer-events-none
                  "
                />
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left font-semibold text-gray-500 px-5 py-3 w-10">
                      #
                    </th>

                    <th className="text-left font-semibold text-gray-500 px-5 py-3">
                      Status
                    </th>

                    <th className="text-left font-semibold text-gray-500 px-5 py-3">
                      Nama Siswa
                    </th>

                    <th className="text-left font-semibold text-gray-500 px-5 py-3">
                      Alasan
                    </th>

                    <th className="text-left font-semibold text-gray-500 px-5 py-3">
                      Keterangan
                    </th>

                    <th className="text-left font-semibold text-gray-500 px-5 py-3">
                      Tanggal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {paginatedNotifications.map(
                    (item, index) => {
                      const isApproved =
                        item.status ===
                        "disetujui";

                      const isRejected =
                        item.status ===
                        "ditolak";

                      let IconComponent =
                        Bell;

                      let iconBg =
                        "bg-yellow-100";

                      let iconColor =
                        "text-yellow-600";

                      if (isApproved) {
                        IconComponent =
                          CheckCircle2;

                        iconBg =
                          "bg-green-100";

                        iconColor =
                          "text-green-600";
                      }

                      if (isRejected) {
                        IconComponent =
                          XCircle;

                        iconBg =
                          "bg-red-100";

                        iconColor =
                          "text-red-600";
                      }

                      let notifTitle =
                        "Pengajuan izin baru";

                      if (isApproved)
                        notifTitle =
                          "Disetujui";

                      if (isRejected)
                        notifTitle =
                          "Ditolak";

                      return (
                        <tr
                          key={index}
                          className="
                            border-b
                            border-gray-50
                            last:border-0
                            hover:bg-gray-50
                            transition
                          "
                        >
                          <td className="px-5 py-4 text-gray-400">
                            {startIndex +
                              index +
                              1}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={`
                                  w-8
                                  h-8
                                  rounded-full
                                  ${iconBg}
                                  flex
                                  items-center
                                  justify-center
                                  shrink-0
                                `}
                              >
                                <IconComponent
                                  size={16}
                                  className={
                                    iconColor
                                  }
                                />
                              </div>

                              <span
                                className={`
                                  text-xs
                                  font-bold
                                  px-2.5
                                  py-1
                                  rounded-full
                                  ${
                                    isApproved
                                      ? "bg-[#eaf8ed] text-[#2a8742]"
                                      : isRejected
                                      ? "bg-[#fee2e2] text-[#b91c1c]"
                                      : "bg-yellow-50 text-yellow-700"
                                  }
                                `}
                              >
                                {notifTitle}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4 font-medium text-gray-700">
                            {item.nama_siswa}
                          </td>

                          <td className="px-5 py-4 text-gray-500">
                            {item.alasan ||
                              "-"}
                          </td>

                          <td className="px-5 py-4 text-gray-500">
                            {item.keterangan ||
                              "-"}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-gray-400 whitespace-nowrap">
                              <CalendarDays
                                size={13}
                              />

                              {item.tanggal}
                            </div>
                          </td>
                        </tr>
                      );
                    }
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
                <div
                  className="
                    text-[13px]
                    font-semibold
                    text-gray-500
                  "
                >
                  Menampilkan{" "}
                  {
                    paginatedNotifications.length
                  }{" "}
                  dari{" "}
                  {
                    filteredNotifications.length
                  }{" "}
                  data
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={
                      currentPage === 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) => prev - 1
                      )
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
                    {currentPage} /{" "}
                    {totalPages || 1}
                  </div>

                  <button
                    disabled={
                      currentPage ===
                        totalPages ||
                      totalPages === 0
                    }
                    onClick={() =>
                      setCurrentPage(
                        (prev) => prev + 1
                      )
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
          </>
        )}
      </div>
    </Layout>
  );
}