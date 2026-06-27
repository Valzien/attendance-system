import { useEffect, useState, useMemo } from "react";
import Layout from "./Layout";
import { ShieldCheck, Search } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function ManageAdmin() {

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // =====================================================
  // FETCH TEACHERS
  // =====================================================

  const fetchTeachers = async () => {

    try {

      const res = await fetch(
        `${API_URL}/teachers`
      );

      const data = await res.json();

      console.log("DATA TEACHERS:", data);

      setTeachers(data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  // =====================================================
  // UPDATE ROLE
  // =====================================================

  const updateRole = async (nip, currentRole) => {

    if (!nip) {

      alert("NIP tidak ditemukan");

      return;

    }

    const newRole =
      currentRole === "admin"
        ? "guru"
        : "admin";

    console.log({
      nip,
      role: newRole,
    });

    try {

      const res = await fetch(
        `${API_URL}/admin/update-role`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            nip: String(nip),
            role: newRole,
          }),
        }
      );

      const result = await res.json();

      console.log("UPDATE ROLE:", result);

      if (!res.ok) {

        console.log(result);

        alert(
          result.detail
            ? JSON.stringify(result.detail)
            : "Gagal update role"
        );

        return;

      }

      if (!result.success) {

        alert(result.message);

        return;

      }

      alert("Role berhasil diubah");

      fetchTeachers();

    } catch (error) {

      console.error(error);

      alert("Terjadi kesalahan");

    }

  };

  useEffect(() => {

    fetchTeachers();

  }, []);

  // =====================================================
  // FILTER SEARCH
  // =====================================================

  const filteredTeachers = useMemo(() => {

    return teachers.filter((teacher) => {

      const search = searchTerm.toLowerCase();

      return (
        String(teacher.Nama || "")
          .toLowerCase()
          .includes(search) ||

        String(teacher.NIP || "")
          .toLowerCase()
          .includes(search)
      );

    });

  }, [teachers, searchTerm]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredTeachers.length / itemsPerPage
  );

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const paginatedTeachers =
    filteredTeachers.slice(
      startIndex,
      startIndex + itemsPerPage
    );

  return (

    <Layout>

      <div className="space-y-5">

        <div>

          <h1 className="text-3xl font-black text-[#1d2433]">
            Kelola Admin
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Atur hak akses guru menjadi admin
          </p>

        </div>
        {/* TOP BAR */}
        <div className="
          flex
          flex-col
          lg:flex-row
          lg:items-center
          lg:justify-between
          gap-4
        ">

          {/* SEARCH */}
          <div className="relative w-full max-w-sm">

            <Search
              size={18}
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Cari nama atau NIP..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="
                w-full
                bg-white
                border
                border-gray-200
                rounded-xl
                py-3
                pl-11
                pr-4
                text-sm
                font-semibold
                outline-none
                focus:border-[#1d2433]
                shadow-sm
              "
            />

          </div>

        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>

                <tr className="border-b border-gray-100 bg-[#f8fafc]">

                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">
                    NIP
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">
                    Nama Guru
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">
                    Pengampu
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase">
                    Role
                  </th>

                  <th className="px-6 py-4 text-center text-xs font-black text-gray-400 uppercase">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="text-center py-20 text-gray-400"
                    >
                      Memuat data...
                    </td>

                  </tr>

                ) : (

                  paginatedTeachers.map((teacher, index) => (

                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition"
                    >

                      {/* NIP */}
                      <td className="px-6 py-5 text-sm font-bold text-[#1d2433]">
                        {teacher.NIP}
                      </td>

                      {/* NAMA */}
                      <td className="px-6 py-5">

                        <p className="text-sm font-black text-[#1d2433]">
                          {teacher.Nama}
                        </p>

                      </td>

                      {/* PENGAMPU */}
                      <td className="px-6 py-5 text-sm font-semibold text-gray-600">
                        {teacher.Guru_Pengampu}
                      </td>

                      {/* ROLE */}
                      <td className="px-6 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black ${
                            teacher.role === "admin"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {teacher.role || "guru"}
                        </span>

                      </td>

                      {/* AKSI */}
                      <td className="px-6 py-5 text-center">

                        <button
                          onClick={() =>
                            updateRole(
                              teacher.NIP,
                              teacher.role || "guru"
                            )
                          }
                          className="inline-flex items-center gap-2 bg-[#1d2433] hover:bg-[#2c3547] text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                        >

                          <ShieldCheck size={16} />

                          {teacher.role === "admin"
                            ? "Jadikan Guru"
                            : "Jadikan Admin"}

                        </button>

                      </td>

                    </tr>

                  ))

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

              {/* SHOW DATA */}
              <div className="
                flex
                items-center
                gap-2
                text-sm
                text-gray-500
                font-semibold
              ">

                <span>Tampilkan</span>

                <select
                  value={itemsPerPage}
                  onChange={(e) => {

                    setItemsPerPage(
                      Number(e.target.value)
                    );

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

              {/* PAGE BUTTON */}
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

        </div>

      </div>

    </Layout>

  );

}