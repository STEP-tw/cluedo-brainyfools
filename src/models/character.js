class Character {
  constructor(character,turn) {
    this._name = character.name;
    this._tokenColor = character.color;
    this._position = character.position;
    this._turn = turn;
  }
  get name(){
    return this._name;
  }
  get tokenColor(){
    return this._tokenColor;
  }
  get position(){
    return this._position;
  }
  get turn(){
    return this._turn;
  }
}

module.exports = Character;
