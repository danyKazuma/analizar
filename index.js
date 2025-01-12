const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Habilitar CORS para todos los dominios
app.use(cors());
app.use(express.json());

// Endpoint
app.post('/analizar', async (req, res) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls)) {
        return res.status(400).json({ error: 'No se proporcionaron URLs o formato inválido' });
    }

    const results = urls.map((url) => {
        const identificador = url.split('Orders/')[1]?.split('_')[0];
        return { url, identificador, status: 'Procesado correctamente' };
    });

    res.status(200).json({ success: true, data: results });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});
