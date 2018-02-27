class ActivityLog{
  constructor(getTime){
    this.getTime = getTime;
    this.activities = {};
  }

  addActivity(activity){
    let time = this.getTime();
    this.activities[time] = activity;
    return time;
  }

  getActivity(time){
    return this.activities[time];
  }

  getActivitiesAfter(time){
    let activityTimes = Object.keys(this.activities);
    let recentActivities = activityTimes.filter(activityTime=>{
      return +activityTime > +time;
    });
    return recentActivities.reduce((activities, activityTime)=>{
      activities[activityTime] = this.getActivity(activityTime);
      return activities;
    },{});
  }
}

module.exports = ActivityLog;
