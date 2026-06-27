import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from "./Layout";

export default function DataSiswaEdit() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nis: '',
    nisn: '',
    nama_siswa: '',
    id_kelas: '',
    wali_kelas: '',
    tanggal_lahir: '',
    alamat: '',
    no_wa_siswa: '',
    no_wa_ortu: ''
  });

  // =========================
  // GET DETAIL SISWA
  // =========================
  const fetchStudent = async () => {

    try {

      const response = await fetch(
        `http://localhost:8000/students/${id}`
      );

      const data = await response.json();

      setFormData({
        nis: data.nis || '',
        nisn: data.nisn || '',
        nama_siswa: data.nama_siswa || '',
        id_kelas: data.id_kelas || '',
        wali_kelas: data.wali_kelas || '',
        tanggal_lahir: data.tanggal_lahir || '',
        alamat: data.alamat || '',
        no_wa_siswa: data.no_wa_siswa || '',
        no_wa_ortu: data.no_wa_ortu || ''
      });

    } catch (error) {

      console.error(error);

      alert('Gagal mengambil data siswa');

    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStudent();
  }, []);

  // =========================
  // HANDLE INPUT
  // =========================
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  // =========================
  // SIMPAN
  // =========================
  const handleSave = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        `http://localhost:8000/students/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      alert('Data siswa berhasil diperbarui');

      navigate('/admin/data-siswa');

    } catch (error) {

      console.error(error);

      alert('Gagal update data siswa');

    }

  };

  if (loading) {

    return (
      <Layout>
        <div className="text-center py-20 font-bold">
          Memuat data...
        </div>
      </Layout>
    );
  }

  return (

    <Layout>

      <div className="flex-1 flex flex-col items-center justify-center p-4">

        <div
          className="
            bg-white
            rounded-3xl
            p-8
            w-full
            max-w-lg
            shadow-[0_8px_30px_rgb(0,0,0,0.08)]
            mb-6
          "
        >

          <form
            onSubmit={handleSave}
            className="flex flex-col gap-4"
          >

            {/* NIS */}
            <InputField
              label="NIS"
              name="nis"
              value={formData.nis}
              onChange={handleChange}
            />

            {/* NISN */}
            <InputField
              label="NISN"
              name="nisn"
              value={formData.nisn}
              onChange={handleChange}
            />

            {/* NAMA */}
            <InputField
              label="Nama"
              name="nama_siswa"
              value={formData.nama_siswa}
              onChange={handleChange}
            />

            {/* KELAS */}
            <InputField
              label="Kelas"
              name="id_kelas"
              value={formData.id_kelas}
              onChange={handleChange}
            />

            {/* WALI */}
            <InputField
              label="Wali"
              name="wali_kelas"
              value={formData.wali_kelas}
              onChange={handleChange}
            />

            {/* TGL */}
            <InputField
              label="Tgl Lahir"
              name="tanggal_lahir"
              value={formData.tanggal_lahir}
              onChange={handleChange}
            />

            {/* ALAMAT */}
            <InputField
              label="Alamat"
              name="alamat"
              value={formData.alamat}
              onChange={handleChange}
            />

            {/* WA SISWA */}
            <InputField
              label="WA Siswa"
              name="no_wa_siswa"
              value={formData.no_wa_siswa}
              onChange={handleChange}
            />

            {/* WA ORTU */}
            <InputField
              label="WA Ortu"
              name="no_wa_ortu"
              value={formData.no_wa_ortu}
              onChange={handleChange}
            />

            {/* BUTTON */}
            <div className="flex justify-end pt-4">

              <button
                type="submit"
                className="
                  bg-[#fbbc3e]
                  hover:bg-[#ebac34]
                  text-white
                  font-extrabold
                  py-3
                  px-8
                  rounded-xl
                  shadow-md
                  transition-colors
                "
              >
                Simpan
              </button>

            </div>

          </form>

        </div>

      </div>

    </Layout>
  );
}

// =========================
// COMPONENT INPUT
// =========================
function InputField({
  label,
  name,
  value,
  onChange
}) {

  return (

    <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

      <div
        className="
          w-28
          bg-[#f1edc7]
          py-3
          px-4
          flex
          items-center
        "
      >
        <span className="font-extrabold text-[#a89d46] text-sm">
          {label}
        </span>
      </div>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="
          flex-1
          bg-transparent
          py-3
          px-4
          outline-none
          font-bold
          text-gray-800
          text-sm
        "
      />

    </div>

  );
}