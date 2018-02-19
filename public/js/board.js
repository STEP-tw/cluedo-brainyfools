let sendAjaxRequest = function (method, url, cb, data = '') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load', () => cb(req.responseText));
  req.send(data);
};

const setCurrentPlayer = function (player) {
  let pd = document.querySelector('#current-player');
  document.querySelector('#player-token')
    .setAttribute('fill',player.character.color);
  pd.innerHTML = `<span>${player.name}</span>
    <span>${player.character.name}</span>`;
};

const setOtherPlayer = function (player) {
  document.querySelector('#all-players').innerHTML +=
    `<div style="color:${player.character.color}">
     <span>${player.name}</span>
     <span>${player.character.name}</span></div>`;
};

const fillPlayerDetails = function (data) {
  let playerDetails = JSON.parse(data);
  let players = Object.keys(playerDetails);
  let playerId = getCookie('playerId');
  players.forEach(id => {
    let player = playerDetails[id];
    playerId == id && setCurrentPlayer(player);
    setOtherPlayer(player);
  });
};

const getPlayerDetails = function () {
  let url = window.location.pathname.replace(/\/$/,'');
  sendAjaxRequest('get', `${url}/data`, fillPlayerDetails);
};

window.onload = function () {
  sendAjaxRequest('get', '/svg/board.svg', (res) => {
    document.querySelector('#board').innerHTML = res;
    getPlayerDetails();
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
