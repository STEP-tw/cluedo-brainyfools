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
  enablePopup();
  currentActivity = ()=>{};
  updateLog();
  clearInterval(statusUpdaterId);
  clearInterval(boardStatusId);
  clearInterval(activityLogId);
};

const showCompletionMsg = function(msg){
  document.querySelector('.close').innerHTML = `&times;`;
  document.querySelector('#message-box').innerHTML =
  `<div class="popup">${msg}</div>`;
};

const showGameDraw = function(){
  showCompletionMsg('GAME HAS DRAWN');
  endRequests();
};

const showWinner = function(name){
  showCompletionMsg(`${name.toUpperCase()} HAS WON THE GAME`);
  endRequests();
};

const showAccusationState = function(playerState,name,gameState){
  let methods = {'win' : showWinner,'draw' : showGameDraw,'running' : passTurn};
  if(playerState){
    // showDeactivated(name);
  }
  methods[gameState](name);
};

let getCurrentPlayer = function () {
  disableWeapon();
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/status`, (res) => {
    res = JSON.parse(res);
    showMessage('');
    let turn = res.currentPlayer.character.turn;
    if(res.accusing) {
      showAccusationState(res.accusationState,res.currentPlayer.name
        ,res.gameState);
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
  }else if(res.inRoom && res.secretPassage){
    showPossibleOptions(false,true,res.secretPassage);
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
    let roomName = suspicion.combination._room._name;
    let weaponName = suspicion.combination._weapon._name;
    showWeapon(roomName,weaponName);
    showMessage(`${suspicion.currentPlayer} has raised a suspicion`);
    if (suspicion.canBeCancelled && !suspicion.cancelled) {
      if (suspicion.cancellingCards) {
        giveRuleOutOption(suspicion.cancellingCards);
      }
    } else if (suspicion.ruleOutCard) {
      enablePopup();
      showMessage(`${suspicion.cancelledBy}
        has ruled out your suspicion using ${suspicion.ruleOutCard}`);
      currentActivity = () => { };
      showPossibleOptions();
    } else if(suspicion.suspector){
      currentActivity = () => { };
      showPossibleOptions();
    } else if(suspicion.cancelledBy){
      showMessage(`${suspicion.cancelledBy} has ruled
        out ${suspicion.currentPlayer}\'s suspicion`);
    } else {
      showMessage(`No one ruled out ${suspicion.currentPlayer}\'s suspicion`);
    }
  });
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

const getMurderCombination = function(){
  let url = getBaseUrl();
  sendAjaxRequest('get',`${url}/murderCombination`,(res) =>{
    res = JSON.parse(res);
    document.querySelector('#activity-box').innerHTML =
    `<div>
    <div class='murderCombination'>Murder combination</div>
    <div class='combination'>
    <span><img id='character-card'></img></span>
    <span><img id='weapon-card'></img></span>
    <span><img id='room-card'></img></span>
    </div>
    </div>`;
    showSuspicionCards(res);
  });
};

let currentActivity = getCurrentPlayer;

const startStatusUpdater = function () {
  statusUpdaterId = setInterval(() => {
    currentActivity();
  }, 1000);
};
