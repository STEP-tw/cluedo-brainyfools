class Character {
  constructor(character) {
    this._name = character.name;
    this._tokenColor = character.color;
    this._position = character.position;
    this._turn = character.turn;
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
  get start(){
    return this._start;
  }
  set position(pos){
    this._position = pos;
  }
  set start(started){
    this._start = started;
  }
}

module.exports = Character;
