"use client";
import { useState } from "react";
import axios from "axios";


export default function Home() {
  const handleClick = () => {
    console.log("Click!");
  };

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const newMediaRecorder = new MediaRecorder(stream);
        setMediaRecorder(newMediaRecorder);
        newMediaRecorder.start();

        let chunks = [];
        newMediaRecorder.ondataavailable = e => {
          chunks.push(e.data);
        };

        newMediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
          const formData = new FormData();
          formData.append('audio', blob);
          // fetch('/api/upload', {
          //   method: 'POST',
          //   headers: {
          //     'Content-Type': 'multipart/form-data',
          //   },
          //   body: formData
          // })
          axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
            .then(response => {
              console.log(response.data);
            })
            .catch(error => {
              console.error(error);
            });
          console.log(formData)
        };
      })
      .catch(err => {
        console.log('Ocurrió un error: ' + err);
      });
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log('Grabación detenida');
      setMediaRecorder(null);
    }
  };

  return (
    <>
      <head>
        <title>Home</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="flex items-center justify-center h-screen w-screen" >
          <div className="bg-gray-100 px-32 py-24 rounded-lg text-center">
            <h1 className="text-5xl text-semibold mb-8">Bienvenido a NOMBREAPP</h1>
            <h2 className="text-2xl">Haz click en cualquier parte para grabar</h2>
            <div onClick={startRecording} className="mt-8 bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer">Iniciar grabación</div>
            <div onClick={stopRecording} className="mt-8 bg-red-500 text-white py-2 px-4 rounded-lg cursor-pointer">Detener grabación</div>
          </div>
        </div>
      </body>
    </>
  );
}
