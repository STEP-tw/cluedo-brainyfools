const updateTokenPos = function(positions){
  positions.forEach((char)=>{
    let name = char.name;
    let id = name.split(' ').pop().toLowerCase();
    updateCharPosition(id, char.position);
  });
};

const updateCharPosition = function(id,pos){
  let posElement = document.getElementById(`${pos}`);
  let posX = posElement.getAttribute('x');
  let posY = posElement.getAttribute('y');
  document.getElementById(`${id}`).setAttribute('cx',+posX + 15);
  document.getElementById(`${id}`).setAttribute('cy',+posY + 15);
};

const showBoardStatus = function() {
  let path = window.location.pathname.replace(/\/$/,'');
  sendAjaxRequest('get',`${path}/boardstatus`,(res)=>{
    console.log(res);
    let charPositions = JSON.parse(res);
    updateTokenPos(charPositions);
  });
};

window.addEventListener('load',()=>{
  setInterval(showBoardStatus,3000);
});
