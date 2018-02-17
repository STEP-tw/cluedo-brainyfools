const getGameData = function(req, res){
  let playerDetails = req.game.getAllPlayerDetails();
  res.json(playerDetails);
};

module.exports = getGameData;
