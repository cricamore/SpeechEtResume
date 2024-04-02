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
    
    const prompt = `Eres un experto en literatura de una biblioteca y tu trabajo 
    es proporcionar guías a las personas que te hagan peticiones, solo tienes
    permitido proporcionar respuestas relacionadas con libros, como resumenes
    o sinopsis o similares que sean relacionadas con libros, a continuación
    recibirás la petición del cliente, debes responder de manera concisa y 
    en un máximo de 300 palabras, en caso de que la petición no esté relacionada
    con libros deberás solicitar al cliente que vuelva a hacer una nueva petición
    indicando que solo tienes permitido responder temas de libros. La petición del cliente es:
    ` + '{' + userMessage + '}';
    // prompt de prueba
    // const prompt = userMessage;

    const result = await model.generateContent(prompt); // generacion de texto de una vez
    //const result = await chat.sendMessage(userMessage);

    // respuesta de gemini
    const response = result.response;
    const text = response.text();

    // console.log(text)

    return NextResponse.json({ message: text })
}