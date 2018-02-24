let playerTurn = 0;

let sendAjaxRequest = function (method, url, cb, data = '') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load', () => cb(req.responseText));
  req.setRequestHeader("Content-Type", "application/json");
  req.send(data);
};

const passTurn = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get',`${url}/pass`,()=>{
    disablePopup();
    showMessage('');
    updateStatus();
  });
};

const suspectOrAccuse = function () {
  let url = getBaseUrl();
  let suspicion = document.getElementById('suspect').checked;
  let accusation = document.getElementById('accuse').checked;
  let character = document.getElementById('character').value;
  let weapon = document.getElementById('weapon').value;
  if (suspicion) {
    sendAjaxRequest('post',`${url}/suspect`,res=>{
      updatePos(character,res);
      updateStatus();
    },`{"character":"${character}","weapon":"${weapon}"}`);
  } else if(accusation) {
    sendAjaxRequest('post',`${url}/accuse`,res=>{
      updateStatus();
    },`{
      "character":"${character}",
      "weapon":"${weapon}"
    }`);
  }
};

const updatePos = function(character,res) {
  let token = character.split(' ')[1].toLowerCase();
  let suspectorToken = JSON.parse(res).suspector
    .split(' ')[1].toLowerCase();
  token = document.getElementById(token);
  suspectorToken = document.getElementById(suspectorToken);
  let posX = suspectorToken.getAttribute('cx');
  let posY = suspectorToken.getAttribute('cy');
  token.setAttribute('cx',posX+10);
  token.setAttribute('cy',posY+10);
};

const setCurrentPlayer = function (player) {
  let pd = document.querySelector('#current-player');
  playerTurn = player.character.turn;
  document.querySelector('#player-token')
    .setAttribute('fill', player.character.color);
  pd.innerHTML = `<span>${player.name}</span>
  <span>${player.character.name}</span>`;
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
  document.querySelector('#all-players').innerHTML +=
  `<div style="color:${player.character.color}" class="player"
  id='turn_${player.character.turn}'>
  <span>${player.name}</span>
  <span>${player.character.name}</span></div>`;
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
  updateStatus();
};

const getPlayerDetails = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/data`, fillPlayerDetails);
};

const updateStatus = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/status`, (res) => {
    res = JSON.parse(res);
    let turn = res.currentPlayer.character.turn;
    if(res.suspecting){
      showMessage(`${res.currentPlayer.name} has raised a suspicion`);
      disablePopup();
      showSuspicionCards(res.combination);
      getSuspicion();
    } else if (playerTurn == turn && !res.moved) {
      enableRollDice();
    } else if(res.currentPlayer.inRoom && playerTurn==turn){
      enableSuspicion();
    }
    removeTurnHighlight();
    document.getElementById(`turn_${turn}`).style['background-color'] = 'gray';
  });
};
const getSuspicion = function(){
  let url = getBaseUrl();
  sendAjaxRequest('get',`${url}/suspicion`,(res)=>{
    let suspicion = JSON.parse(res);
    let playerId = getCookie('playerId');
    if (suspicion.canBeCancelled && !suspicion.cancelled){
      if(suspicion.cancellingCards){
        showMessage('Rule out Suspicion by selecting a card');
        enableRuleOut(suspicion.cancellingCards);
      }
    }else if(suspicion.ruleOutCard){
      if(suspicion.cancellingCards){
        disableRuleOut();
      }
      showMessage(`Ruled out by ${
        suspicion.cancelledBy} using ${suspicion.ruleOutCard}`);
      // enableAccusation();
    }else{
      showMessage(`Ruled out by ${suspicion.cancelledBy}`);
    }
  });
};
let ruleOutEnabled = false;

const disableRuleOut = function(){
  ruleOutEnabled = false;
  disablePopup();
};
const enableRuleOut = function(cards){
  if(ruleOutEnabled) {
    return;
  }
  ruleOutEnabled=true;
  let popup = document.getElementById('activity-box');
  popup.innerHTML = `
  <div class="popup cancelsuspicion">
    <select id="cancelsuspicion">
      ${cards.reduce((html, card) => html + `<option value="${card._name}">
      ${card._name}</option>`,'')}
    </select>
    <button id="ruleOut" onclick="ruleOutSuspicion()">Rule Out</button>
  </div>
  `;
};

const ruleOutSuspicion = function(){
  let val = document.getElementById('cancelsuspicion');
  let url = getBaseUrl();
  sendAjaxRequest('post',`${url}/ruleout`,(res)=>{
    res = JSON.parse(res);
    if(res.success){
      ruleOutEnabled = false;
    }
  }, `{"card":"${val.value}"}`);
};

const removeTurnHighlight = function(){
  let players = document.querySelectorAll('.player');
  players.forEach(player=>{
    player.style['background-color'] = '';
  });
};

const startStatusUpdater = function () {
  setInterval(updateStatus, 1000);
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
};
