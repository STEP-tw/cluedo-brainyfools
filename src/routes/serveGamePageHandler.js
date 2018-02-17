const redirectToGame = require('./enrollGameHandlers.js').redirectToGame;

const serveGamePage = function(req,res){
  let gamePage = req.app.fs.readFileSync('templates/game.html');
  // res.set('Content-Type','text/html');
  res.type('html');
  res.send(gamePage);
};

module.exports = [redirectToGame, serveGamePage];
