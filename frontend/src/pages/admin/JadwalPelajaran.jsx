import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "./Layout";

import {
  ChevronDown,
  Edit3,
  Trash2,
  Upload,
  Download,
} from "lucide-react";

export default function JadwalPelajaran() {

  const navigate = useNavigate();

  const [selectedClass, setSelectedClass] = useState("");
  const [kelasList, setKelasList] = useState([]);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // =========================
  // FORMAT JAM
  // =========================
  const formatJam = (value) => {

    if (!value) return "-";

    if (typeof value === "number") {

      const jam = Math.floor(value / 3600)
        .toString()
        .padStart(2, "0");

      const menit = Math.floor((value % 3600) / 60)
        .toString()
        .padStart(2, "0");

      return `${jam}:${menit}`;
    }

    return String(value)
      .split(":")
      .slice(0, 2)
      .join(":");
  };

  // =========================
  // GET KELAS
  // =========================
  const fetchKelas = async () => {

    try {

      const res = await fetch(
        "http://localhost:8000/classes"
      );

      const data = await res.json();

      setKelasList(
        Array.isArray(data) ? data : []
      );

      if (data.length > 0) {
        setSelectedClass(data[0].nama_kelas);
      }

    } catch (error) {

      console.error(error);

      setKelasList([]);
    }
  };

  // =========================
  // GET JADWAL
  // =========================
  const fetchSchedule = async (kelas) => {

    if (!kelas) return;

    setLoading(true);

    try {

      const res = await fetch(
        `http://localhost:8000/schedules/class/${kelas}`
      );

      const data = await res.json();

      setScheduleData(
        Array.isArray(data) ? data : []
      );

    } catch (error) {

      console.error(error);

      setScheduleData([]);
    }

    setLoading(false);
  };

  // =========================
  // DELETE JADWAL
  // =========================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Yakin ingin menghapus jadwal ini?"
    );

    if (!confirmDelete) return;

    try {

      const response = await fetch(
        `http://localhost:8000/schedule/${id}`,
        {
          method: "DELETE"
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      alert("Jadwal berhasil dihapus");

      fetchSchedule(selectedClass);

    } catch (error) {

      console.error(error);

      alert("Gagal menghapus jadwal");
    }
  };

  // =========================
  // IMPORT EXCEL
  // =========================
  const importSchedules = async (file) => {

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      "http://localhost:8000/schedules/import",
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error("Gagal import");
    }

    return await response.json();
  };

  // =========================
  // HANDLE IMPORT
  // =========================
  const handleImport = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    try {

      setUploading(true);

      await importSchedules(file);

      alert("Import jadwal berhasil");

      fetchSchedule(selectedClass);

    } catch (error) {

      console.error(error);

      alert("Import gagal");

    } finally {

      setUploading(false);

    }
  };

  // =========================
  // LOAD AWAL
  // =========================
  useEffect(() => {
    fetchKelas();
  }, []);

  // =========================
  // LOAD JADWAL
  // =========================
  useEffect(() => {

    if (selectedClass) {
      fetchSchedule(selectedClass);
    }

  }, [selectedClass]);

  return (

    <Layout>

      <div className="space-y-5">

        {/* HEADER */}
        <div>

          <h1 className="text-2xl font-black text-[#1d2433]">

            Jadwal Pelajaran

          </h1>

          <p className="text-sm text-gray-400 font-medium mt-1">

            Kelola jadwal pelajaran setiap kelas

          </p>

        </div>

        {/* TOP BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* LEFT */}
          <div className="flex flex-wrap gap-3">

            {/* TEMPLATE */}
            <a
              href="/template_jadwal.xlsx"
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

          {/* DROPDOWN */}
          <div className="relative">

            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value)
              }
              className="
                appearance-none
                bg-white
                border
                border-gray-200
                text-[13px]
                font-bold
                text-[#1d2433]
                py-3
                pl-4
                pr-10
                rounded-xl
                outline-none
                cursor-pointer
                shadow-sm
                hover:border-gray-300
                transition-colors
                min-w-[180px]
              "
            >

              {kelasList.map((kelas) => (

                <option
                  key={kelas.id}
                  value={kelas.nama_kelas}
                >
                  {kelas.nama_kelas}
                </option>

              ))}

            </select>

            <ChevronDown
              size={16}
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full whitespace-nowrap">

              <thead>

                <tr className="bg-[#f8f9fa] border-b border-gray-100">

                  <th className="py-4 px-5 text-left text-[11px] font-black text-gray-400 uppercase">
                    ID
                  </th>

                  <th className="py-4 px-5 text-left text-[11px] font-black text-gray-400 uppercase">
                    Mata Pelajaran
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Jam
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Hari
                  </th>

                  <th className="py-4 px-4 text-left text-[11px] font-black text-gray-400 uppercase">
                    Guru
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
                      colSpan="6"
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

                ) : scheduleData.length > 0 ? (

                  scheduleData.map((item) => (

                    <tr
                      key={item.id_mapel}
                      className="
                        border-b
                        border-gray-50
                        hover:bg-gray-50
                        transition-colors
                      "
                    >

                      {/* ID */}
                      <td className="py-4 px-5 text-[13px] font-bold text-[#1d2433]">
                        {item.id_mapel}
                      </td>

                      {/* MAPEL */}
                      <td className="py-4 px-5 text-[13px] font-black text-[#1d2433]">
                        {item.mapel}
                      </td>

                      {/* JAM */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {formatJam(item.jam)}
                      </td>

                      {/* HARI */}
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

                          {item.hari}

                        </span>

                      </td>

                      {/* GURU */}
                      <td className="py-4 px-4 text-[13px] font-bold text-[#1d2433]">
                        {item.guru}
                      </td>

                      {/* AKSI */}
                      <td className="py-4 px-4">

                        <div className="flex justify-center gap-2">

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/jadwal/edit/${item.id_mapel}`
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
                              handleDelete(item.id_mapel)
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
                      colSpan="6"
                      className="py-16 text-center"
                    >

                      <p className="text-[13px] text-gray-400 font-semibold">

                        Tidak ada jadwal

                      </p>

                      <p className="text-[11px] text-gray-300 mt-1">

                        Belum ada data jadwal pelajaran

                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </Layout>

  );

}