/* eslint-disable no-empty-function */
const passTurn = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/pass`, () => {
    disablePopup();
    disableCards();
    showMessage('');
    set = false;
    ruleOutEnabled = false;
    accusationEnabled = false;
    getCurrentPlayer();
    currentActivity = getCurrentPlayer;
  });
};

let getCurrentPlayer = function () {
  let url = getBaseUrl();
  sendAjaxRequest('get', `${url}/status`, (res) => {
    res = JSON.parse(res);
    let turn = res.currentPlayer.character.turn;
    if(res.accusationState){
      showMessage(`${res.currentPlayer.name} won`);
      disablePopup();
      return;
    }
    if (playerTurn == turn && !res.moved) {
      showOptionsToPlayer(res);
    } else if(res.accusing) {
      showSuspicionCards(res.accuseCombination);
      showMessage(`${res.currentPlayer.name} has raised an accusation`);
      currentActivity = getCurrentPlayer;
    } else if(res.suspecting) {
      showSuspicionCards(res.combination);
      currentActivity = () => getSuspicion(res.currentPlayer.name);
    } else if(res.currentPlayer.inRoom && playerTurn == turn) {
      enableSuspicion(true);
      currentActivity = () => { };
    }
    removeTurnHighlight();
    document.getElementById(`turn_${turn}`).style['background-color'] = 'gray';
  });
};

const showOptionsToPlayer= function(res){
  if (res.canSuspect && res.inRoom) {
    enableSuspicion(true, true);
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
    if (!suspicion.cancelled) {
      showMessage(`${name} has raised a suspicion`);
    }
    if (suspicion.canBeCancelled && !suspicion.cancelled) {
      if (suspicion.cancellingCards) {
        giveRuleOutOption(suspicion.cancellingCards);
      }
    } else if (suspicion.ruleOutCard) {
      showMessage(`Ruled out by ${
        suspicion.cancelledBy} using ${suspicion.ruleOutCard} card`);
      currentActivity = () => { };
      enableAccusation();
    } else if(suspicion.suspector){
      currentActivity = () => { };
      enableAccusation();
      disableCards();
    } else {
      showMessage(``);
      disableCards();
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
    let accuser = res.accusser;
    updatePos(character, accusser);
    disablePopup();
  }, `{"character":"${character}","weapon":"${weapon}"}`);
};

const sendSuspectReq = function(character,weapon){
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/suspect`, res => {
    let suspector = JSON.parse(res).suspector;
    updatePos(character, suspector);
    disablePopup();
  }, `{"character":"${character}","weapon":"${weapon}"}`);
};

const suspectOrAccuse = function () {
  let accusation = document.querySelector('#accuse').checked;
  let suspicion = document.querySelector('#suspect');
  if(suspicion) {
    suspicion = suspicion.checked;
  }
  let character = document.querySelector('#character').value;
  let weapon = document.querySelector('#weapon').value;
  if (accusation) {
    sendAccuseReq(character,weapon);
  } else if (suspicion) {
    sendSuspectReq(character,weapon);
  }
  currentActivity = getCurrentPlayer;
};


const rollDice = function () {
  let url = getBaseUrl();
  stopstart();
  setTimeout(() => {
    sendAjaxRequest('get', `${url}/rolldice`, (res) => {
      let dice = JSON.parse(res);
      stopstart();
      change(dice.value);
      showMessage('Select a position');
      document.getElementById("board").onclick = validatePosition;
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

const validatePosition = function (event) {
  let url = getBaseUrl();
  let id = event.target.id;
  id = id.replace('room_', '');
  if (id && (isRoom(id) || isPath(id))) {
    sendAjaxRequest("post", `${url}/move`, (res) => {
      res = JSON.parse(res);
      showMessage(res.error || '');
      if (res.moved) {
        disablePopup();
        showMessage('');
        document.querySelector('#board').onclick = null;
        currentActivity = getCurrentPlayer;
        showBoardStatus();
      }
    }, `{"position":"${id}"}`);
  }
};

const ruleOutSuspicion = function () {
  let val = document.getElementById('cancelsuspicion');
  let url = getBaseUrl();
  sendAjaxRequest('post', `${url}/ruleout`, (res) => {
    res = JSON.parse(res);
    if (res.success) {
      disableRuleOut();
      showMessage('Ruled out');
      currentActivity = getCurrentPlayer;
    }
  }, `{"card":"${val.value}"}`);
};

let currentActivity = getCurrentPlayer;

const startStatusUpdater = function () {
  setInterval(() => {
    currentActivity();
  }, 1000);
};
