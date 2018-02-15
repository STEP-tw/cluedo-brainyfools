const joinGameHandler = function(req,res) {
  let gameId = req.body['gameId'];
  if(req.app.games[gameId]) {
    res.redirect(`${req.url}/${gameId}`);
    return;
  }
  res.cookie('invalidGameId', 'true');
  res.cookie('message', 'Enter valid game id');
  res.redirect('/game');
};

module.exports = {
  joinGameHandler: joinGameHandler
};
