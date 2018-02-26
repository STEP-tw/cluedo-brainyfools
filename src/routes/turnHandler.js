const Combination = require('../models/combination');
const Card = require('../models/card');

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
  game.addActivity(`${currentPlayer.name} moved`);
  if(!currentPlayer.inRoom){
    game.pass();
  }else{
    game.addActivity(`${currentPlayer.name} entered in ${pos}`);
  }
  res.json({moved:moved});
};

const passTurn = function (req,res) {
  req.game.pass();
  res.json({passed : true});
};

const getCombination = function(cards, room){
  let character = new Card(cards.character, 'Character');
  let weapon = new Card(cards.weapon, 'Weapon');
  room = new Card(room, 'Room');
  return new Combination(room, weapon, character);
};

const createSuspicion = function(req,res){
  let playerId = req.game.getCurrentPlayerId();
  let player = req.game.getCurrentPlayer();
  let room = player.character.position;
  let combination = getCombination(req.body, room);
  req.game.addActivity(
    `${player.name} suspected ${
      req.body.character} with ${req.body.weapon} in ${room}`);
  req.game.updateSuspicionOf(playerId,combination);
  res.json({suspected: true, suspector: player.character.name});
};

const getSuspicion = function(req,res){
  let game = req.game;
  let playerId = req.cookies.playerId;
  let suspicion = game.getSuspicion(playerId);
  res.json(suspicion);
};

const canRuleOut = function(req,res,next){
  let playerId = req.cookies.playerId;
  let card = req.body.card;
  if(req.game.canRuleOut(playerId, card)){
    next();
    return ;
  }
  res.json({success:false, error:"Cannot rule out"});
  req.game.addActivity(`No one ruled out`);
};

const ruleOut = function(req,res){
  let card = req.body.card;
  let playerId = req.cookies.playerId;
  req.game.ruleOut(card);
  let suspicion = req.game.getSuspicion(playerId);
  req.game.addActivity(`Ruled out by ${suspicion.cancelledBy}`);
  res.json({success: true});
};

const createAccusation = function(req, res){
  let game = req.game;
  let player = req.game.getCurrentPlayer();
  let combination = getCombination(req.body, player.character.position);
  let status = game.accuse(combination);
  let position = player.character.position;
  game.addActivity(
    `${player.name} accused ${
      req.body.character} with ${req.body.weapon} in ${position}`);
  res.json({status:status,accusser:player.character.name});
};

module.exports = {
  rollDice : [checkTurn, rollDice],
  move : [checkTurn,validateData ,validateMove, updatePos],
  pass : [checkTurn,passTurn],
  suspect : [checkTurn,createSuspicion],
  accuse : [checkTurn,createAccusation],
  getSuspicion : [getSuspicion],
  ruleOut : [canRuleOut, ruleOut]
};
