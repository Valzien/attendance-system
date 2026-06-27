import face_recognition
import base64
import numpy as np
from io import BytesIO
from PIL import Image


def verify_face(base64_image, known_image_path):
    try:
        # hapus prefix base64
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]

        # decode image dari frontend
        image_data = base64.b64decode(base64_image)
        image = Image.open(BytesIO(image_data))
        image_np = np.array(image)

        # encoding wajah dari selfie
        unknown_encodings = face_recognition.face_encodings(image_np)

        if len(unknown_encodings) == 0:
            return False

        unknown_face = unknown_encodings[0]

        # encoding wajah dari dataset siswa
        known_image = face_recognition.load_image_file(
            known_image_path
        )
        known_encodings = face_recognition.face_encodings(
            known_image
        )

        if len(known_encodings) == 0:
            return False

        known_face = known_encodings[0]

        result = face_recognition.compare_faces(
            [known_face],
            unknown_face,
            tolerance=0.5
        )

        return result[0]

    except Exception as e:
        print("Face verify error:", str(e))
        return False