import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Layout from "./Layout";

import Webcam from 'react-webcam';

import { Camera } from 'lucide-react';

import * as faceapi from 'face-api.js';

import {
  absenMasuk,
  absenKeluar
} from '../../api';

export default function Absen() {

  const { type } = useParams();

  const navigate = useNavigate();

  const [status, setStatus] =
    useState('camera');

  const [capturedImage, setCapturedImage] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [alamat, setAlamat] =
    useState('Mengambil lokasi...');

  const webcamRef = useRef(null);

  const canvasRef = useRef(null);

  const isMasuk =
    type === 'masuk';

  // =====================================================
  // LOAD FACE API MODEL
  // =====================================================

  useEffect(() => {

    const loadModels = async () => {

      const MODEL_URL = '/models';

      await faceapi.nets.tinyFaceDetector.loadFromUri(
        MODEL_URL
      );

      console.log('Face API Loaded');

    };

    loadModels();

  }, []);

  // =====================================================
  // FACE DETECTION
  // =====================================================

  useEffect(() => {

    let interval;

    if (status === 'camera') {

      interval = setInterval(async () => {

        if (
          webcamRef.current &&
          webcamRef.current.video &&
          webcamRef.current.video.readyState === 4
        ) {

          const video =
            webcamRef.current.video;

          const detections =
            await faceapi.detectAllFaces(
              video,
              new faceapi.TinyFaceDetectorOptions()
            );

          const canvas =
            canvasRef.current;

          if (!canvas) return;

          const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
          };

          faceapi.matchDimensions(
            canvas,
            displaySize
          );

          const resizedDetections =
            faceapi.resizeResults(
              detections,
              displaySize
            );

          const ctx =
            canvas.getContext('2d');

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          // =====================================
          // CUSTOM FACE BOX
          // =====================================

          resizedDetections.forEach((detection) => {

            const {
              x,
              y,
              width,
              height
            } = detection.box;

            // BOX
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;

            ctx.strokeRect(
              x,
              y,
              width,
              height
            );

          });

        }

      }, 100);

    }

    return () => clearInterval(interval);

  }, [status]);

  // =====================================================
  // USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem('user')
  );

  const nis = user?.nis;

  // =====================================================
  // GET ADDRESS
  // =====================================================

  const getAddress = async (
    lat,
    lon
  ) => {

    try {

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );

      const data = await res.json();

      if (data?.display_name) {

        setAlamat(
          data.display_name
        );

      } else {

        setAlamat(
          'Lokasi tidak ditemukan'
        );

      }

    } catch (err) {

      console.log(err);

      setAlamat(
        'Gagal mengambil lokasi'
      );

    }

  };

  // =====================================================
  // CAPTURE
  // =====================================================

  const capture = () => {

    const imageSrc =
      webcamRef.current.getScreenshot();

    setCapturedImage(imageSrc);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const lat =
          position.coords.latitude;

        const lon =
          position.coords.longitude;

        await getAddress(
          lat,
          lon
        );

      },

      (err) => {

        console.log(err);

        setAlamat(
          'Gagal mengambil lokasi'
        );

      }

    );

    setStatus('preview');

  };

  // =====================================================
  // SAVE
  // =====================================================

  const save = async () => {

    if (!nis) {

      alert(
        "Data user tidak ditemukan. Silakan login ulang."
      );

      return;

    }

    if (!navigator.geolocation) {

      alert(
        "GPS tidak didukung browser"
      );

      return;

    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        try {

          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          const accuracy =
            position.coords.accuracy;

          let result;

          if (isMasuk) {

            result = await absenMasuk(

              nis,

              latitude,

              longitude,

              accuracy,

              capturedImage

            );

          } else {

            result = await absenKeluar(

              nis,

              latitude,

              longitude,

              accuracy,

              capturedImage

            );

          }

          if (result.success) {

            alert(result.message);

            navigate('/home');

          } else {

            alert(result.message);

          }

        } catch (error) {

          console.error(error);

          console.log(error.response);

          const detail =
            error?.response?.data?.detail;

          alert(
            detail || "Terjadi kesalahan saat absensi"
          );

        } finally {

          setLoading(false);

        }

      },

      (error) => {

        console.error(error);

        alert(
          "Gagal mendapatkan lokasi"
        );

        setLoading(false);

      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }

    );

  };

  // =====================================================
  // UI
  // =====================================================

  return (

    <Layout>

      <div className="w-full min-h-screen flex items-center justify-center py-16">

        <div className="w-full max-w-3xl relative px-4">

          {/* CAMERA */}

          {status === 'camera' && (

            <div className="relative w-full h-[60vh] rounded-[2rem] bg-black shadow-lg border-[6px] border-[#f4ecca] overflow-visible">

              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover rounded-[1.5rem]"
                videoConstraints={{
                  facingMode: "user"
                }}
              />

              {/* FACE DETECTION CANVAS */}

              <canvas
                ref={canvasRef}
                className="
                  absolute
                  top-0
                  left-0
                  w-full
                  h-full
                  z-10
                  pointer-events-none
                "
              />

              {/* BUTTON */}

              <div className="absolute -bottom-10 left-0 right-0 flex justify-center z-20">

                <button
                  onClick={capture}
                  className="
                    w-[76px]
                    h-[76px]
                    bg-[#2ed826]
                    rounded-full
                    border-[6px]
                    border-white
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    hover:bg-green-500
                    transition-transform
                    active:scale-95
                  "
                >

                  <Camera
                    className="text-white"
                    size={32}
                  />

                </button>

              </div>

            </div>

          )}

          {/* PREVIEW */}

          {status === 'preview' && (

            <div className="w-full flex flex-col items-center">

              <div className="relative w-full h-[60vh] rounded-[2rem] bg-black shadow-lg border-[6px] border-[#f4ecca]">

                <img
                  src={capturedImage}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-[1.5rem]"
                />

                <div className="absolute bottom-12 left-8 text-white z-10">

                  <div className="flex items-end gap-3 mb-2">

                    <h2 className="text-6xl font-bold leading-none tracking-tighter drop-shadow-md">

                      {new Date()
                        .toTimeString()
                        .slice(0, 5)}

                    </h2>

                  </div>

                  <div className="flex flex-col max-w-[90%] drop-shadow-md">

                    <span className="text-sm font-medium break-words">

                      {alamat}

                    </span>

                  </div>

                </div>

              </div>

              {/* SAVE BUTTON */}

              <div className="flex justify-end w-full mt-14">

                <button
                  onClick={save}
                  disabled={loading}
                  className="
                    px-12
                    py-3
                    bg-[#4ade80]
                    text-white
                    rounded-full
                    font-bold
                    text-sm
                    hover:bg-green-500
                    transition-colors
                    shadow-sm
                    disabled:opacity-50
                  "
                >

                  {loading
                    ? 'Menyimpan...'
                    : 'Simpan'}

                </button>

              </div>

            </div>

          )}

        </div>

      </div>

    </Layout>

  );

}