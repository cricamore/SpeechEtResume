import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_API_KEY);

// configuraciones del modelo
const generationConfig = {
    maxOutputTokens: 200,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
};

// creacion del modelo, aqui van las configuraciones
const model = genAI.getGenerativeModel({ model: "gemini-pro" });


// // chat para el modelo, mantiene contexto
// const chat = model.startChat({
//     history: [
//         {
//             role: "user",
//             parts: "Hola como estas?",
//         },
//         {
//             role: "model",
//             parts: "Bien, gracias. ¿Y tú?",
//         },
//     ],
//     generationConfig: {
//         maxOutputTokens: 100,
//     },
// });


export async function POST(request) {

    const body = await request.json();
    const userMessage = body.message;
    
    // const prompt = `Eres un entrenador profesional y tu trabajo es entregar rutinas de 
    // entrenamiento a las personas con diferentes finalidades, a continuación vas a recibir 
    // una petición de un cliente el cual solicita una rutina de entrenamiento y 
    // deberás responder acorde a sus necesidades, el mensaje estará envuelto en 
    // llaves, si no está relacionado con rutinas de entrenamiento, deberás responder 
    // que solo tienes permitido dar rutinas y no contestar más. La petición del cliente es:
    // ` + '{' + userMessage + '}';   
    // prompt de prueba
    const prompt = userMessage;

    const result = await model.generateContent(prompt); // generacion de texto de una vez
    //const result = await chat.sendMessage(userMessage);

    // respuesta de gemini
    const response = result.response;
    const text = response.text();

    // console.log(text)

    return NextResponse.json({ message: text })
}