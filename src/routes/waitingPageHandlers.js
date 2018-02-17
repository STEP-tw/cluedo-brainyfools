const getWaitingPage = function(req,gameId,playerName,numOfPlayers){
  let waitingPage = req.app.fs.readFileSync('templates/waitingPage','utf8');
  waitingPage = waitingPage.replace('{{ gameId }}',gameId)
    .replace('{{ player }}',playerName)
    .replace('{{ totalPlayers }}',numOfPlayers);
  return waitingPage;
};

const redirectToGame = function(req,res,next){
  let {gameId} = req.params;
  let game = req.game;
  if(!req.app.games[gameId]){
    res.redirect('/game');
    return;
  }
  next();
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
  res.json({
    count : game.getPlayerCount(),
    start :game.haveAllPlayersJoined(),
    link :`/game/${gameId}`
  });
};

const redirectToPlay = function(req,res,next){
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  if(game.haveAllPlayersJoined()){
    res.redirect(`/game/${gameId}`);
    return;
  }
  next();
};

module.exports = {
  serveWaitingPage:[redirectToPlay,serveWaitingPage],
  getNumOfPlayers:[getNumOfPlayers],
  redirectToGame
};
