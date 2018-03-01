let playerTurn = 0;

let sendAjaxRequest = function (method, url, cb, data = '') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load', () => cb(req.responseText));
  req.setRequestHeader("Content-Type", "application/json");
  req.send(data);
};

const setCurrentPlayer = function (player) {
  let pd = document.querySelector('#current-player');
  playerTurn = player.character.turn;
  let name = player.character.name.replace(/[.\s]+/, '_');
  pd.innerHTML = `
  <span class="image"
  style="background-image: url('/images/cards/Character/${name}.jpg');"></span>
  <span>${player.name}</span>`;
  showPlayerCards(player.cards);
};

const showPlayerCards = function(cards){
  let cardsDiv = document.getElementById('cards');
  cards.forEach((card)=>{
    let cardName = card.name.replace(/[.\s]+/,'_');
    cardsDiv.innerHTML +=
    `<img src='/images/cards/${card.type}/${cardName}.jpg'/>`;
  });
};

const setOtherPlayer = function (player) {
  let name = player.character.name.replace(/[.\s]+/, '_');
  document.querySelector('#all-players').innerHTML +=
  `<div id='turn_${player.character.turn}' class="player">
    <span class="image"
    style="background-image: url('/images/cards/Character/${name}.jpg');">
    </span>
    <span>${player.name}</span>
  </div>`;
};

const objectValues = function (obj) {
  return Object.keys(obj).map(key => obj[key]);
};

const fillPlayerDetails = function (data) {
  let playerDetails = JSON.parse(data);
  let players = Object.keys(playerDetails);
  let playerId = getCookie('playerId');
  players.forEach(id => {
    let player = playerDetails[id];
    playerId == id && setCurrentPlayer(player);
  });
  objectValues(playerDetails)
    .sort((player1, player2) => {
      return player1.character.turn - player2.character.turn;
    })
    .forEach(setOtherPlayer);
};

const getPlayerDetails = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/data`, fillPlayerDetails);
};

const disableRuleOut = function(){
  disablePopup();
};

const enableRuleOut = function(cards){
  let popup = document.getElementById('activity-box');
  popup.innerHTML = `
  <div class="popup">
    <select id="cancelsuspicion" class="styled-select slate">
      ${cards.reduce((html, card) => html + `<option value="${card._name}">
      ${card._name}</option>`,'')}
    </select>
    <button id="ruleOut" onclick="ruleOutSuspicion()">Rule Out</button>
  </div>
  `;
  enablePopup();
};

const removeTurnHighlight = function(){
  let players = document.querySelectorAll('.player');
  players.forEach(player=>{
    player.classList.remove('active-player');
    player.style.border = '';
  });
};

const getCookie = function (cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let index = 0; index < ca.length; index++) {
    let cookie = ca[index];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(name) == 0) {
      return cookie.substring(name.length, cookie.length);
    }
  }
  return "";
};

window.onload = function () {
  sendAjaxRequest('get', '/svg/board.svg', (res) => {
    document.querySelector('#board').innerHTML = res;
    startStatusUpdater();
    getPlayerDetails();
    showBoardStatus();
  });
  let modal = document.getElementById('myModal');
};
