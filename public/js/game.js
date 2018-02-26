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
    if (playerTurn == turn && !res.moved) {
      if (res.canSuspect && res.inRoom) {
        enableSuspicion(true, true);
      }else{
        enableRollDice();
      }
      currentActivity = () => { };
    } else if (res.suspecting) {
      showSuspicionCards(res.combination);
      currentActivity = () => getSuspicion(res.currentPlayer.name);
    } else if (res.currentPlayer.inRoom && playerTurn == turn) {
      enableSuspicion(true);
      currentActivity = () => { };
    }
    removeTurnHighlight();
    document.getElementById(`turn_${turn}`).style['background-color'] = 'gray';
  });
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
        showMessage('Rule out Suspicion by selecting a card');
        currentActivity = () => { };
        enableRuleOut(suspicion.cancellingCards);
      }
    } else if (suspicion.ruleOutCard) {
      showMessage(`Ruled out by ${
        suspicion.cancelledBy} using ${suspicion.ruleOutCard} card`);
      currentActivity = () => { };
      enableAccusation();
    } else {
      showCanceller(suspicion.cancelledBy);
      disableCards();
    }
  });
};

const showCanceller = function(canceller){
  if (canceller) {
    showMessage(`Ruled out by ${canceller}`);
  } else {
    showMessage(`No one ruled out`);
  }
};

const suspectOrAccuse = function () {
  let url = getBaseUrl();
  let suspicion = document.getElementById('suspect').checked;
  let accusation = document.getElementById('accuse').checked;
  let character = document.getElementById('character').value;
  let weapon = document.getElementById('weapon').value;
  if (suspicion) {
    sendAjaxRequest('post', `${url}/suspect`, res => {
      updatePos(character, res);
      disablePopup();
    }, `{"character":"${character}","weapon":"${weapon}"}`);
  } else if (accusation) {
    sendAjaxRequest('post', `${url}/accuse`, res => {
      res = JSON.parse(res);
    }, `{"character":"${character}","weapon":"${weapon}"}`);
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
        document.getElementById('board').onclick = null;
        currentActivity = getCurrentPlayer;
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
