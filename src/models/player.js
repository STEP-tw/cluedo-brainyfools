class Player {
  constructor(name,character) {
    this._name = name;
    this._character = character;
  }
  get name(){
    return this._name;
  }
  get character(){
    return this._character;
  }
  updatePos(pos){
    this.character.position = pos;
    this.character.start = false;
    return true;
  }
}

module.exports = Player;
