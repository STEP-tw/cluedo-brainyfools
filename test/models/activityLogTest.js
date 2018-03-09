const chai = require('chai');
const assert = chai.assert;
const ActivityLog = require('../../src/models/activityLog.js');

let getTime = function(start){
  return ()=>start++;
};

describe('ActivityLog', function(){
  let activityLog;
  beforeEach(function(){
    activityLog = new ActivityLog(getTime(1));
  });

  describe('addActivity', function(){
    it('should add the given activity to log', function(){
      activityLog.addActivity('activity 1');
      assert.deepEqual(activityLog.activities[0],{time:1,activity:'activity 1', color: ''});
      activityLog.addActivity('activity 2');
      assert.deepEqual(activityLog.activities[1],{time:2,activity:'activity 2',color: ''});
    });
  });

  describe('getActivitiesAfter', function(){
    it('should return all activities after given time', function(){
      activityLog.addActivity('activity 1');
      activityLog.addActivity('activity 2');
      activityLog.addActivity('activity 3');
      activityLog.addActivity('activity 4');
      activityLog.addActivity('activity 5');
      let expected = [
        {time:3,activity:'activity 3', color: ''},
        {time:4,activity:'activity 4', color: ''},
        {time:5,activity:'activity 5', color: ''}
      ];
      assert.deepEqual(activityLog.getActivitiesAfter(2),expected);
    });
  });

});
