let lastActivityTime = 0;

const updateLog = function(){
  let url = getBaseUrl();
  let logDiv = document.getElementById('activity-log');
  sendAjaxRequest('get',`${url}/log/${lastActivityTime}`,(res)=>{
    let data = JSON.parse(res);
    let allActivitiesTime = data.sort((a1,a2)=>+a1.time> +a2.time);
    allActivitiesTime.forEach((activity)=>{
      lastActivityTime++;
      time = new Date(+activity.time);
      logDiv.innerHTML += `<div>
        <span class='time'> ${time.toLocaleTimeString()} </span>
        <span class='activity'> ${activity.activity}  </span>
      </div>`;
    });
  });
};

const startActivityUpdater = function(){
  setInterval(updateLog,1000);
};

window.addEventListener('load',startActivityUpdater);
