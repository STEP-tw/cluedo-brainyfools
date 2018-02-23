let lastActivityTime = undefined;

const updateLog = function(){
  updateScroll();
}

let scrolled = false;
const startActivityUpdater = function(){
  document.getElementById('activity-log').onscroll= function(){
    scrolled=true;
  };
  setInterval(updateLog,1000);
}

const updateScroll = function(){
  if(!scrolled){
    let element = document.getElementById("activity-log");
    element.scrollTop = element.scrollHeight;
  }
}

window.addEventListener('load',startActivityUpdater);
