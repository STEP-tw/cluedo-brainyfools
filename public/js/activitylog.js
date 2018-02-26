let lastActivityTime = 0;

const updateLog = function(){
  let url = getBaseUrl();
  let logDiv = document.getElementById('activity-log');
  sendAjaxRequest('get',`${url}/log/${lastActivityTime}`,(res)=>{
    let data = JSON.parse(res);
    let allActivitiesTime = Object.keys(data);
    allActivitiesTime = allActivitiesTime.sort((t1,t2)=>+t1>+t2);
    allActivitiesTime.forEach((time)=>{
      let activity = data[time];
      lastActivityTime = time;
      time = new Date(+time);
      logDiv.innerHTML += `<div>
        <span class='time'> ${time.toLocaleTimeString()} </span>
        <span class='activity'> ${activity}  </span>
      </div>`;
    });
  });
};

const startActivityUpdater = function(){
  setInterval(updateLog,1000);
};

window.addEventListener('load',startActivityUpdater);
