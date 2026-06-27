import cv2
import base64
import numpy as np
import pandas as pd
import os

BASE_SISWA_DIR = "Siswa"

faceCascade = cv2.CascadeClassifier(
    cv2.data.haarcascades +
    "haarcascade_frontalface_default.xml"
)


def verify_face(image_base64):

    try:

        # =========================================
        # DECODE BASE64
        # =========================================

        image_data = base64.b64decode(
            image_base64.split(",")[1]
        )

        np_arr = np.frombuffer(
            image_data,
            np.uint8
        )

        img = cv2.imdecode(
            np_arr,
            cv2.IMREAD_COLOR
        )

        gray = cv2.cvtColor(
            img,
            cv2.COLOR_BGR2GRAY
        )

        # =========================================
        # DETEKSI WAJAH
        # =========================================

        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(100, 100)
        )

        if len(faces) == 0:

            return {
                "success": False,
                "message": "Wajah tidak ditemukan"
            }

        # =========================================
        # LOOP SEMUA KELAS
        # =========================================

        for kelas in os.listdir(BASE_SISWA_DIR):

            folder_kelas = os.path.join(
                BASE_SISWA_DIR,
                kelas
            )

            trainer_path = os.path.join(
                folder_kelas,
                "hasiltraining",
                "Trainer.yml"
            )

            desc_path = os.path.join(
                folder_kelas,
                "DescSiswa.csv"
            )

            if not os.path.isfile(trainer_path):
                continue

            if not os.path.isfile(desc_path):
                continue

            recognizer = cv2.face.LBPHFaceRecognizer_create()

            recognizer.read(trainer_path)

            df = pd.read_csv(desc_path)

            # =====================================
            # CEK WAJAH
            # =====================================

            for (x, y, w, h) in faces:

                wajah = gray[
                    y:y+h,
                    x:x+w
                ]

                wajah = cv2.resize(
                    wajah,
                    (200, 200)
                )

                try:

                    nis_pred, conf = recognizer.predict(
                        wajah
                    )

                except:
                    continue

                # =================================
                # MATCH
                # =================================

                if conf < 50:

                    siswa = df.loc[
                        df["NIS"] == nis_pred
                    ]

                    if len(siswa) > 0:

                        nama = siswa[
                            "Nama"
                        ].values[0]

                        return {

                            "success": True,

                            "match": True,

                            "nis": str(nis_pred),

                            "nama": nama,

                            "kelas": kelas,

                            "confidence": float(conf)

                        }

        return {

            "success": True,

            "match": False,

            "message": "Wajah tidak dikenali"

        }

    except Exception as e:

        return {

            "success": False,

            "message": str(e)

        }