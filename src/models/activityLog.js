class ActivityLog{
  constructor(getTime){
    this.getTime = getTime;
    this.activities = [];
  }

  addActivity(activity){
    let time = this.getTime();
    this.activities.push({time,activity});
    return time;
  }

  getActivitiesAfter(index){
    return this.activities.slice(index);
  }
}

module.exports = ActivityLog;
