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
  let boardElement=document.getElementById(`${id}`);
  let className=boardElement && boardElement.className;
  return className=="room";
};

const isPath=function(id){
  return Number.isInteger(+id);
};

const validatePosition = function(event) {
  let url = getBaseUrl();
  let id = event.target.id;
  if(id && (isRoom(id)||isPath(id))){
    sendAjaxRequest("post",`${url}/move`,(res)=>{
      res = JSON.parse(res);
      disableRollDice();
      showMessage(res.error || '');
      if(res.moved) {
        document.getElementById('board').onclick=null;
      }
      showBoardStatus();
    },`{"position":"${id}"}`);
  }
};

const enableRollDice = function(){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
    <button class="rolldice" onclick="rollDice()">Roll Dice</button>
    </div>`;
};

const enableSuspicion = function(){
  document.querySelector('#activity-box').innerHTML = `<div class="popup">
    <div>
      <div>
        <label for='character'>Character</label>
        <select name="character" id="character">
          <option value="Scarlett">Miss Scarlett</option>
          <option value="Mustard">Col. Mustard</option>
          <option value="Orchid">Dr. Orchid</option>
          <option value="Green">Rev. Green</option>
          <option value="Peacock">Mrs. Peacock</option>
          <option value="Plum">Prof. Plum</option>
        </select>
      </div>
      <div>
        <label for='weapon'>Weapon</label>
        <select name="weapon" id="weapon">
          <option value="Rope">Rope</option>
          <option value="Dagger">Dagger</option>
          <option value="Wrench">Wrench</option>
          <option value="Revolver">Revolver</option>
          <option value="Candlestick">Candlestick</option>
          <option value="Leadpipe">Lead Pipe</option>
        </select>
      </div>
    </div>
    <div>
      <input type="radio" name="action" value="Accuse"/><label>Suspect</label>
      <input type="radio" name="action" value="Pass"/><label>Pass</label>
    </div>
    <div class="confirm">
      <button>Confirm</button>
    </div>
  </div>`;
};

const disableRollDice = function () {
  document.querySelector('#activity-box').innerHTML = '';
};

const rollDice = function(){
  let url= getBaseUrl();
  sendAjaxRequest('get',`${url}/rolldice`,(res)=>{
    let dice = JSON.parse(res);
    showMessage(`You got ${dice.error || dice.value}`);
    document.getElementById("board").onclick = validatePosition;
  });
};

const showMessage = function(message){
  document.querySelector('#message-box')
    .innerHTML = `<div>${message}</div>`;
};

const getBaseUrl = function(){
  return window.location.pathname.replace(/\/$/,'');
};

window.addEventListener('load',()=>{
  setInterval(showBoardStatus,3000);
});
