const verifyGameId = function(req, res, next) {
  let gameId = req.body['gameId'];
  if (req.app.games[gameId]) {
    next();
    return;
  }
  res.cookie('invalidGameId', 'true');
  res.cookie('message', 'Enter valid game id');
  res.redirect('/game');
};

const joinGameHandler = function(req,res) {
  let gameId = req.body['gameId'];
  res.clearCookie('invalidGameId');
  res.redirect(`/game/join/${gameId}`);
};

module.exports = {
  joinGameHandler: joinGameHandler,
  verifyGameId: verifyGameId
};
