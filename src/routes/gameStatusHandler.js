const getCurrentTurn = function(req,res,next) {
  let currentTurn = {"id":req.game.getPlayerIdByTurn()};
  res.json(currentTurn);
  next();
};

module.exports = getCurrentTurn;
