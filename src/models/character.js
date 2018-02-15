class Character {
  constructor(name,color,position,turn) {
    this._name = name;
    this._tokenColor = color;
    this._position = position;
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
