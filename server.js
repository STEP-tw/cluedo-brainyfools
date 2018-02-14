const http = require('http');
const app = require('./app.js');
const PORT = 8080;

const server = http.createServer(app);
server.listen(PORT);
