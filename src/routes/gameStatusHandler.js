const getGameStatus = function (req, res) {
  let gameStatus = {
    "currentPlayer": req.game.getCurrentPlayer(),
  };
  res.json(gameStatus);
};

module.exports = getGameStatus;
