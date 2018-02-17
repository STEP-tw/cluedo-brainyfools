const serveGamePage = function(req,res){
  let gamePage = req.app.fs.readFileSync('./templates/game.html');
  res.type('html');
  res.send(gamePage);
};

module.exports = serveGamePage;
