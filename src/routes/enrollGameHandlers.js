const getEnrollingForm = function(req,message){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm');
  let {gameId} = req.params;
  enrollingForm = enrollingForm.toString()
    .replace('{{ ID }}',gameId)
    .replace('{{ invalidMsg }}',message);
  return enrollingForm;
};

const serveEnrollingForm = function(req,res){
  res.type('html');
  res.send(getEnrollingForm(req,''));
};

const verifyName = function(req,res,next){
  let playerName = req.body.name;
  let {gameId} = req.params;
  playerName = playerName.trim();
  if(!playerName){
    res.type('html');
    let enrollPage = getEnrollingForm(req,'Enter a valid name');
    res.send(enrollPage);
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

const sendPlayerToWaitPage = function(req,res,next){
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  let player = game.getPlayer(req.cookies.playerId);
  if(player){
    res.redirect(`/game/${gameId}/wait`);
    return;
  }
  next();
};

const redirectToGame = function(req,res,next){
  let {gameId} = req.params;
  if(!req.app.games[gameId]){
    res.redirect('/game');
    return;
  }
  next();
};

const restrictExtraPlayer = function (req,res,next) {
  let {gameId} = req.params;
  let game = req.app.games[gameId];
  if(!game.haveAllPlayersJoined()) {
    next();
    return;
  }
  let message = `All players have already joined in Game:${gameId}`;
  res.cookie('invalidGameId',message);
  res.redirect('/game');
};

module.exports = {
  serveEnrollingForm: [
    redirectToGame,
    restrictExtraPlayer,sendPlayerToWaitPage,
    serveEnrollingForm],
  addPlayerToGame: [
    redirectToGame,restrictExtraPlayer,
    sendPlayerToWaitPage,verifyName,
    addPlayerToGame],
  redirectToGame
};
