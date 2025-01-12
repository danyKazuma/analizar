const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Asegúrate de que axios esté instalado: npm install axios

const app = express();
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON en solicitudes

// Endpoint principal
app.post('/analizar', async (req, res) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'No se proporcionaron URLs o formato inválido' });
    }

    // Función para extraer el texto deseado
    const extractText = (url) => {
        const regex = /https:\/\/storage\.googleapis\.com\/liquidacionconvenios-prd\/Orders\/([^_]+_[^_]+)/;
        const match = url.match(regex);
        return match ? match[1] : null; // Devolver el texto capturado o null si no coincide
    };

    // Función para obtener las propiedades de un archivo
    const obtenerArchivo = async (url) => {
        try {
            const response = await axios.head(url, { timeout: 10000 }); // 10 segundos de tiempo de espera
            const size = response.headers['content-length']; // Obtener el tamaño desde los encabezados
            const sizeNumber = size ? parseInt(size, 10) : null; // Convertir a número

            const regex = /https:\/\/storage.googleapis.com\/liquidacionconvenios-prd\/Orders\/([^_]+_[^_]+)_/;
            const match = url.match(regex);
            const identificador = match ? match[1] : "No identificado";

            // Verificar si el archivo es corrupto
            const esCorrupto = sizeNumber === 32;

            return {
                url,
                size: size ? `${size} bytes` : "Tamaño no disponible",
                identificador,
                esCorrupto,
                status: esCorrupto ? "Documento corrupto" : "Documento válido"
            };
        } catch (error) {
            console.error('Error al obtener el archivo:', error.message);
            return {
                url,
                size: "Error al obtener tamaño",
                identificador: "No identificado",
                esCorrupto: false,
                status: "Error al procesar el documento",
                error: error.message || "Error desconocido"
            };
        }
    };

    // Procesar las URLs y obtener los datos
    const results = await Promise.all(urls.map(async (url) => {
        const fileData = await obtenerArchivo(url);
        return fileData;
    }));

    // Devolver los resultados
    res.status(200).json({ success: true, data: results });
});

// Puerto para desarrollo local
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});

module.exports = app; // Requerido para Vercel
