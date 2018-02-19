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
    <span>${player.character.name}</span>`
}

const setOtherPlayer = function (player) {
  document.querySelector('#all-players').innerHTML +=
    `<div style="color:${player.character.color}">
     <span>${player.name}</span> 
     <span>${player.character.name}</span></div>`;
}

const fillPlayerDetails = function (data) {
  let playerDetails = JSON.parse(data);
  let players = Object.keys(playerDetails);
  let playerId = getCookie('playerId');
  players.forEach(id => {
    let player = playerDetails[id];
    playerId == id ? setCurrentPlayer(player) : setOtherPlayer(player);
  });
};

const getPlayerDetails = function () {
  let url = window.location.pathname;
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
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
