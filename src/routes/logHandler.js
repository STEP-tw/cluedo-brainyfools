const logHandler = function(req,res){
  let game = req.game;
  let time = req.params.time;
  res.json(game.getActivitesAfter(time));
};

module.exports = logHandler;
