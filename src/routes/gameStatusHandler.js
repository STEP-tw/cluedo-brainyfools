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
    "inRoom" : req.game.isPlayerInRoom()
  };
  res.json(gameStatus);
};

module.exports = getGameStatus;
