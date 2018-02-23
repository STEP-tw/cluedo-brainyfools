const rollDice = function(req,res){
  let game = req.game;
  let currentPlayerName = game.getCurrentPlayer().name;
  if(game.diceVal){
    res.json({value:game.diceVal});
    return;
  }
  let diceVal = game.rollDice();
  game.addActivity(`${currentPlayerName} got ${diceVal}`);
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

const validateData = function(req,res,next){
  if(req.body.position){
    next();
    return;
  }
  res.json({error:"Provide position to move"});
};

const validateMove = function(req,res, next){
  let game = req.game;
  let pos = req.body.position;
  if(game.validateMove(pos)){
    next();
    return;
  }
  res.json({error:"Invalid move"});
};

const updatePos = function(req,res){
  let pos = req.body.position;
  let game = req.game;
  let moved = game.updatePlayerPos(pos);
  let currentPlayer = game.getCurrentPlayer();
  if(!currentPlayer.inRoom){
    game.pass();
  }
  res.json({moved:moved});
};

const passTurn = function (req,res) {
  req.game.pass();
  res.json({passed : true});
};

module.exports = {
  rollDice : [checkTurn, rollDice],
  move : [checkTurn,validateData ,validateMove, updatePos],
  pass : [checkTurn,passTurn]
};
