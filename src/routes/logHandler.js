const logHandler = function(req,res){
  let game = req.game;
  let time = req.params.time;
  let {playerId} = req.cookies;
  res.json(game.getActivitiesAfter(time, playerId));
};

module.exports = logHandler;
