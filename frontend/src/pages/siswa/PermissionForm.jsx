import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import { Camera } from "lucide-react";

export default function PermissionForm() {

  const navigate = useNavigate();

  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    nis: "",
    class: "",
    reason: "",
  });

  // =====================================================
  // AUTO FILL DATA SISWA
  // =====================================================

  useEffect(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    console.log("USER LOGIN:", user);

    if (user) {

      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        nis: user.nis || "",
        class:
          user.kelas ||
          user.class ||
          "",
      }));

    }

  }, []);

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const today = new Date()
        .toISOString()
        .split("T")[0];

      const formPayload = new FormData();

      formPayload.append(
        "nis",
        formData.nis
      );

      formPayload.append(
        "nama_siswa",
        formData.name
      );

      formPayload.append(
        "kelas",
        formData.class
      );

      formPayload.append(
        "tanggal",
        today
      );

      formPayload.append(
        "alasan",
        formData.reason
      );

      if (selectedFile) {

        formPayload.append(
          "lampiran",
          selectedFile
        );

      }

      const res = await fetch(
        "http://127.0.0.1:8000/izin/submit",
        {
          method: "POST",
          body: formPayload,
        }
      );

      const result = await res.json();

      if (!result.success) {

        alert(
          result.message ||
          "Gagal mengirim izin"
        );

        return;

      }

      alert(
        "Form izin berhasil dikirim"
      );

      navigate("/home");

    } catch (error) {

      console.error(error);

      alert("Server error");

    }

  };

  // =====================================================
  // RETURN
  // =====================================================

  return (

    <Layout>

      <div className="w-full max-w-6xl mx-auto mt-8 px-4">

        <div className="bg-white rounded-[2.5rem] shadow-[0_4px_25px_rgb(0,0,0,0.06)] p-12">

          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-12"
          >

            {/* LEFT COLUMN */}

            <div className="flex-1 flex flex-col gap-8">

              {/* NAMA */}

              <div>

                <label className="block text-[#1b263b] font-extrabold text-base mb-3">
                  Nama
                </label>

                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="w-full px-5 py-4 rounded-xl border-[1.5px] border-gray-300 bg-gray-100 outline-none text-base text-gray-800 font-bold"
                />

              </div>

              {/* NIS */}

              <div>

                <label className="block text-[#1b263b] font-extrabold text-base mb-3">
                  NIS
                </label>

                <input
                  type="text"
                  value={formData.nis}
                  readOnly
                  className="w-full px-5 py-4 rounded-xl border-[1.5px] border-gray-300 bg-gray-100 outline-none text-base text-gray-800 font-bold"
                />

              </div>

              {/* KELAS */}

              <div>

                <label className="block text-[#1b263b] font-extrabold text-base mb-3">
                  Kelas
                </label>

                <input
                  type="text"
                  value={formData.class}
                  readOnly
                  className="w-full px-5 py-4 rounded-xl border-[1.5px] border-gray-300 bg-gray-100 outline-none text-base text-gray-800 font-bold"
                />

              </div>

            </div>

            {/* RIGHT COLUMN */}

            <div className="flex-1 flex flex-col gap-8">

              {/* ALASAN */}

              <div>

                <label className="block text-[#1b263b] font-extrabold text-base mb-3">
                  Alasan Izin
                </label>

                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reason: e.target.value,
                    })
                  }
                  className="w-full px-5 py-4 rounded-xl border-[1.5px] border-gray-300 outline-none transition-all focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 resize-none h-[120px] text-base text-gray-800 font-bold placeholder:text-gray-400 placeholder:font-medium"
                  placeholder="Tuliskan alasan izin"
                  required
                ></textarea>

              </div>

              {/* FOTO BUKTI */}

              <div className="flex-1 flex flex-col">

                <label className="block text-[#1b263b] font-extrabold text-base mb-3">
                  Foto Bukti
                </label>

                <div className="flex-1 w-full bg-[#fffcf5] border-[3px] border-dashed border-[#fbbc3e] rounded-xl flex flex-col items-center justify-center text-gray-500 hover:bg-[#fff9e6] transition-colors cursor-pointer relative min-h-[160px]">

                  <input
                    type="file"
                    onChange={(e) => {

                      const file =
                        e.target.files[0];

                      setSelectedFile(
                        file || null
                      );

                      setFileName(
                        file?.name || ""
                      );

                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                  />

                  <Camera
                    size={36}
                    className="text-[#8c92a6] mb-3"
                  />

                  <p className="text-[13px] font-medium text-[#8c92a6] px-8 text-center leading-relaxed">

                    {fileName ? (

                      <span className="text-green-600 font-bold">
                        {fileName}
                      </span>

                    ) : (

                      "Upload foto bukti (surat dokter / izin orang tua)"

                    )}

                  </p>

                </div>

              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="w-full bg-[#fbbc3e] hover:bg-[#e5a932] text-white font-extrabold py-5 px-4 rounded-xl transition-all shadow-md active:scale-95 text-lg mt-2"
              >

                Kirim

              </button>

            </div>

          </form>

        </div>

      </div>

    </Layout>

  );

}