const axios = require('axios');
import { NextResponse } from "next/server";

export async function POST(request) {
    const body = await request.json();
    const text = body.text;
    const api_key = process.env.NEXT_PUBLIC_API_KEY_TTS;
    const url = `https://us-central1-texttospeech.googleapis.com/v1beta1/text:synthesize?key=${api_key}`;
    const data = {
        "audioConfig": {
          "audioEncoding": "LINEAR16",
          "pitch": 0,
          "speakingRate": 1
        },
        "input": {
          "text": text
        },
        "voice": {
          "languageCode": "es-US",
          "name": "es-US-Neural2-B"
        }
      };
    const response = await axios.post(url, data);
    const audio = response.data.audioContent;
    return NextResponse.json({ audio: audio });
}