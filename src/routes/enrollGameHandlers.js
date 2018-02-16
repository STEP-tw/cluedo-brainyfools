const serveEnrollingForm = function(req,res){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm','utf8');
  let gameId = req.params.id;
  enrollingForm = enrollingForm.replace(/{{ ID }}/,gameId);
  res.contentType("text/html");
  res.send(enrollingForm);
};

const sendToWaitingPage = function(req,res){
  let playerName = req.body.name;
  let gameId = req.params.id;
  playerName = playerName.trim();
  if(!playerName){
    res.redirect(`/game/join/${gameId}`);
    return;
  }
  let playerId = req.app.idGenerator();
  let game = req.app.games[gameId];
  game.addPlayer(playerName,playerId);
  res.cookie('playerId',playerId);
  res.redirect(`/game/${gameId}/wait`);
};

const serveWaitingPage = function(req,res){
  let waitingPage = req.app.fs.readFileSync('templates/waitingPage','utf8');
  let gameId = req.params.id;
  let game = req.app.games[gameId];
  let playerId = req.cookies.playerId;
  let playerName=game.getPlayer(playerId).name;
  waitingPage = waitingPage.replace(/{{ gameId }}/,gameId);
  waitingPage = waitingPage.replace(/{{ player }}/,playerName);
  waitingPage = waitingPage.replace(/{{ gameLink }}/,`/game/join/${gameId}`);
  res.end(waitingPage);
};

module.exports = {
  serveEnrollingForm,
  sendToWaitingPage,
  serveWaitingPage
};
