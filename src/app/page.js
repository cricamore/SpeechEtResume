"use client";
import Image from "next/image";
import "./style.css"
import Microphone from "@heroicons/react/24/outline/MicrophoneIcon"

export default function Home() {
  const handleClick = () => {
    console.log("Click!");
  };

  return (
    <>
    <head>
      <title>Home</title>
      <meta name="description" content="Home page" />
      <link rel="icon" href="/favicon.ico" />
      <Image src="/logo.svg" alt="Vercel Logo" width={72} height={16} />
    </head>
    <body>
      <div onClick={handleClick}>
        <h1 id="titulo">¡Le doy la bienvenida a <i id="italicTitulo">SpeechEtResume</i >!</h1>
        <div className="rectangle">
          <h2>Presione <i>'click'</i> para grabar su petición</h2>
          <Microphone id="microphone"/>
        </div>
      </div>
    </body>
    </>
  );
}
