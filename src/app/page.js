"use client";
import { useEffect, useState, useRef } from "react";
import "./style.css";
import axios from "axios";


export default function Home() {

  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingText, setRecordingText] = useState("Grabar");
  const [audioSrc, setAudioSrc] = useState(null);
  const audioRef = useRef();
  const [count, setCount] = useState(0);



 

  const playAudio = () => {
    if(!audioSrc) {
      console.log("useEffect");
      (async () => {
      const response = await axios.post("/api/googletts", {
        text: "Hola, bienvenido a SpeechBookSumm, tu asistente de resúmenes literarios. Para grabar tu petición haz click en cualquier parte de la pantalla",
      });
      const audioSrc = `data:audio/mp3;base64,${response.data.audio}`;
      //console.log(response.data.audio)
      setAudioSrc(audioSrc);
      
      
      })()
    }
    console.log(count);
    if (audioRef.current && count === 0) {
      audioRef.current.play();
      
    }
  };
  


  
 

  useEffect(() => {	
    if (transcription) {
      (async () => {
        const response = await fetch("/api/gemini", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: transcription }),
        })
        const data = await response.json();
        console.log(data);
        
        const cleanText = data.message.replace(/[*\´]/g, "");



        const response2 = await axios.post("/api/googletts", {
          text: cleanText,
        });
        const audioSrc = `data:audio/mp3;base64,${response2.data.audio}`;
        //console.log(response2.data.audio)
        setAudioSrc(audioSrc);
      })();
    }
  }, [transcription]);

  // const startRecording = () => {
  //   navigator.mediaDevices.getUserMedia({ audio: true })
  //     .then(stream => {
  //       const newMediaRecorder = new MediaRecorder(stream);
  //       setMediaRecorder(newMediaRecorder);
  //       newMediaRecorder.start();

  //       let chunks = [];
  //       newMediaRecorder.ondataavailable = e => {
  //         chunks.push(e.data);
  //       };

  //       newMediaRecorder.onstop = () => {
  //         const blob = new Blob(chunks, { 'type': 'audio/ogg; codecs=opus' });
  //         const formData = new FormData();
  //         formData.append('audio', blob);
  //         // fetch('/api/upload', {
  //         //   method: 'POST',
  //         //   headers: {
  //         //     'Content-Type': 'multipart/form-data',
  //         //   },
  //         //   body: formData
  //         // })
  //         axios.post('/api/upload', formData, {
  //           headers: {
  //             'Content-Type': 'multipart/form-data',
  //           },
  //         })
  //           .then(response => {
  //             console.log(response.data);
  //             if (response.data.transcription) {
  //               setTranscription(response.data.transcription);
  //             }
  //           })
  //           .catch(error => {
  //             console.error(error);
  //           });
  //       };
  //     })
  //     .catch(err => {
  //       console.log('Ocurrió un error: ' + err);
  //     });
  // };

  // const stopRecording = () => {
  //   if (mediaRecorder) {
  //     mediaRecorder.stop();
  //     console.log('Grabación detenida');
  //     setMediaRecorder(null);
  //   }
  // };

  const handleRecording = () => {
    if (!recording) {
      setRecording(true);
      setRecordingText("Grabando...");
      console.log("Grabando...");

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
          axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
            .then(response => {
              console.log(response.data);
              if (response.data.transcription) {
                setTranscription(response.data.transcription);
              }
            })
            .catch(error => {
              console.error(error);
            });
        };
      })
      .catch(err => {
        console.log('Ocurrió un error: ' + err);
      });
    } else {
      setRecording(false);
      setRecordingText("Grabar");
    
      if (mediaRecorder) {
        mediaRecorder.stop();
        console.log("Grabación detenida.");
        setMediaRecorder(null);
      }
    }
  }

  return (
    <>
      <head>
        <title>SpeechBookSumm</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <div className="flex items-center justify-center h-screen w-screen" onClick={playAudio} >
          <div className="bg-gray-100 px-32 py-24 rounded-lg text-center cursor-pointer hover:scale-[1.025] transition duration-300" onClick={handleRecording}>
            <h1 className="text-5xl text-semibold mb-8"><strong>Bienvenido a <i>SpeechBookSumm</i></strong></h1>
            <h2 className="text-2xl">Haz click en cualquier parte para grabar</h2>
            <div className={`circulo variacion ${recording ? 'recording' : ''}`}><strong>{recordingText}</strong>
              <div className="wave"></div>
            </div>
            {/* <div/onClick={startRecording} className="mt-8 bg-blue-500 text-white py-2 px-4 rounded-lg cursor-pointer">Iniciar grabación</div>
            <div onClick={stopRecording} className="mt-8 bg-red-500 text-white py-2 px-4 rounded-lg cursor-pointer">Detener grabación</div> */}
            {audioSrc && <audio autoPlay src={audioSrc}  />}      
          </div>
        </div>
      </body>
    </>
  );
}
