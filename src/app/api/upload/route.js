import { NextResponse } from 'next/server';
import fs from 'fs';
// import { pipeline } from 'stream';
// import { promisify } from 'util';

export async function POST(request) {
    
    const data = await request.formData(); // datos del request en version formData
    const audioFile = data.get('audio'); // el archivo de audio

    
    const arayBuffer = await audioFile.arrayBuffer(); // convertir el archivo a un array buffer
    const buffer = Buffer.from(arayBuffer); // convertir el array buffer a un buffer de datos

    // escribir el archivo (se debe cambiar a subirlo a la nube)
    fs.open('audio.ogg', 'w', function(err, fd) {
        if (err) {
            throw 'could not open file: ' + err;
        }

        fs.write(fd, buffer, function(err) {
            if (err) throw 'error writing file: ' + err;
            fs.close(fd, function() {
                console.log('file written');
            })
        });
    });

    // version alternativa de laura, mas corto
    // const writeStream = fs.createWriteStream('audio.ogg');
    // const pipe = promisify(pipeline);

    // await pipe(audioFile.stream(), writeStream)
    //     .catch(err => console.error('Error writing file:', err));

    return NextResponse.json({ message: 'File uploaded successfully' })
}