let sendAjaxRequest = function (method, url, cb, data='') {
  let req = new XMLHttpRequest();
  req.open(method, url);
  req.addEventListener('load',() => cb(req.responseText));
  req.send(data);
};

window.onload = function () {
  sendAjaxRequest('get','/svg/board.svg',(res)=>{
    document.querySelector('#board').innerHTML = res;
  });
};
