class Card{
  constructor(name,type){
    this._name=name;
    this._type=type;
  }
  get name(){
    return this._name;
  }
  get type(){
    return this._type;
  }
  isSame(card){
    return this.name.toLowerCase() == card.name.toLowerCase()
    && this.type == card.type;
  }
}

module.exports = Card;
