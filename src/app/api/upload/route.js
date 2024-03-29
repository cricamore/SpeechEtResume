import { NextResponse } from 'next/server';
import fs from 'fs';
import * as common from 'oci-common';
import * as objectStorage from 'oci-objectstorage';
import * as aispeech from 'oci-aispeech';

import { toJSON } from '../../../util/utils';
// import { pipeline } from 'stream';
// import { promisify } from 'util';

const namespaceName = process.env.NEXT_PUBLIC_NAMESPACE_NAME;
const bucketName = process.env.NEXT_PUBLIC_BUCKET_NAME;

export async function POST(request) {

    const data = await request.formData(); // datos del request en version formData
    const audioFile = data.get('audio'); // el archivo de audio

    const arayBuffer = await audioFile.arrayBuffer(); // convertir el archivo a un array buffer
    const buffer = Buffer.from(arayBuffer); // convertir el array buffer a un buffer de datos

    // escribir el archivo (se debe cambiar a subirlo a la nube)
    // fs.open('audio.ogg', 'w', function (err, fd) {
    //     if (err) {
    //         throw 'could not open file: ' + err;
    //     }

    //     fs.write(fd, buffer, function (err) {
    //         if (err) throw 'error writing file: ' + err;
    //         fs.close(fd, function () {
    //             console.log('file written');
    //         })
    //     });
    // });

    // version alternativa de laura, mas corto
    // const writeStream = fs.createWriteStream('audio.ogg');
    // const pipe = promisify(pipeline);

    // await pipe(audioFile.stream(), writeStream)
    //     .catch(err => console.error('Error writing file:', err));

    // Conexion a oci
    const provider = new common.ConfigFileAuthenticationDetailsProvider(
        "./.oci/config"
    );

    // El nombre del archivo es la fecha
    const date = new Date();
    const fileName = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}.ogg`;

    let transcription = null;
    // Subir el archivo al almacenamiento de oci
    try {
        const client = new objectStorage.ObjectStorageClient({
            authenticationDetailsProvider: provider
        });

        const putObjectRequest = {
            namespaceName: namespaceName,
            bucketName: bucketName,
            objectName: fileName,
            contentLength: buffer.length,
            putObjectBody: buffer,
        };

        const response = await client.putObject(putObjectRequest);


        if (response) {
            const aiClient = new aispeech.AIServiceSpeechClient({
                authenticationDetailsProvider: provider
            });

            const createTranscriptionJobDetails = {

                compartmentId: process.env.NEXT_PUBLIC_COMPARTMENT_ID,
                modelDetails: {
                    domain: aispeech.models.TranscriptionModelDetails.Domain.Generic,
                    languageCode: aispeech.models.TranscriptionModelDetails.LanguageCode.EsEs,
                },
                normalization: {
                    isPunctuationEnabled: true,
                    filters: [
                        {
                            type: "PROFANITY",
                            mode: aispeech.models.ProfanityTranscriptionFilter.Mode.Tag
                        }
                    ]
                },
                inputLocation: {
                    locationType: "OBJECT_LIST_INLINE_INPUT_LOCATION",
                    objectLocations: [
                        {
                            namespaceName: namespaceName,
                            bucketName: bucketName,
                            objectNames: [fileName]
                        }
                    ]
                },
                outputLocation: {
                    namespaceName: namespaceName,
                    bucketName: bucketName,
                    prefix: "transcriptions",
                },
            };

            // Send request to the Client.
            const createTranscriptionJobResponse = await aiClient.createTranscriptionJob(
                { createTranscriptionJobDetails: createTranscriptionJobDetails }
            );

            await new Promise(resolve => setTimeout(resolve, 15000));

            const job_name = createTranscriptionJobResponse.transcriptionJob.outputLocation.prefix;
            const outputLocation = `${job_name}${namespaceName}_${bucketName}_${fileName}.json`;
            const getObjectRequest = {
                namespaceName: namespaceName,
                bucketName: bucketName,
                objectName: outputLocation
            };

            const getObjectResponse = await client.getObject(getObjectRequest);
            const objectContent = getObjectResponse.value;
            const data = await toJSON(objectContent);
            console.log("Object Content: ", data);
            transcription = data.transcriptions[0].transcription;
        }
    }
    catch (e) {
        console.log("Error: ", e);
    }

    if (transcription) {
        return NextResponse.json({ message: 'File uploaded successfully', transcription: transcription });
    }
    else {
        return NextResponse.json({ message: 'Error uploading the file' });
    }
}
