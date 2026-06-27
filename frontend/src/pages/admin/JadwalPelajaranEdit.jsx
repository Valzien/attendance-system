import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from "./Layout";

export default function JadwalPelajaranEdit() {

  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);

  // =========================
  // FORMAT JAM
  // =========================
  const formatJam = (value) => {

    if (!value) return '';

    // jika angka detik
    if (!isNaN(value)) {

      const jam = Math.floor(value / 3600)
        .toString()
        .padStart(2, '0');

      const menit = Math.floor((value % 3600) / 60)
        .toString()
        .padStart(2, '0');

      return `${jam}:${menit}`;
    }

    // jika sudah format HH:MM:SS
    return String(value)
      .split(':')
      .slice(0, 2)
      .join(':');
  };

  // =========================
  // DATA EDIT
  // =========================
  const [formData, setFormData] = useState({
    mapel: '',
    jam: '',
    hari: '',
    guru: '',
    kelas: ''
  });

  // =========================
  // GET DETAIL JADWAL
  // =========================
  const fetchSchedule = async () => {

    try {

      const response = await fetch(
        `http://localhost:8000/schedule/${id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

      // langsung isi form
      setFormData({
        mapel: data.mapel || '',
        jam: formatJam(data.jam),
        hari: data.hari || '',
        guru: data.guru || '',
        kelas: data.kelas || ''
      });

    } catch (error) {

      console.error(error);

      alert('Data jadwal tidak ditemukan');

      navigate('/admin/jadwal');
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSchedule();
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
        `http://localhost:8000/schedule/${id}`,
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

      alert('Jadwal berhasil diperbarui');

      navigate('/admin/jadwal');

    } catch (error) {

      console.error(error);

      alert('Gagal update jadwal');

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

            {/* MAPEL */}
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
                  Mapel
                </span>
              </div>

              <input
                type="text"
                name="mapel"
                value={formData.mapel}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  border-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* JAM */}
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
                  Jam
                </span>
              </div>

              <input
                type="text"
                name="jam"
                value={formData.jam}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  border-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* HARI */}
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
                  Hari
                </span>
              </div>

              <input
                type="text"
                name="hari"
                value={formData.hari}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  border-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* GURU */}
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
                  Guru
                </span>
              </div>

              <input
                type="text"
                name="guru"
                value={formData.guru}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  border-none
                  font-bold
                  text-black
                  text-sm
                "
              />

            </div>

            {/* KELAS */}
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
                  Kelas
                </span>
              </div>

              <input
                type="text"
                name="kelas"
                value={formData.kelas}
                onChange={handleChange}
                className="
                  flex-1
                  bg-transparent
                  py-3
                  px-4
                  outline-none
                  border-none
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