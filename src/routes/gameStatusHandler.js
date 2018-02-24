const getGameStatus = function (req, res) {
  let player = req.game.getCurrentPlayer();
  let gameStatus = {
    "currentPlayer": player,
    "moved": req.game.playerMoved,
    "suspecting":req.game.isSuspecting(),
    "combination":req.game.getCombination()
  };
  res.json(gameStatus);
};

module.exports = getGameStatus;
