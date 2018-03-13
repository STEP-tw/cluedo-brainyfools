/* eslint-disable no-empty-function, no-implicit-globals*/
// let statusUpdaterId;
const passTurn = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/pass`, () => {
    disablePopup();
    disableRollDice();
    getCurrentPlayer();
    currentActivity = getCurrentPlayer;
  });
};

const endRequests = function(){
  getMurderCombination();
  currentActivity = ()=>{ };
  updateLog();
  enablePopup();
  clearInterval(statusUpdaterId);
  clearInterval(boardStatusId);
  clearInterval(activityLogId);
};

const showCompletionMsg = function(msg){
  document.querySelector('.close').innerHTML =
   `<span  onclick="disablePopup()">&times;</span>`;
  document.querySelector('#message-box').innerHTML = msg;
  document.querySelector('.buttonInCenter').innerHTML = `<div
  class="play-again"><a href='/'>Play again</a></div>`;
};

const showGameDraw = function(){
  showCompletionMsg('GAME HAS DRAWN');
  endRequests();
};

const showWinner = function(name){
  showCompletionMsg(`${name.toUpperCase()} HAS WON THE GAME`);
  endRequests();
};

const respondWithGameState = function(name,gameState,message=''){
  if (gameState=='running') {
    showMessage(message);
    setTimeout(function () {
      passTurn();
    },4000);
  } else {
    let methods={'win':showWinner,'draw':showGameDraw};
    methods[gameState](name);
  }
};

const showInactivePlayers = function(playersStatus){
  let keys = Object.keys(playersStatus);
  keys.forEach(turn=>{
    if(!playersStatus[turn]){
      document.getElementById(`turn_${turn}`)
        .setAttribute('style','opacity:0.3');
    }
  });
};

let getCurrentPlayer = function () {
  disableWeapon();
  disablePopup();
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/status`, (res) => {
    res = JSON.parse(res);
    let name=res.currentPlayer.name;
    showMessage('');
    showInactivePlayers(res.playersStatus);
    let turn = res.currentPlayer.character.turn;
    if(res.accusing) {
      currentActivity = () => getAccusation(name,res.gameState);
    } else if (playerTurn == turn && !res.moved) {
      showOptionsToPlayer(res);
    } else if(res.suspecting) {
      currentActivity = () => getSuspicion(name);
    } else if(res.currentPlayer.inRoom && playerTurn == turn) {
      showPossibleOptions(true);
      currentActivity = () => { };
    }
    removeTurnHighlight();
    document.getElementById(`turn_${turn}`).classList.add('active-player');
  });
};

const getAccusation = function (name,gameState) {
  let url = getBaseUrl();
  let playerId = getCookie('playerId');
  sendAjaxRequest('get', `${url}/accusation`, (res) => {
    if (res == '{}') {
      currentActivity = getCurrentPlayer;
    }
    let accusation = JSON.parse(res);
    let roomName = accusation.room;
    let weaponName = accusation.weapon;
    let charName = accusation.character;
    showSuspicion([roomName,weaponName,charName],name);
    showMessage(`${name} has accused`);
    enablePopup();
    setTimeout(function () {
      currentActivity = () => { };
      respondWithGameState(name,gameState,`${name}'s accusation failed`);
    },2000);
  });
};

const showOptionsToPlayer= function(res){
  if (res.canSuspect && res.inRoom) {
    showPossibleOptions(true,true,res.secretPassage,true);
  }else if(res.inRoom && res.secretPassage){
    showPossibleOptions(false,true,res.secretPassage,false);
  } else{
    enableRollDice();
  }
  currentActivity = () => { };
};

