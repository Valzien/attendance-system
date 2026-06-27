import { useEffect, useState } from "react";
import Layout from "./Layout";
import {
  Bell,
  CalendarDays,
  ChevronDown,
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
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/admin/notifications"
      );

      const data = await res.json();

      const formatted = Array.isArray(data)
        ? data.map((item) => {
            const dateObj = new Date(item.tanggal);

            return {
              ...item,
              dateObj,
              bulanStr: dateObj.toLocaleString("id-ID", {
                month: "long",
              }),
            };
          })
        : [];

      setNotifications(formatted);

    } catch (err) {

      console.log(
        "Gagal mengambil notifikasi admin:",
        err
      );

      setNotifications([]);

    } finally {

      setLoading(false);

    }
  };

  // FILTER BULAN
  const filteredNotifications = selectedMonth
    ? notifications.filter(
        (item) => item.bulanStr === selectedMonth
      )
    : notifications;

  // PAGINATION
  const totalPages = Math.ceil(
    filteredNotifications.length / itemsPerPage
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
      <div className="w-full max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold">
            Notifikasi
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Riwayat notifikasi pengajuan izin siswa
          </p>
        </div>

        {/* FILTER + LIMIT */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">

          <div className="flex flex-wrap items-center gap-3">

            {/* FILTER BULAN */}
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => {
                  setSelectedMonth(e.target.value);
                  setCurrentPage(1);
                }}
                className="
                  appearance-none
                  bg-white
                  border
                  border-gray-200
                  rounded-2xl
                  px-4
                  py-3
                  pr-10
                  text-sm
                  font-semibold
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
                bg-white
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
        <div className="
          bg-white
          rounded-3xl
          shadow-sm
          border
          border-gray-100
          overflow-hidden
        ">

          {loading ? (

            <div className="
              flex
              flex-col
              items-center
              justify-center
              py-20
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

          ) : filteredNotifications.length === 0 ? (

            <div className="
              text-center
              py-20
              text-gray-400
            ">
              Tidak ada notifikasi
            </div>

          ) : (

            <>
              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px] text-sm">

                  <thead className="bg-[#f8f9fa]">

                    <tr className="
                      border-b
                      border-gray-100
                    ">

                      <th className="
                        text-left
                        px-5
                        py-4
                        w-16
                      ">
                        #
                      </th>

                      <th className="
                        text-left
                        px-5
                        py-4
                      ">
                        Jenis
                      </th>

                      <th className="
                        text-left
                        px-5
                        py-4
                      ">
                        Nama Siswa
                      </th>

                      <th className="
                        text-left
                        px-5
                        py-4
                      ">
                        Kelas
                      </th>

                      <th className="
                        text-left
                        px-5
                        py-4
                      ">
                        Alasan
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

                    {paginatedNotifications.map(
                      (item, index) => (

                        <tr
                          key={`${item.nis}-${item.tanggal}-${index}`}
                          className="
                            border-b
                            border-gray-50
                            hover:bg-gray-50
                            transition
                          "
                        >

                          <td className="
                            px-5
                            py-4
                            text-gray-400
                          ">
                            {startIndex + index + 1}
                          </td>

                          <td className="px-5 py-4">

                            <div className="
                              flex
                              items-center
                              gap-2
                            ">

                              <div className="
                                w-9
                                h-9
                                rounded-full
                                bg-yellow-100
                                flex
                                items-center
                                justify-center
                                shrink-0
                              ">

                                <Bell
                                  size={16}
                                  className="
                                    text-yellow-600
                                  "
                                />

                              </div>

                              <span className="
                                font-bold
                                text-[#1d2433]
                                whitespace-nowrap
                              ">
                                Pengajuan izin baru
                              </span>

                            </div>

                          </td>

                          <td className="
                            px-5
                            py-4
                            font-semibold
                            text-gray-700
                          ">
                            {item.nama_siswa}
                          </td>

                          <td className="
                            px-5
                            py-4
                            text-gray-600
                          ">
                            {item.kelas}
                          </td>

                          <td className="
                            px-5
                            py-4
                            text-gray-500
                          ">
                            {item.alasan || "-"}
                          </td>

                          <td className="px-5 py-4">

                            <div className="
                              flex
                              items-center
                              gap-2
                              text-gray-500
                              whitespace-nowrap
                            ">

                              <CalendarDays size={14} />

                              {item.tanggal}

                            </div>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

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
                  {paginatedNotifications.length} dari{" "}
                  {filteredNotifications.length} data

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
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}