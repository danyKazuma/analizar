// Función para obtener las propiedades de un archivo
async function obtenerArchivo(url) {
    try {
        const response = await axios.head(url);  // Usamos HEAD para obtener solo los encabezados
        const size = response.headers['content-length'];  // Obtener el tamaño desde los encabezados

        // Capturar el texto después de "Orders/" hasta el segundo "_"
        const regex = /https:\/\/storage.googleapis.com\/liquidacionconvenios-prd\/Orders\/([^_]+_[^_]+)_/;
        const match = url.match(regex);

        // Capturar el identificador extraído
        const identificador = match ? match[1] : "No identificado";

        return { url, size, identificador };
    } catch (error) {
        console.error('Error al obtener el archivo:', error.message);
        return { url, error: 'No se pudo obtener el archivo' };
    }
}

// Ruta POST para recibir las URLs y devolver los resultados
app.post('/analizar', async (req, res) => {
    const urls = req.body;  // Se espera que el cuerpo de la solicitud tenga un campo 'urls'

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'Por favor ingresa un array de URLs' });
    }

    const resultados = [];

    // Procesamos cada URL
    for (const url of urls) {
        const archivo = await obtenerArchivo(url);
        resultados.push(archivo);
    }

    // Devolvemos la respuesta en formato JSON
    res.json(resultados);
});

// Configuramos el puerto donde se escucharán las peticiones
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});