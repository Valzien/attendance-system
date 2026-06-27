import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./Layout";

import {
  Search,
  Upload,
  Edit3,
  Trash2,
  Download,
} from "lucide-react";

// =========================
// IMPORT EXCEL API
// =========================
const importStudents = async (file) => {

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    "http://localhost:8000/students/import",
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {

    const err = await response.json();

    console.log(err);

    throw new Error(
      err.detail || "Gagal import"
    );
  }

};

export default function DataSiswa() {

  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // =========================
  // FETCH DATA SISWA
  // =========================
  const fetchStudents = async () => {

    try {

      const response = await fetch(
        "http://localhost:8000/students"
      );

      if (!response.ok) {
        throw new Error("Gagal mengambil data");
      }

      const data = await response.json();

      setStudents(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error("Error:", error);

      setStudents([]);

    }

    setLoading(false);

  };

  // =========================
  // DELETE SISWA
  // =========================
  const handleDelete = async (nis) => {

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus data siswa?"
    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(
        `http://localhost:8000/students/${nis}`,
        {
          method: "DELETE"
        }
      );

      if (!response.ok) {
        throw new Error("Gagal hapus");
      }

      alert("Data berhasil dihapus");

      fetchStudents();

    } catch (error) {

      console.error(error);

      alert("Gagal menghapus data");

    }

  };

  // =========================
  // LOAD AWAL
  // =========================
  useEffect(() => {
    fetchStudents();
  }, []);

  // =========================
  // FILTER SEARCH
  // =========================
  const filteredStudents = students.filter((s) => {

    const searchLow = searchTerm.toLowerCase();

    const nama = s.nama_siswa
      ? s.nama_siswa.toLowerCase()
      : "";

    const nis = s.nis
      ? s.nis.toString()
      : "";

    return (
      nama.includes(searchLow) ||
      nis.includes(searchLow)
    );

  });

  // =========================
  // PAGINATION
  // =========================
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

  // =========================
  // HANDLE IMPORT
  // =========================
  const handleImport = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    try {

      setUploading(true);

      await importStudents(file);

      alert("Import berhasil");

      fetchStudents();

    } catch (error) {

      console.error(error);

      alert("error.message");

    } finally {

      setUploading(false);

    }

  };

  return (

    <Layout>

      <div className="space-y-5">

        {/* HEADER */}
        <div>

          <h1 className="text-2xl font-black text-[#1d2433]">

            Data Siswa

          </h1>

          <p className="text-sm text-gray-400 font-medium mt-1">

            Kelola seluruh data siswa sekolah

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
              placeholder="Cari nama atau NIS..."
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
              href="/template_siswa.xlsx"
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

              {uploading
                ? "Import..."
                : "Import Excel"}

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
                  NIS
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  NISN
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  Kelas
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  Wali Kelas
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  Tanggal Lahir
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  Alamat
                </th>

                <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                  No. WA
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
                      colSpan="8"
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

                ) : filteredStudents.length > 0 ? (

                  paginatedStudents.map((student, index) => (

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

                            {student.nama_siswa?.charAt(0).toUpperCase()}

                          </div>

                          <div>

                            <p className="text-[13px] font-black text-[#1d2433] text-left">
                              {student.nama_siswa}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* NIS */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.nis}
                      </td>

                      {/* NISN */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.nisn}
                      </td>

                      {/* KELAS */}
                      <td className="py-4 px-4">

                        <span className="
                          bg-[#cbeeff]
                          text-[#2f6fa1]
                          text-[12px]
                          font-black
                          px-3
                          py-1
                          rounded-lg
                        ">

                          {student.nama_kelas}

                        </span>

                      </td>

                      {/* WALI */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.wali_kelas}
                      </td>

                      {/* TANGGAL LAHIR */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.tanggal_lahir}
                      </td>

                      {/* ALAMAT */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.alamat}
                      </td>

                      {/* WA */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {student.no_wa_ortu}
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-4">

                        <div className="flex justify-center gap-2">

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/data-siswa/edit/${student.nis}`
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
                              handleDelete(student.nis)
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
                      colSpan="9"
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