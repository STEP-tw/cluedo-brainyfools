const getGameStatus = function (req, res) {
  let player = req.game.getCurrentPlayer();
  let gameStatus = {
    "currentPlayer": player,
    "moved": req.game.playerMoved,
    "suspecting":req.game.isSuspecting(),
    "accusing":req.game.isAccusing(),
    "combination":req.game.getCombination(),
    "accuseCombination":req.game.getAccuseCombination(),
    "canSuspect" : req.game.canSuspect(),
    "inRoom" : req.game.isPlayerInRoom(),
    "playersStatus" : req.game.getPlayersStatus(),
    "secretPassage" : req.game.getSecretPassage(),
    "gameState" : req.game.state
  };
  res.json(gameStatus);
};

module.exports = getGameStatus;
