import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./Layout";

import {
  Search,
  Edit3,
  Trash2,
  Upload,
  Download,
} from "lucide-react";

export default function DataGuru() {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // =========================
  // IMPORT EXCEL API
  // =========================
  const importTeachers = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/teachers/import",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Gagal import");
    }

    return data;

  };

  // =========================
  // FETCH DATA GURU
  // =========================
  const fetchTeachers = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/teachers"
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const data = await response.json();

      console.log(data)

      setTeachers(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error("Error:", error);

      setTeachers([]);

    }

    setLoading(false);

  };

  // =========================
  // DELETE GURU
  // =========================
  const handleDelete = async (nip) => {

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus data guru ini?"
    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(
        `http://localhost:8000/teacher/${nip}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      alert("Data guru berhasil dihapus");

      fetchTeachers();

    } catch (error) {

      console.error(error);

      alert("Gagal menghapus data guru");

    }

  };

    // =========================
    // IMPORT GURU
    // =========================
    const handleImport = async (e) => {

      const file = e.target.files[0];

      if (!file) return;

      try {

        setUploading(true);

        const result = await importTeachers(file);

        alert(result.message);

        fetchTeachers();

      } catch (error) {

        console.error(error);

        alert(error.message);

      } finally {

        setUploading(false);

      }

    };

  // =========================
  // LOAD AWAL
  // =========================
  useEffect(() => {
    fetchTeachers();
  }, []);

  // =========================
  // FILTER SEARCH
  // =========================
  const filteredTeachers = teachers.filter((t) => {

    const searchLow = searchTerm.toLowerCase();

    const nama = t.Nama
      ? t.Nama.toLowerCase()
      : "";

    const nip = t.NIP
      ? t.NIP.toString()
      : "";

    return (
      nama.includes(searchLow) ||
      nip.includes(searchLow)
    );

  });
  
  // =========================
  // PAGINATION
  // =========================
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

        {/* HEADER */}
        <div>

          <h1 className="text-2xl font-black text-[#1d2433]">

            Data Guru

          </h1>

          <p className="text-sm text-gray-400 font-medium mt-1">

            Kelola seluruh data guru sekolah

          </p>

        </div>

        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

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
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
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

          {/* BUTTONS */}
          <div className="flex flex-wrap gap-3">

            {/* DOWNLOAD TEMPLATE */}
            <a
              href="/template_guru.xlsx"
              download
              className="
                flex
                items-center
                gap-2
                bg-[#c7f5d8]
                hover:bg-[#b3efc8]
                text-[#2b8a57]
                px-4
                py-3
                rounded-xl
                text-sm
                font-black
                transition-colors
              "
            >

              <Download size={16} />

              Template

            </a>

            {/* IMPORT */}
            <label
              className="
                flex
                items-center
                gap-2
                bg-[#1d2433]
                hover:bg-[#2d3748]
                text-white
                px-4
                py-3
                rounded-xl
                text-sm
                font-black
                cursor-pointer
                transition-colors
              "
            >

              <Upload size={16} />

              {uploading ? "Import..." : "Import Excel"}

            <input
              type="file"
              accept=".xlsx"
              hidden
              onChange={handleImport}
            />

            </label>

          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full whitespace-nowrap">

              <thead>

                <tr className="bg-[#f8f9fa] border-b border-gray-100">

                  <th className="py-4 px-5 text-left text-[11px] font-black text-gray-400 uppercase">
                    Nama
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    NIP
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Tanggal Lahir
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Guru Pengampu
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Alamat
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    No. HP
                  </th>

                  <th className="py-4 px-4 text-center text-[11px] font-black text-gray-400 uppercase">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="py-16 text-center"
                    >

                      <div className="flex flex-col items-center gap-2">

                        <div className="w-7 h-7 rounded-full border-[3px] border-gray-200 border-t-[#1d2433] animate-spin" />

                        <p className="text-[12px] text-gray-400 font-medium">
                          Memuat data...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredTeachers.length > 0 ? (

                  paginatedTeachers.map((teacher, index) => (

                    <tr
                      key={index}
                      className="
                        border-b
                        border-gray-50
                        hover:bg-gray-50
                        transition-colors
                      "
                    >

                      {/* NAMA */}
                      <td className="py-4 px-5">

                        <div className="flex items-center gap-3">

                          <div className="
                            w-9
                            h-9
                            rounded-xl
                            bg-[#e8eaf0]
                            flex
                            items-center
                            justify-center
                            text-[12px]
                            font-black
                            text-[#1d2433]
                          ">

                            {teacher.Nama?.charAt(0).toUpperCase()}

                          </div>

                          <div>

                            <p className="text-[13px] font-black text-[#1d2433] text-left">
                              {teacher.Nama}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* NIP */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {teacher.NIP}
                      </td>

                      {/* TANGGAL LAHIR */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {teacher.Tanggal_lahir}
                      </td>

                      {/* GURU PENGAMPU */}
                      <td className="py-4 px-4">

                        <span className="
                          bg-[#f7f0c6]
                          text-[#756d24]
                          text-[12px]
                          font-black
                          px-3
                          py-1
                          rounded-lg
                        ">

                          {teacher.Guru_Pengampu}

                        </span>

                      </td>

                      {/* ALAMAT */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {teacher.Alamat}
                      </td>

                      {/* NOMOR HP */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {teacher.Nomor_Telepon}
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-4">

                        <div className="flex justify-center gap-2">

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/data-guru/edit/${teacher.NIP}`
                              )
                            }
                            className="
                              w-9
                              h-9
                              rounded-xl
                              border
                              border-[#f7c548]
                              text-[#c99b1d]
                              hover:bg-[#fff8df]
                              flex
                              items-center
                              justify-center
                              transition-colors
                            "
                          >

                            <Edit3 size={15} />

                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() =>
                              handleDelete(teacher.NIP)
                            }
                            className="
                              w-9
                              h-9
                              rounded-xl
                              border
                              border-[#ffb3b3]
                              text-[#cf3450]
                              hover:bg-[#fff1f1]
                              flex
                              items-center
                              justify-center
                              transition-colors
                            "
                          >

                            <Trash2 size={15} />

                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="py-16 text-center"
                    >

                      <p className="text-[13px] text-gray-400 font-semibold">

                        Data tidak ditemukan

                      </p>

                      <p className="text-[11px] text-gray-300 mt-1">

                        Coba gunakan kata kunci lain

                      </p>

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