const getSuspicion = function (name) {
  let url = getBaseUrl();
  let playerId = getCookie('playerId');
  sendAjaxRequest('get', `${url}/suspicion`, (res) => {
    if (res == '{}') {
      currentActivity = getCurrentPlayer;
    }
    let suspicion = JSON.parse(res);
    if(suspicion.combination){
      let roomName = suspicion.combination._room._name;
      let weaponName = suspicion.combination._weapon._name;
      let charName = suspicion.combination._character._name;
      showWeapon(roomName,weaponName);
      showSuspicion([roomName,weaponName,charName],suspicion.currentPlayer);
    }
    if (suspicion.ruleOutCard) {
      showRuleOutCard(suspicion);
      currentActivity = () => { };
    } else if (suspicion.canBeCancelled && !suspicion.cancelled) {
      if (suspicion.cancellingCards) {
        giveRuleOutOption(suspicion.cancellingCards);
      }
    } else if(suspicion.suspector) {
      currentActivity = () => { };
      showPossibleOptions();
    } else if(suspicion.cancelledBy) {
      showMessage(`${suspicion.cancelledBy} has ruled
        out ${suspicion.currentPlayer}\'s suspicion`);
    } else if(suspicion.currentPlayer) {
      showMessage(`No one ruled out ${suspicion.currentPlayer}\'s suspicion`);
    }
  });
};

const showSuspicion = function(cardList,name) {
  let cards={'room':cardList[0],'weapon':cardList[1],'character':cardList[2]};
  let message=`${name} has raised a suspicion`;
  document.querySelector('#message-box').innerHTML = message;
  showSuspicionCards(cards);
};

const giveRuleOutOption = function(cards){
  currentActivity = () => { };
  enableRuleOut(cards);
};

const sendAccuseReq = function(character,weapon){
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/accuse`, res => {
    res = JSON.parse(res);
    let accusser = res.accusser;
    disablePopup();
  }, `{"character":"${character}","weapon":"${weapon}"}`);
};

const sendSuspectReq = function(character,weapon){
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/suspect`, res => {
    let suspector = JSON.parse(res).suspector;
    disablePopup();
  }, `{"character":"${character}","weapon":"${weapon}"}`);
};

const suspectOrAccuse = function (suspect,cards) {
  let character = cards.char;
  let weapon = cards.weapon;
  if (!suspect) {
    sendAccuseReq(character,weapon);
  } else {
    sendSuspectReq(character,weapon);
  }
  currentActivity = getCurrentPlayer;
};

const dimInvalidMoves = function(invalidMoves){
  invalidMoves.forEach(move=>{
    document.getElementById(move).style.opacity = 0.4;
  });
};

const removeDimMoves = function(invalidMoves){
  invalidMoves.forEach(move=>{
    document.getElementById(move).style.opacity = 1;
  });
};

const rollDice = function () {
  let url = getBaseUrl();
  stopstart();
  setTimeout(() => {
    sendAjaxRequest('get', `${url}/rolldice`, (res) => {
      res = JSON.parse(res);
      stopstart();
      dimInvalidMoves(res.invalidMoves);
      change(res.value);
      document.getElementById("board").onclick = (event)=>
        validatePosition(event,res.invalidMoves);
    });
  }, 1000);
};

const isRoom = function (id) {
  let boardElement = document.getElementById(`${id}`);
  let className = boardElement && boardElement.getAttribute('class');
  return className == "room";
};

const isPath = function (id) {
  return Number.isInteger(+id);
};


const validatePosition = function (event,invalidMoves) {
  let id = event.target.id;
  if (id && (isRoom(id) || isPath(id))) {
    moveToken(id,invalidMoves);
  }
};

const moveToken = function(id, invalidMoves=[]){
  let url = getBaseUrl();
  sendAjaxRequest("post", `${url}/move`, (res) => {
    res = JSON.parse(res);
    if (res.moved) {
      disablePopup();
      disableRollDice();
      document.querySelector('#board').onclick = null;
      currentActivity = getCurrentPlayer;
      showBoardStatus();
      removeDimMoves(invalidMoves);
    }
  }, `{"position":"${id}"}`);
};

const ruleOutSuspicion = function (id) {
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/ruleout`, (res) => {
    res = JSON.parse(res);
    if (res.success) {
      disableRuleOut();
      currentActivity = getCurrentPlayer;
    }
  }, `{"card":"${id}"}`);
};

const getMurderCombination = function(){
  let url = getBaseUrl();
  sendAjaxRequest('get',`${url}/murderCombination`,(res) =>{
    res = JSON.parse(res);
    showSuspicionCards(res,"Murder combination");
  });
};

let currentActivity = getCurrentPlayer;

const startStatusUpdater = function () {
  statusUpdaterId = setInterval(() => {
    currentActivity();
  }, 1000);
};
