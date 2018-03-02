/* eslint-disable no-empty-function no-implicit-globals*/
const updateTokenPos = function(positions){
  positions.forEach((char)=>{
    let name = char.name;
    let id = name.split(' ').pop().toLowerCase();
    if(!char.inactive) {
      updateCharPosition(id, char.position);
    }
  });
};

const updateCharPosition = function(id,pos){
  if (isRoom(pos)) {
    pos = `${id}-${pos}`;
  }
  let posElement = document.getElementById(`${pos}`);
  let posX = posElement.getAttribute('x');
  let posY = posElement.getAttribute('y');
  document.getElementById(`${id}`).setAttribute('cx',+posX+ 23);
  document.getElementById(`${id}`).setAttribute('cy',+posY+ 23);
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
  document.querySelector('#dice-box').innerHTML = `
  <div id="roll-dice">
    <span class="rolldice" onclick="rollDice()" id="dice"></span>
  </div>`;
  disablePopup();
  dice = document.getElementById("dice");
  change(1);
};

const disableRollDice = function(){
  document.querySelector('#dice-box').innerHTML = ``;
};

const enableSuspicion = function(suspect,accuse){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
  <div><div><label for='character'>Character</label>
  <select name="character" id="character" class="styled-select slate">
  <option value="Miss Scarlett">Miss Scarlett</option>
  <option value="Col. Mustard">Col. Mustard</option>
  <option value="Dr. Orchid">Dr. Orchid</option>
  <option value="Rev. Green">Rev. Green</option>
  <option value="Mrs. Peacock">Mrs. Peacock</option>
  <option value="Prof. Plum">Prof. Plum</option>
  </select></div><div><label for='weapon'>Weapon</label>
  <select name="weapon" id="weapon" class="styled-select slate">
  <option value="Rope">Rope</option>
  <option value="Dagger">Dagger</option>
  <option value="Wrench">Wrench</option>
  <option value="Revolver">Revolver</option>
  <option value="Candlestick">Candlestick</option>
  <option value="Lead Pipe">Lead Pipe</option></select>
  </div></div>
  ${`<button onclick="suspectOrAccuse(${suspect})">
  ${suspect ? 'Suspect' : accuse ? 'Accuse' : ''}</button>`}
  </div>`;
  enablePopup();
};

const showPossibleOptions = function(suspect, rolldice,secretPassage){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
  <div id="confirm">
  ${suspect? `<button onclick="enableSuspicion(${suspect})"
  >Suspect</button>`:''}
  ${`<button onclick="enableAccusation(${suspect})">Accuse</button>`}
  ${rolldice ? `<button onclick="enableRollDice();disablePopup()"
  >Roll&nbsp;Dice</button>` : ''}
  <button onclick="passTurn()">Pass</button>
  ${secretPassage ? `<button
  onclick="moveToken('${secretPassage}');disablePopup()"
  >Secret&nbsp;Passage</button>` : ''}
  </div></div>`;
  enablePopup();
};

const enableAccusation = function() {
  enableSuspicion(false,true);
};

const disablePopup = function () {
  document.getElementById('myModal').style.display = "none";
};
const enablePopup = function () {
  document.getElementById('myModal').style.display = "block";
};

const showMessage = function(message){
  document.querySelector('#dice-box')
    .innerHTML = `<div id='message-box'>${message}</div>`;
};

const getBaseUrl = function(){
  return window.location.pathname.replace(/\/$/,'');
};

const showSuspicionCards = function(cards) {
  let characterCard = cards.character.replace(/[.\s]+/,'_');
  let weaponCard = cards.weapon.replace(/[.\s]+/,'_');
  let roomCard = cards.room.replace(/[.\s]+/,'_').split('_')[0];
  document.getElementById('character-card').setAttribute('src',
    `/images/cards/Character/${characterCard}.jpg`);
  document.getElementById('weapon-card').setAttribute('src',
    `/images/cards/Weapon/${weaponCard}.jpg`);
  document.getElementById('room-card').setAttribute('src',
    `/images/cards/Room/${roomCard}.jpg`);
};

const disableCards = function () {
  // document.getElementById('character-card').setAttribute('href','');
  // document.getElementById('weapon-card').setAttribute('href','');
  // document.getElementById('room-card').setAttribute('href','');
};

const showWeapon = function (room,weapon) {
  let weaponImg=weapon.replace(/[.\s]+/,'_');
  let imagePath = `/images/weapons/${weaponImg}.png`;
  document.getElementById(`weapon-${room}`).setAttribute("href", imagePath);
};

const disableWeapon = function () {
  document.getElementById(`weapon-hall`).setAttribute("href", "");
  document.getElementById(`weapon-kitchen`).setAttribute("href", "");
  document.getElementById(`weapon-dining`).setAttribute("href", "");
  document.getElementById(`weapon-billiard`).setAttribute("href", "");
  document.getElementById(`weapon-ballroom`).setAttribute("href", "");
  document.getElementById(`weapon-study`).setAttribute("href", "");
  document.getElementById(`weapon-lounge`).setAttribute("href", "");
  document.getElementById(`weapon-conservatory`).setAttribute("href", "");
  document.getElementById(`weapon-library`).setAttribute("href", "");
};

window.addEventListener('load',()=>{
  boardStatusId = setInterval(showBoardStatus,3000);
});
