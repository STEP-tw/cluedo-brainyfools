const serveGamePage = function(req,res){
  let gamePage = req.app.fs.readFileSync('./templates/game.html');
  let game = req.game;
  if(!game.hasStarted()) {
    game.start();
  }
  res.type('html');
  res.send(gamePage);
};

module.exports = serveGamePage;
