const getCurrentTurn = function (req, res) {
  let currentTurn = {
    "currentPlayer": req.game.getCurrentPlayer()
  };
  res.json(currentTurn);
};

module.exports = getCurrentTurn;
