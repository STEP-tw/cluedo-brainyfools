const getBoardStatus = function(req,res){
  let game = req.game;
  res.json(game.getPlayersPosition());
};

module.exports = getBoardStatus;
