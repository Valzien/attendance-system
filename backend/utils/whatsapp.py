import requests

TOKEN = "cm7GGGZDYJoxyyzrhuG9"


def kirim_wa(nomor, pesan):
    url = "https://api.fonnte.com/send"

    payload = {
        "target": nomor,
        "message": pesan,
        "countryCode": "62"
    }

    headers = {
        "Authorization": TOKEN
    }

    try:
        response = requests.post(
            url,
            data=payload,
            headers=headers
        )

        return response.json()

    except Exception as e:
        return {
            "error": str(e)
        }