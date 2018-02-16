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
    .replace('<invalidMsg> </invalidMsg>','Enter a valid name <br> <br>');
  return form;
};

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

module.exports = {
  serveEnrollingForm: [sendPlayerToWaitPage,serveEnrollingForm],
  addPlayerToGame: [sendPlayerToWaitPage,verifyName,addPlayerToGame],
};
