import { useState, useEffect } from "react";
import Layout from "./Layout";

import {
  Bell,
  ChevronDown,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";

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

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTER
  const [selectedMonth, setSelectedMonth] = useState("");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {

    try {

      const user = JSON.parse(
        localStorage.getItem("user")
      );

      if (!user?.nis) {

        console.error("NIS tidak ditemukan");
        setLoading(false);
        return;

      }

      const response = await fetch(
        `http://127.0.0.1:8000/notifications/${user.nis}`
      );

      const data = await response.json();

      const formatted = Array.isArray(data)
        ? data.map((item) => {

            const dateObj = new Date(
              item.created_at
            );

            return {
              ...item,
              dateObj,
              bulanStr:
                dateObj.toLocaleString(
                  "id-ID",
                  {
                    month: "long",
                  }
                ),
            };

          })
        : [];

      setNotifications(formatted);

      // AUTO READ
      await fetch(
        `http://127.0.0.1:8000/notifications/read/${user.nis}`,
        {
          method: "POST",
        }
      );

    } catch (error) {

      console.error(
        "Gagal mengambil notifikasi:",
        error
      );

    } finally {

      setLoading(false);

    }
  };

  // FILTER BULAN
  const filteredNotifications =
    selectedMonth
      ? notifications.filter(
          (item) =>
            item.bulanStr === selectedMonth
        )
      : notifications;

  // PAGINATION
  const totalPages = Math.ceil(
    filteredNotifications.length / limit
  );

  const startIndex =
    (currentPage - 1) * limit;

  const paginatedNotifications =
    filteredNotifications.slice(
      startIndex,
      startIndex + limit
    );

  // SUMMARY
  const approvedCount =
    notifications.filter((n) =>
      String(n.message)
        .toLowerCase()
        .includes("disetujui")
    ).length;

  const rejectedCount =
    notifications.filter((n) =>
      String(n.message)
        .toLowerCase()
        .includes("ditolak")
    ).length;

  const infoCount =
    notifications.length -
    approvedCount -
    rejectedCount;

  return (
    <Layout>

      <div className="w-full max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">

          <h1 className="text-2xl font-extrabold">
            Notifikasi
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Riwayat notifikasi izin,
            absensi dan informasi lainnya
          </p>

        </div>

        {/* FILTER */}
        <div className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
          mb-5
        ">

          <div className="flex items-center gap-3">

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
              value={limit}
              onChange={(e) => {

                setLimit(
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

              <option value={20}>
                20 Data
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

        {/* SUMMARY */}
        <div className="
          flex
          flex-wrap
          gap-2
          mb-5
        ">

          <div className="
            bg-green-100
            text-green-700
            px-4
            py-2
            rounded-xl
            text-sm
            font-bold
          ">
            Disetujui: {approvedCount}
          </div>

          <div className="
            bg-red-100
            text-red-700
            px-4
            py-2
            rounded-xl
            text-sm
            font-bold
          ">
            Ditolak: {rejectedCount}
          </div>

          <div className="
            bg-blue-100
            text-blue-700
            px-4
            py-2
            rounded-xl
            text-sm
            font-bold
          ">
            Info: {infoCount}
          </div>

        </div>

        {/* TABLE */}
        <div className="
          bg-white
          rounded-3xl
          border
          border-gray-100
          shadow-sm
          overflow-hidden
        ">

          {loading ? (

            <div className="
              py-20
              flex
              flex-col
              items-center
              justify-center
              gap-3
            ">

              <div className="
                w-7
                h-7
                rounded-full
                border-[3px]
                border-gray-200
                border-t-[#1d2433]
                animate-spin
              " />

              <p className="
                text-sm
                text-gray-400
              ">
                Memuat notifikasi...
              </p>

            </div>

          ) : (
            <div className="overflow-x-auto">

              <table className="
                w-full
                min-w-[850px]
                text-sm
              ">

                <thead className="bg-[#f8f9fa]">

                  <tr className="
                    border-b
                    border-gray-100
                  ">

                    <th className="
                      text-left
                      px-5
                      py-4
                    ">
                      Status
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-4
                    ">
                      Judul
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-4
                    ">
                      Pesan
                    </th>

                    <th className="
                      text-left
                      px-5
                      py-4
                    ">
                      Tanggal
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {paginatedNotifications.length > 0 ? (

                    paginatedNotifications.map(
                      (notif, index) => {

                        const message =
                          String(
                            notif.message || ""
                          ).toLowerCase();

                        const isApproved =
                          message.includes(
                            "disetujui"
                          );

                        const isRejected =
                          message.includes(
                            "ditolak"
                          );

                        const badgeClass =
                          isApproved
                            ? "bg-green-100 text-green-700"
                            : isRejected
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700";

                        const Icon =
                          isApproved
                            ? CheckCircle
                            : isRejected
                            ? XCircle
                            : Info;

                        return (

                          <tr
                            key={index}
                            className="
                              border-b
                              border-gray-100
                              hover:bg-gray-50
                              transition
                            "
                          >

                            <td className="
                              px-5
                              py-4
                            ">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-1.5
                                  px-3
                                  py-1
                                  rounded-xl
                                  text-xs
                                  font-bold
                                  ${badgeClass}
                                `}
                              >

                                <Icon size={12} />

                                {isApproved
                                  ? "Disetujui"
                                  : isRejected
                                  ? "Ditolak"
                                  : "Info"}

                              </span>

                            </td>

                            <td className="
                              px-5
                              py-4
                              font-bold
                            ">
                              {notif.title}
                            </td>

                            <td className="
                              px-5
                              py-4
                              text-gray-600
                            ">
                              {notif.message}
                            </td>

                            <td className="
                              px-5
                              py-4
                              whitespace-nowrap
                              text-gray-500
                            ">

                              {notif.created_at
                                ?.replace("T", " ")
                                ?.slice(0, 16)}

                            </td>

                          </tr>

                        );

                      }
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan="4"
                        className="
                          py-16
                          text-center
                          text-gray-400
                        "
                      >
                        Tidak ada notifikasi
                      </td>

                    </tr>

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

                <div className="
                  text-sm
                  text-gray-500
                  font-semibold
                ">

                  Menampilkan{" "}
                  {paginatedNotifications.length}
                  {" "}dari{" "}
                  {filteredNotifications.length}
                  {" "}data

                </div>

                <div className="
                  flex
                  items-center
                  gap-2
                ">

                  <button
                    disabled={currentPage === 1}
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
          )}

        </div>

      </div>

    </Layout>
  );
}