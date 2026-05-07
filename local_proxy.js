const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const PORT = 2003;

// 1. Proxy Wiki (Port 2001)
app.use('/wiki', createProxyMiddleware({
    target: 'http://127.0.0.1:2001',
    changeOrigin: true,
    ws: true, // Enable WebSockets for Hot Reload
    logLevel: 'error',
    onError: (err, req, res) => {
        res.status(502).send('⏳ Le Wiki est en cours de démarrage (compilation Docusaurus)... Rechargez la page dans quelques secondes !');
    }
}));

// 2. Proxy Blog (Port 2002)
app.use('/news', createProxyMiddleware({
    target: 'http://127.0.0.1:2002',
    changeOrigin: true,
    ws: true, // Enable WebSockets for Hot Reload
    logLevel: 'error',
    onError: (err, req, res) => {
        res.status(502).send('⏳ Le Blog est en cours de démarrage (compilation Docusaurus)... Rechargez la page dans quelques secondes !');
    }
}));

// 3. Serve the rest statically from root
// Exclude proxy routes so Express static doesn't intercept them
app.use(express.static(path.join(__dirname, '.'), {
    index: ['index.html'],
    setHeaders: (res, path, stat) => {
        // disable cache for dev
        res.set('Cache-Control', 'no-store');
    }
}));

// 4. Handle 404
app.use((req, res) => {
    res.status(404).send('Not Found locally');
});

const server = app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`🚀 UNIFIED LOCAL SERVER RUNNING 🚀`);
    console.log(`=========================================`);
    console.log(`➜ Root & Portfolio:  http://localhost:${PORT}/`);
    console.log(`➜ Wiki Proxy:        http://localhost:${PORT}/wiki/`);
    console.log(`➜ Blog Proxy:        http://localhost:${PORT}/news/`);
    console.log(`=========================================`);
    console.log(`\nNote: Les instances Docusaurus prennent ~10 secondes pour démarrer.`);
    console.log(`Appuyez sur Ctrl+C ou fermez ce terminal pour tout arrêter.\n`);
});

server.on('upgrade', (req, socket, head) => {
    // console.log(`[Proxy] Upgrade request for ${req.url}`);
});
