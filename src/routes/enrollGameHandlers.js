const serveEnrollingForm = function(req,res,next){
  let enrollingForm = req.app.fs.readFileSync('templates/enrollingForm','utf8');
  let gameId = req.params.id;
  enrollingForm = enrollingForm.replace(/{{ ID }}/,gameId);
  res.contentType("text/html");
  res.send(enrollingForm);
  next();
};

const sendToWaitingPage = function(req,res,next){
  let playerId = new Date().getTime();
  let gameId = req.params.id;
  let playerName = req.body.name;
  let game = req.app.games[gameId];
  game.addPlayer(playerName,playerId);
  res.cookie('playerId',playerId);
  res.redirect(`/game/${gameId}/wait`);
  next();
};

module.exports = {
  serveEnrollingForm,
  sendToWaitingPage
};
