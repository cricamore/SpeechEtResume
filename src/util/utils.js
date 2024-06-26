export const toJSON = async (body) => {
    const reader = body.getReader(); // `ReadableStreamDefaultReader`
    const decoder = new TextDecoder();
    const chunks = [];

    async function read() {
        const { done, value } = await reader.read();

        // all chunks have been read?
        if (done) {
            return JSON.parse(chunks.join(''));
        }

        const chunk = decoder.decode(value, { stream: true });
        chunks.push(chunk);
        return read(); // read the next chunk
    }

    return read();
}