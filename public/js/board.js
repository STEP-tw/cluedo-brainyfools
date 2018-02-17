let sendAjaxRequest = function (method, url, cb, data='') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load',() => cb(req.responseText));
  req.send(data);
};

const fillPlayerDetails = function(data){
  let playerDetails = JSON.parse(data);
  let players = Object.keys(playerDetails);
  players.forEach(id=>{
    let player = playerDetails[id];
    document.querySelector('#all-players').innerHTML += `<span>${player.name}</span>`;
  });
}

const getPlayerDetails = function(){
  let url = window.location.pathname;
  sendAjaxRequest('get',`${url}/data`,fillPlayerDetails);
}

window.onload = function () {
  sendAjaxRequest('get','/svg/board.svg',(res)=>{
    document.querySelector('#board').innerHTML = res;
    getPlayerDetails();
  });
};
