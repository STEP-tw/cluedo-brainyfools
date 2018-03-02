let sendAjaxRequest = function (method, url, cb, data='') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load',() => cb(req.responseText));
  req.send(data);
};


let showColor = function(color) {
  let overlay = document.querySelector(".overlay");
  let colorHolder = document.getElementById('color');
  colorHolder.style.backgroundColor = color;
  overlay.classList.remove('hide');
  overlay.classList.add('show');
};

let updateSeconds = function() {
  let secondBlock = document.getElementById('sec');
  let seconds = +(secondBlock.innerText);
  --seconds;
  secondBlock.innerHTML = seconds;
};

let showTimer = function(link){
  let timer = document.getElementById('Timer');
  timer.style.visibility = 'visible';
  setInterval(updateSeconds, 2000);
  setTimeout(()=>{
    window.location = link;
  }, 3000);
};

let showOverlay = function(link,color){
  showColor(color);
  showTimer(link);
};

window.onload = setInterval(function () {
  let location = window.location.pathname;
  sendAjaxRequest('get',`numOfPlayers`,(res)=>{
    res = JSON.parse(res);
    if(res.start) {
      showOverlay(res.link,res.color);
    }
    document.getElementById('players-joined').innerHTML = res.count;
  });
},1000);
