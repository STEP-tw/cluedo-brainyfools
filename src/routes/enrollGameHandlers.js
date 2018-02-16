const getEnrollingForm = function(req){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm');
  let {gameId} = req.params;
  enrollingForm = enrollingForm.toString().replace('{{ ID }}',gameId);
  return enrollingForm;
};

const serveEnrollingForm = function(req,res){
  res.contentType('text/html');
  res.send(getEnrollingForm(req));
};

const invalidNameMessage = function(req,res){
  let form = getEnrollingForm(req)
    .replace('<invalidMessage> </invalidMessage>','Enter a valid name <br> <br>');
  return form;
}

const verifyName = function(req,res,next){
  let playerName = req.body.name;
  let {gameId} = req.params;
  playerName = playerName.trim();
  if(!playerName){
    res.contentType('text/html');
    res.send(invalidNameMessage(req,res));
    return;
  }
  next();
};

const addPlayerToGame = function(req,res){
  let playerName = req.body.name;
  let {gameId} = req.params;
  let playerId = req.app.idGenerator();
  let game = req.app.games[gameId];
  game.addPlayer(playerName,playerId);
  res.cookie('playerId',playerId);
  res.redirect(`/game/${gameId}/wait`);
};

const serveWaitingPage = function(req,res){
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  let playerId = req.cookies.playerId;
  let playerName=game.getPlayer(playerId).name;
  let numOfPlayers = game.numberOfPlayers;
  res.send(getWaitingPage(req,gameId,playerName,numOfPlayers));
};

const getWaitingPage = function(req,gameId,playerName,numOfPlayers){
  let waitingPage = req.app.fs.readFileSync('templates/waitingPage','utf8');
  waitingPage = waitingPage.replace('{{ gameId }}',gameId)
    .replace('{{ player }}',playerName)
    .replace('{{ totalPlayers }}',numOfPlayers);
  return waitingPage;
};

module.exports = {
  serveEnrollingForm,
  addPlayerToGame:[verifyName,addPlayerToGame],
  serveWaitingPage,
};
