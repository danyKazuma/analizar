const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors()); // Habilitar CORS
app.use(express.json()); // Parsear JSON en solicitudes

// Endpoint principal
app.post('/analizar', (req, res) => {
    const { urls } = req.body;

    const size = response.headers['content-length'];

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'No se proporcionaron URLs o formato inválido' });
    }

    // Función para extraer el texto deseado
    const extractText = (url) => {
        const regex = /https:\/\/storage\.googleapis\.com\/liquidacionconvenios-prd\/Orders\/([^_]+_[^_]+)/;
        const match = url.match(regex);
        return match ? match[1] : null; // Devolver el texto capturado o null si no coincide
    };

    // Procesar las URLs y extraer el texto deseado
    const results = urls.map((url) => {
        const identificador = extractText(url);
        return identificador
            ? { url, identificador, status: 'Texto extraído correctamente' }
            : { url, size, status: 'Peso del archivo' };
            //: { url, identificador: null, status: 'No se pudo extraer el texto' };
    });

    // Devolver los resultados
    res.status(200).json({ success: true, data: results });
});

// Puerto para desarrollo local
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});

module.exports = app; // Requerido para Vercel
