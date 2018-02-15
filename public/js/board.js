let sendAjaxRequest = function (method, url, cb) {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load',() => cb(req.responseText));
  req.send();
};

window.onload = function () {
  sendAjaxRequest('get','/svg/board.svg',(res)=>{
    document.querySelector('#board').innerHTML = res;
  });
};
