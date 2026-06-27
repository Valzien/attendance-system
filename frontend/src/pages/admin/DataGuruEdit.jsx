import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from "./Layout";

export default function DataGuruEdit() {

  const navigate = useNavigate();
  const { nip } = useParams();

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    Nama: '',
    Tanggal_lahir: '',
    Alamat: '',
    Guru_Pengampu: '',
    Nomor_Telepon: ''
  });

  // =========================
  // GET DETAIL GURU
  // =========================
  const fetchTeacher = async () => {

    try {

      const response = await fetch(
        `http://localhost:8000/teachers/${nip}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      setFormData({
        Nama: data.Nama || '',
        Tanggal_lahir: data.Tanggal_lahir || '',
        Alamat: data.Alamat || '',
        Guru_Pengampu: data.Guru_Pengampu || '',
        Nomor_Telepon: data.Nomor_Telepon || ''
      });

    } catch (error) {

      console.error(error);

      alert('Data guru tidak ditemukan');

      navigate('/admin/data-guru');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTeacher();
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
        `http://localhost:8000/teachers/${nip}`,
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

      alert('Data guru berhasil diperbarui');

      navigate('/admin/data-guru');

    } catch (error) {

      console.error(error);

      alert('Gagal update data guru');

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

            {/* NAMA */}
            <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

              <div className="w-32 bg-[#f1edc7] py-3 px-4 flex items-center">

                <span className="font-extrabold text-[#a89d46] text-sm">
                  Nama
                </span>

              </div>

              <input
                type="text"
                name="Nama"
                value={formData.Nama}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* TANGGAL LAHIR */}
            <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

              <div className="w-32 bg-[#f1edc7] py-3 px-4 flex items-center">

                <span className="font-extrabold text-[#a89d46] text-sm">
                  Tgl Lahir
                </span>

              </div>

              <input
                type="date"
                name="Tanggal_lahir"
                value={formData.Tanggal_lahir}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* ALAMAT */}
            <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

              <div className="w-32 bg-[#f1edc7] py-3 px-4 flex items-center">

                <span className="font-extrabold text-[#a89d46] text-sm">
                  Alamat
                </span>

              </div>

              <input
                type="text"
                name="Alamat"
                value={formData.Alamat}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* GURU PENGAMPU */}
            <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

              <div className="w-32 bg-[#f1edc7] py-3 px-4 flex items-center">

                <span className="font-extrabold text-[#a89d46] text-sm">
                  Pengampu
                </span>

              </div>

              <input
                type="text"
                name="Guru_Pengampu"
                value={formData.Guru_Pengampu}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* NOMOR TELEPON */}
            <div className="flex bg-[#fdfaf2] rounded-xl overflow-hidden">

              <div className="w-32 bg-[#f1edc7] py-3 px-4 flex items-center">

                <span className="font-extrabold text-[#a89d46] text-sm">
                  No HP
                </span>

              </div>

              <input
                type="text"
                name="Nomor_Telepon"
                value={formData.Nomor_Telepon}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

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