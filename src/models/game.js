const Player = require('./player.js');
const Character = require('./character.js');
const characterData = require('../data/characterData.json');

class Game {
  constructor(numberOfPlayers) {
    this.numberOfPlayers = numberOfPlayers;
    this.players = {};
    this.playerCount=0;
  }
  addPlayer(name,id){
    let character = characterData[++this.playerCount];
    character = new Character(character);
    let player = new Player(name,character);
    this.players[id] = player;
  }
  getPlayerCount(){
    return this.playerCount;
  }
  getPlayer(playerId){
    return this.players[playerId];
  }
  haveAllPlayersJoined(){
    return this.numberOfPlayers == this.playerCount;
  }

  getAllPlayerDetails(){
    let players = Object.keys(this.players);
    return players.reduce((details,playerId)=>{
      let player = this.players[playerId];
      details[playerId] = {
        name: player.name,
        character : {
          name : player.character.name,
          color: player.character.tokenColor
        }};
      return details;
    },{});
  }

  getPlayersPosition(){
    return Object.values(this.players).map((player)=>{
      let char = player.character;
      return {
        name:char.name,
        position:char.position
      };
    });
  }
}

module.exports = Game;
