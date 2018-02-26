const updateTokenPos = function(positions){
  positions.forEach((char)=>{
    let name = char.name;
    if(!char.start){
      let id = name.split(' ').pop().toLowerCase();
      updateCharPosition(id, char.position);
    }
  });
};

const updateCharPosition = function(id,pos){
  let posElement = document.getElementById(`${pos}`);
  let posX = posElement.getAttribute('x');
  let posY = posElement.getAttribute('y');
  if(isRoom(pos)){
    posX = getXCoordOfRoom(pos)-15;
    posY = getYCoordOfRoom(pos)-15;
  }
  document.getElementById(`${id}`).setAttribute('cx',+posX + 15);
  document.getElementById(`${id}`).setAttribute('cy',+posY + 15);
};

const getXCoordOfRoom = function(pos){
  let changeX = ['biliiard','library','dining'];
  let corners = ['conservatory','study','lounge','kitchen'];
  let room = document.getElementById(`room_${pos}`);
  if(corners.includes(pos) || changeX.includes(pos)){
    return +room.getAttribute('x') + (playerTurn-1) * 15;
  }
  return +room.getAttribute('x');
};

const getYCoordOfRoom = function(pos){
  let changeY = ['ballroom','hall'];
  let corners = ['conservatory','study','lounge','kitchen'];
  let room = document.getElementById(`room_${pos}`);
  if(corners.includes(pos) || changeY.includes(pos)){
    return +room.getAttribute('y') + (playerTurn-1) * 15;
  }
  return +room.getAttribute('y');
};

const showBoardStatus = function() {
  let path = getBaseUrl();
  sendAjaxRequest('get',`${path}/boardstatus`,(res)=>{
    let charPositions = JSON.parse(res);
    updateTokenPos(charPositions);
  });
};

let dice;
let dices = ['&#9856;', '&#9857;', '&#9858;', '&#9859;', '&#9860;', '&#9861;'];
let stopped = true;
let timer;

function change(val) {
  let random = Math.floor(Math.random()*6);
  if(val){
    dice.innerHTML = dices[+val-1];
    return;
  }
  dice.innerHTML = dices[random];
}

function stopstart() {
  if(stopped) {
    stopped = false;
    timer = setInterval(change, 100);
  } else {
    clearInterval(timer);
    stopped = true;
  }
}
const enableRollDice = function(){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
  <span class="rolldice" onclick="rollDice()" id="dice"></span>
  </div>`;
  dice = document.getElementById("dice");
  showMessage('Roll Dice');
  change(1);
};

const enableSuspicion = function(suspect, rolldice){
  showMessage('Select a combination or pass');
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
  <div>
  <div>
  <label for='character'>Character</label>
  <select name="character" id="character">
  <option value="Miss Scarlett">Miss Scarlett</option>
  <option value="Col. Mustard">Col. Mustard</option>
  <option value="Dr. Orchid">Dr. Orchid</option>
  <option value="Rev. Green">Rev. Green</option>
  <option value="Mrs. Peacock">Mrs. Peacock</option>
  <option value="Prof. Plum">Prof. Plum</option>
  </select>
  </div>
  <div>
  <label for='weapon'>Weapon</label>
  <select name="weapon" id="weapon">
  <option value="Rope">Rope</option>
  <option value="Dagger">Dagger</option>
  <option value="Wrench">Wrench</option>
  <option value="Revolver">Revolver</option>
  <option value="Candlestick">Candlestick</option>
  <option value="Lead Pipe">Lead Pipe</option>
  </select>
  </div>
  </div>
  <div id="radioButton">
  ${suspect ? `<input type="radio" name="action"
      value = "suspect" id = "suspect" />
    <label>Suspect</label>` : ''}
  <input type="radio" name="action" value="accuse" id="accuse"/>
  <label>Accuse</label>
  </div>
  <div id="confirm">
  <button onclick="suspectOrAccuse()">Confirm</button>
  ${rolldice ? `<button onclick="enableRollDice()"
  >Roll&nbsp;Dice</button>` : ''}
  <button onclick="passTurn()">Pass</button>
  </div>
  </div>`;
};

const enableAccusation = function() {
  enableSuspicion();
};

const disablePopup = function () {
  document.querySelector('#activity-box').innerHTML = '';
};

const showMessage = function(message){
  document.querySelector('#message-box')
    .innerHTML = `<div>${message}</div>`;
};

const getBaseUrl = function(){
  return window.location.pathname.replace(/\/$/,'');
};

const showSuspicionCards = function(cards) {
  let characterCard = cards.character.replace(/[.\s]+/,'_');
  let weaponCard = cards.weapon.replace(/[.\s]+/,'_');
  let roomCard = cards.room.replace(/[.\s]+/,'_').split('_')[0];
  document.getElementById('character-card').setAttribute('href',
    `/images/cards/Character/${characterCard}.jpg`);
  document.getElementById('weapon-card').setAttribute('href',
    `/images/cards/Weapon/${weaponCard}.jpg`);
  document.getElementById('room-card').setAttribute('href',
    `/images/cards/Room/${roomCard}.jpg`);
};

const disableCards = function () {
  document.getElementById('character-card').setAttribute('href','');
  document.getElementById('weapon-card').setAttribute('href','');
  document.getElementById('room-card').setAttribute('href','');
};

window.addEventListener('load',()=>{
  setInterval(showBoardStatus,3000);
});
