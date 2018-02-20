class Player {
  constructor(name,character) {
    this._name = name;
    this._character = character;
    this._cards = [];
  }
  get name(){
    return this._name;
  }
  get character(){
    return this._character;
  }
  addCard(card){
    this._cards.push(card);
  }
}

module.exports = Player;
