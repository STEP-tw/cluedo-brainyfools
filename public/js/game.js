/* eslint-disable no-empty-function, no-implicit-globals*/
// let statusUpdaterId;

const passTurn = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/pass`, (res) => {
    res = JSON.parse(res);
    if(!res.error && !res.passed){
      showMessage(`Game over`);
      // showSuspicionCards(res.murderCombination);
      currentActivity = ()=>{};
      updateLog();
      clearInterval(statusUpdaterId);
      clearInterval(boardStatusId);
      clearInterval(activityLogId);
      return;
    }
    disablePopup();
    disableRollDice();
    showMessage('');
    getCurrentPlayer();
    currentActivity = getCurrentPlayer;
  });
};

const showWinner = function(name){
  document.querySelector('#activity-box').innerHTML =
  `<div class="popup">${name} has won the game</div>`;
  currentActivity = ()=>{};
};

const showAccusationState = function(state,name){
  if(state){
    showWinner(name);
  }else {
    passTurn();
  }
};

let getCurrentPlayer = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/status`, (res) => {
    res = JSON.parse(res);
    let turn = res.currentPlayer.character.turn;
    if(res.accusing) {
      showAccusationState(res.accusationState,res.currentPlayer.name);
    } else if (playerTurn == turn && !res.moved) {
      showOptionsToPlayer(res);
    } else if(res.suspecting) {
      // showSuspicionCards(res.combination);
      currentActivity = () => getSuspicion(res.currentPlayer.name);
    } else if(res.currentPlayer.inRoom && playerTurn == turn) {
      showPossibleOptions(true);
      currentActivity = () => { };
    }
    removeTurnHighlight();
    document.getElementById(`turn_${turn}`).classList.add('active-player');
    document.getElementById(`turn_${turn}`).style.border = '0px';
  });
};

const showOptionsToPlayer= function(res){
  if (res.canSuspect && res.inRoom) {
    showPossibleOptions(true,true,res.secretPassage);
  }else{
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
    if (suspicion.canBeCancelled && !suspicion.cancelled) {
      if (suspicion.cancellingCards) {
        giveRuleOutOption(suspicion.cancellingCards);
      }
    } else if (suspicion.ruleOutCard) {
      showMessage(`Ruled out by ${
        suspicion.cancelledBy} using ${suspicion.ruleOutCard} card`);
      enablePopup();
      currentActivity = () => { };
      enableAccusation();
    } else if(suspicion.suspector){
      currentActivity = () => { };
      enableAccusation();
    }
  });
};

const giveRuleOutOption = function(cards){
  showMessage('Rule out Suspicion by selecting a card');
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

const suspectOrAccuse = function (suspect) {
  let character = document.querySelector('#character').value;
  let weapon = document.querySelector('#weapon').value;
  if (!suspect) {
    sendAccuseReq(character,weapon);
  } else {
    sendSuspectReq(character,weapon);
  }
  currentActivity = getCurrentPlayer;
};

const getCells = function(startingPoint,endingPoint){
  return Array(endingPoint)
    .fill(startingPoint)
    .map((ele,index)=>index+ele);
};

const highlightValidMoves = function(allValidMoves){
  let cells = getCells(1,86);
  cells.forEach(posId=>{
    if(!allValidMoves.includes(posId)){
      document.getElementById(posId).style.opacity = 0.4;
    }
  });
};

const removeMoveHighlight = function(allValidMoves){
  let cells = getCells(1,86);
  cells.forEach(posId=>{
    if(!allValidMoves.includes(posId)){
      document.getElementById(posId).style.opacity = 1;
    }
  });
};

const rollDice = function () {
  let url = getBaseUrl();
  stopstart();
  setTimeout(() => {
    sendAjaxRequest('get', `${url}/rolldice`, (res) => {
      res = JSON.parse(res);
      stopstart();
      console.log(res);
      highlightValidMoves(res.allValidMoves);
      change(res.value);
      document.getElementById("board").onclick = (event)=>
        validatePosition(event,res.allValidMoves);
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

const validatePosition = function (event,validMoves) {
  let id = event.target.id;
  if (id && (isRoom(id) || isPath(id))) {
    moveToken(id,validMoves);
  }
};

const moveToken = function(id, validMoves=[]){
  let url = getBaseUrl();
  sendAjaxRequest("post", `${url}/move`, (res) => {
    res = JSON.parse(res);
    showMessage(res.error || '');
    if (res.moved) {
      disablePopup();
      disableRollDice();
      document.querySelector('#board').onclick = null;
      currentActivity = getCurrentPlayer;
      showBoardStatus();
      removeMoveHighlight(validMoves);
    }
  }, `{"position":"${id}"}`);
};

const ruleOutSuspicion = function () {
  let val = document.getElementById('cancelsuspicion');
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/ruleout`, (res) => {
    res = JSON.parse(res);
    if (res.success) {
      disableRuleOut();
      currentActivity = getCurrentPlayer;
    }
  }, `{"card":"${val.value}"}`);
};

let currentActivity = getCurrentPlayer;

const startStatusUpdater = function () {
  statusUpdaterId = setInterval(() => {
    currentActivity();
  }, 1000);
};
