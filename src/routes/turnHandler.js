const rollDice = function(req,res){
  let diceVal = req.game.rollDice();
  res.json({value:diceVal});
};

const checkTurn = function(req,res, next){
  let game = req.game;
  let {playerId} = req.cookies;
  if(game.isCurrentPlayer(playerId)){
    next();
    return;
  }
  res.json({
    error:"Not your turn."
  });
};

module.exports = {
  rollDice : [checkTurn, rollDice]
};
