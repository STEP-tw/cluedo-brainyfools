const chai = require('chai');
const assert = chai.assert;
const ActivityLog = require('../../src/models/activityLog.js');

let getTime = function(start){
  return ()=>start++;
}

describe('ActivityLog', function(){
  let activityLog;
  beforeEach(function(){
    activityLog = new ActivityLog(getTime(1));
  });

  describe('addActivity', function(){
    it('should add the given activity to log', function(){
      activityLog.addActivity('activity 1');
      assert.equal(activityLog.activities[1],'activity 1');
      activityLog.addActivity('activity 2');
      assert.equal(activityLog.activities[2],'activity 2');
    });
  });
  describe('getActivity', function(){
    it('should return activity of given time', function(){
      activityLog.addActivity('activity 1');
      activityLog.addActivity('activity 2');
      assert.equal(activityLog.getActivity(2),'activity 2');
    });
  });
  describe('getActivitiesAfter', function(){
    it('should return all activities after given time', function(){
      activityLog.addActivity('activity 1');
      activityLog.addActivity('activity 2');
      activityLog.addActivity('activity 3');
      activityLog.addActivity('activity 4');
      activityLog.addActivity('activity 5');
      let expected = {
        '3': 'activity 3',
        '4': 'activity 4',
        '5': 'activity 5'
      };
      assert.deepEqual(activityLog.getActivitesAfter(2),expected);
    });
  });

});
