import os
import cv2
import base64
import numpy as np
import pandas as pd

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

BASE_SISWA_DIR = "model/Siswa"

# =====================================================
# REQUEST BODY
# =====================================================

class FaceVerifyRequest(BaseModel):
    nis: str
    image_base64: str

# =====================================================
# VERIFY FACE
# =====================================================

@router.post("/face/verify")
def verify_face(data: FaceVerifyRequest):

    try:

        nis = str(data.nis)

        # =========================================
        # HAPUS PREFIX BASE64
        # =========================================

        image_data = data.image_base64.split(",")[1]

        # =========================================
        # DECODE BASE64
        # =========================================

        image_bytes = base64.b64decode(image_data)

        np_arr = np.frombuffer(
            image_bytes,
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
        # DETECTOR WAJAH
        # =========================================

        face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades +
            "haarcascade_frontalface_default.xml"
        )

        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.2,
            minNeighbors=5,
            minSize=(100, 100)
        )

        if len(faces) == 0:

            return {
                "match": False,
                "message": "Wajah tidak ditemukan"
            }

        # =========================================
        # CEK SEMUA KELAS
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
            # LOOP FACE
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

                    predicted_nis, confidence = recognizer.predict(
                        wajah
                    )

                except:
                    continue

                print("PREDICT:", predicted_nis)
                print("CONF:", confidence)

                # =================================
                # MATCH
                # =================================

                if (
                    str(predicted_nis) == nis
                    and confidence < 60
                ):

                    return {
                        "match": True,
                        "confidence": float(confidence),
                        "message": "Wajah cocok"
                    }

        # =========================================
        # TIDAK MATCH
        # =========================================

        return {
            "match": False,
            "message": "Wajah tidak cocok"
        }

    except Exception as e:

        return {
            "match": False,
            "message": str(e)
        }