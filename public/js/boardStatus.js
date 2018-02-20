const updateTokenPos = function(positions){
  positions.forEach((char)=>{
    let name = char.name;
    if(!char.start){
      let id = name.split(' ').pop().toLowerCase();
      updateCharPosition(id, char.position);
    }
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
  let path = getBaseUrl();
  sendAjaxRequest('get',`${path}/boardstatus`,(res)=>{
    let charPositions = JSON.parse(res);
    updateTokenPos(charPositions);
  });
};

const isRoom=function(id){
  let className=document.getElementById(`${id}`).className;
  return className=="room";
}

const isPath=function(id){
  return Number.isInteger(+id);
}

const validatePosition = function(event) {
  let url = getBaseUrl();
  let id = event.target.id;
  if(isRoom(id)||isPath(id)){
    sendAjaxRequest("post",`${url}/move`,(res)=>{
      res = JSON.parse(res);
    },`position=${id}`)
  }
}

const enableRollDice = function(){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
    <button class="rolldice" onclick="rollDice()">Roll Dice</button>
    </div>`;
};

const rollDice = function(){
  let url= getBaseUrl();
  sendAjaxRequest('get',`${url}/rolldice`,(res)=>{
    let dice = JSON.parse(res);
    document.querySelector('#message-box')
      .innerHTML = `<div>You got ${dice.error || dice.value}</div>`;
  });
  document.getElementById("board").onclick = validatePosition;
};

const getBaseUrl = function(){
  return window.location.pathname.replace(/\/$/,'');
};

window.addEventListener('load',()=>{
  setInterval(showBoardStatus,3000);
});
