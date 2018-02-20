const getGameData = function(req, res){
  let {playerId} = req.cookies;
  let playerDetails = req.game.getAllPlayerDetails(playerId);
  res.json(playerDetails);
};

module.exports = getGameData;
