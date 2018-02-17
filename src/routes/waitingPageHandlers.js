const getWaitingPage = function(req,gameId,playerName,numOfPlayers){
  let waitingPage = req.app.fs.readFileSync('templates/waitingPage','utf8');
  waitingPage = waitingPage.replace('{{ gameId }}',gameId)
    .replace('{{ player }}',playerName)
    .replace('{{ totalPlayers }}',numOfPlayers);
  return waitingPage;
};

const serveWaitingPage = function(req,res){
  let {gameId} = req.params;
  let game = req.game;
  let playerId = req.cookies.playerId;
  let playerName=game.getPlayer(playerId).name;
  let numOfPlayers = game.numberOfPlayers;
  res.send(getWaitingPage(req,gameId,playerName,numOfPlayers));
};

module.exports = {
  serveWaitingPage
};
