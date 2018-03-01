const http = require('http');
const app = require('./app.js');
const PORT = process.env.PORT || 8080;
const Game = require('./src/models/game.js');

let game = new Game(3);
app.games['1234'] = game;
game.addPlayer('neeraj', 11);
game.addPlayer('omkar', 12);
game.addPlayer('pranav', 13);
const server = http.createServer(app);
server.listen(PORT);
console.log(`Listening on PORT ${PORT}`);
