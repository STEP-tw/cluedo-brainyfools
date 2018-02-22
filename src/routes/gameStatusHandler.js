const getGameStatus = function (req, res) {
  let gameStatus = {
    "currentPlayer": req.game.getCurrentPlayer(),
    "moved": req.game.playerMoved
  };
  res.json(gameStatus);
};

module.exports = getGameStatus;
