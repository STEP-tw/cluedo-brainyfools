const rollDice = function(req,res){
  let diceVal = req.game.rollDice();
  res.json({value:diceVal});
};

const checkTurn = function(req,res, next){
  next();
};

module.exports = {
  rollDice : [checkTurn, rollDice]
};
