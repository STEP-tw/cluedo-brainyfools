class ActivityLog{
  constructor(getTime){
    this.getTime = getTime;
    this.activities = [];
  }

  addActivity(activity,colour = ''){
    let color = colour ;
    let time = this.getTime();
    this.activities.push({time,activity,color});
    return time;
  }

  getActivitiesAfter(time){
    return this.activities.filter(activity=> +activity.time > +time);
  }
}

module.exports = ActivityLog;
