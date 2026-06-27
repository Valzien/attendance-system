import { useState, useEffect } from 'react';
import Layout from "./Layout";
import {
  ChevronDown,
  Download,
  X,
  FileSpreadsheet
} from 'lucide-react';

import {
  getKelas,
  getStudentAttendanceData
} from '../../api';

const BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

const monthMap = {
  Januari: 1,
  Februari: 2,
  Maret: 3,
  April: 4,
  Mei: 5,
  Juni: 6,
  Juli: 7,
  Agustus: 8,
  September: 9,
  Oktober: 10,
  November: 11,
  Desember: 12,
};

function SelectDropdown({
  value,
  onChange,
  options,
  placeholder
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-gray-200 text-[13px] font-bold text-[#1d2433] py-2.5 pl-4 pr-9 rounded-xl outline-none cursor-pointer shadow-sm hover:border-gray-300 transition-colors min-w-[140px]"
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
          >
            {opt.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

export default function RekapAbsensi() {

  const [showModal, setShowModal] = useState(false);

  const [selectedMonth, setSelectedMonth] =
    useState('Januari');

  const [classList, setClassList] = useState([]);

  const [selectedClass, setSelectedClass] =
    useState('');

  const [exportClass, setExportClass] =
    useState('');

  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(false);

  // =====================================================
  // LOAD KELAS
  // =====================================================

  useEffect(() => {

    async function loadKelas() {

      try {

        const data = await getKelas();

        if (data && data.length > 0) {

          setClassList(data);

          setSelectedClass(
            data[0].nama_kelas
          );

          setExportClass(
            data[0].nama_kelas
          );

        }

      } catch (error) {

        console.error(
          "Gagal mengambil data kelas:",
          error
        );

      }

    }

    loadKelas();

  }, []);

  // =====================================================
  // LOAD ABSENSI
  // =====================================================

  useEffect(() => {

    async function loadAttendance() {

      if (!selectedClass) return;

      setLoading(true);

      try {

        const rawData =
          await getStudentAttendanceData(
            selectedClass,
            monthMap[selectedMonth]
          );

        console.log(rawData);

        // =====================================================
        // GROUPING DATA SISWA
        // =====================================================

        const grouped = {};

        rawData.forEach((item) => {

          const nis = item.nis;

          if (!grouped[nis]) {

            grouped[nis] = {
              nis: item.nis,
              nama_siswa: item.nama_siswa,
              hadir: 0,
              izin: 0,
              alfa: 0,
            };

          }

          if (
            item.status_kehadiran === "hadir"
          ) {
            grouped[nis].hadir += 1;
          }

          else if (
            item.status_kehadiran === "izin"
          ) {
            grouped[nis].izin += 1;
          }

          else if (
            item.status_kehadiran === "alfa"
          ) {
            grouped[nis].alfa += 1;
          }

          else if (
            item.status_kehadiran === "terlambat"
          ) {
            grouped[nis].hadir += 1;
          }

        });

        setStudents(
          Object.values(grouped)
        );

      } catch (error) {

        console.error(
          "Gagal mengambil data absensi:",
          error
        );

      }

      setLoading(false);

    }

    loadAttendance();

  }, [selectedClass, selectedMonth]);

  // =====================================================
  // OPTIONS
  // =====================================================

  const bulanOptions = BULAN.map((b) => ({
    value: b,
    label: b
  }));

  const kelasOptions = classList.map((k) => ({
    value: k.nama_kelas,
    label: k.nama_kelas
  }));

  // =====================================================
  // SUMMARY
  // =====================================================

  const totalHadir = students.reduce(
    (s, st) => s + st.hadir,
    0
  );

  const totalIzin = students.reduce(
    (s, st) => s + st.izin,
    0
  );

  const totalAlfa = students.reduce(
    (s, st) => s + st.alfa,
    0
  );

  return (

    <Layout>

      <div className="space-y-5">

        {/* FILTER */}
        <div className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <SelectDropdown
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={bulanOptions}
            />

            <SelectDropdown
              value={selectedClass}
              onChange={setSelectedClass}
              options={kelasOptions}
              placeholder={
                classList.length === 0
                  ? 'Memuat...'
                  : undefined
              }
            />

          </div>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="flex items-center gap-2 bg-[#1d2433] hover:bg-[#2d3748] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >

            <Download size={15} />

            Ekspor

          </button>

        </div>

        {/* SUMMARY */}
        {students.length > 0 && (

          <div className="flex flex-wrap gap-2">

            {[
              {
                label: 'Hadir',
                value: totalHadir,
                bg: 'bg-[#c7f5d8]',
                text: 'text-[#2b8a57]'
              },

              {
                label: 'Izin',
                value: totalIzin,
                bg: 'bg-[#cbeeff]',
                text: 'text-[#2f6fa1]'
              },

              {
                label: 'Alpha',
                value: totalAlfa,
                bg: 'bg-[#ffc8d0]',
                text: 'text-[#cf3450]'
              },

            ].map((chip) => (

              <div
                key={chip.label}
                className={`${chip.bg} ${chip.text} text-[12px] font-black px-3 py-1 rounded-lg`}
              >
                {chip.label}: {chip.value}
              </div>

            ))}

          </div>

        )}

        {/* TABLE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          <table className="w-full text-center">

            <thead>

              <tr className="border-b border-gray-100 bg-[#f8f9fa]">

                <th className="py-3.5 px-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  Nama Siswa
                </th>

                <th className="py-3.5 px-4 w-16 text-[11px] font-black uppercase tracking-wider text-[#2b8a57]">
                  H
                </th>

                <th className="py-3.5 px-4 w-16 text-[11px] font-black uppercase tracking-wider text-[#2f6fa1]">
                  I
                </th>

                <th className="py-3.5 px-4 w-16 text-[11px] font-black uppercase tracking-wider text-[#cf3450]">
                  A
                </th>

              </tr>

            </thead>

            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="4"
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

              ) : students.length > 0 ? (

                students.map((student, index) => (

                  <tr
                    key={index}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >

                    <td className="py-4 px-5 text-left text-[13px] font-bold text-[#1d2433]">

                      <div className="flex items-center gap-3">

                        <div className="w-7 h-7 rounded-lg bg-[#e8eaf0] flex items-center justify-center text-[10px] font-black text-[#1d2433] flex-shrink-0">

                          {student.nama_siswa
                            ?.charAt(0)
                            .toUpperCase()}

                        </div>

                        {student.nama_siswa}

                      </div>

                    </td>

                    <td className="py-4 px-4 text-[13px] font-bold text-[#2b8a57]">
                      {student.hadir || (
                        <span className="text-gray-300">
                          —
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[13px] font-bold text-[#2f6fa1]">
                      {student.izin || (
                        <span className="text-gray-300">
                          —
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 text-[13px] font-bold text-[#cf3450]">
                      {student.alfa || (
                        <span className="text-gray-300">
                          —
                        </span>
                      )}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="py-16 text-center"
                  >

                    <p className="text-[13px] text-gray-400 font-semibold">
                      Tidak ada data absensi
                    </p>

                    <p className="text-[11px] text-gray-300 mt-1">
                      Coba pilih bulan atau kelas yang berbeda
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL EXPORT */}
      {showModal && (

        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">

          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">

            <div className="flex items-start justify-between mb-5">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-2xl bg-[#c7f5d8] flex items-center justify-center">

                  <FileSpreadsheet
                    size={18}
                    className="text-[#2b8a57]"
                  />

                </div>

                <div>

                  <h2 className="text-[15px] font-black text-[#1d2433]">
                    Ekspor Data
                  </h2>

                  <p className="text-[11px] text-gray-400 font-medium">
                    Rekap absensi ke file
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  setShowModal(false)
                }
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
              >

                <X
                  size={16}
                  className="text-gray-400"
                />

              </button>

            </div>

          </div>

        </div>

      )}

    </Layout>

  );

}