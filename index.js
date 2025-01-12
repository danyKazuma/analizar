const express = require('express');
const cors = require('cors');
const axios = require('axios');

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

    // Función para obtener el tamaño del archivo desde su URL
    const getFileSize = async (url) => {
        try {
            const response = await axios.head(url); // Realizar una solicitud HEAD
            const contentLength = response.headers['content-length']; // Obtener el tamaño en bytes
            return contentLength ? parseInt(contentLength, 10) : null;
        } catch (error) {
            console.error(`Error al obtener el tamaño del archivo para URL: ${url}`, error.message);
            return null; // Retornar null en caso de error
        }
    };

    // Procesar las URLs y obtener datos
    const results = await Promise.all(
        urls.map(async (url) => {
            const identificador = extractText(url);
            const size = await getFileSize(url);
            return {
                url,
                identificador,
                size: size ? `${(size / (1024 * 1024)).toFixed(2)} MB` : null, // Convertir a MB
                status: identificador
                    ? size
                        ? 'Texto y tamaño obtenidos correctamente'
                        : 'Texto obtenido, pero no se pudo determinar el tamaño'
                    : 'No se pudo extraer el texto'
            };
        })
    );

    // Devolver los resultados
    res.status(200).json({ success: true, data: results });
});

// Puerto para desarrollo local
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});

module.exports = app; // Requerido para Vercel
