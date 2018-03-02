const getWaitingPage = function(req,gameId,playerName,numOfPlayers){
  let waitingPage = req.app.fs.readFileSync('templates/waitingPage','utf8');
  waitingPage = waitingPage.replace('{{ gameId }}',gameId)
    .replace('{{ player }}',playerName)
    .replace('{{ noofplayers }}',req.game.getPlayerCount())
    .replace('{{ totalPlayers }}',numOfPlayers);
  return waitingPage;
};

const serveWaitingPage = function(req,res){
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  let playerId = req.cookies.playerId;
  let playerName=game.getPlayer(playerId).name;
  let numOfPlayers = game.numberOfPlayers;
  res.send(getWaitingPage(req,gameId,playerName,numOfPlayers));
};

const getNumOfPlayers = function(req,res) {
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  let playerId = req.cookies.playerId;
  let playerColor=game.getPlayer(playerId).character.tokenColor;
  res.json({
    color: playerColor,
    count : game.getPlayerCount(),
    start :game.haveAllPlayersJoined(),
    link :`/game/${gameId}`
  });
};

module.exports = {
  serveWaitingPage:[serveWaitingPage],
  getNumOfPlayers:[getNumOfPlayers]
};
