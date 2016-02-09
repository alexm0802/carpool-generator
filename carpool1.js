if (Meteor.isClient) {
  Template.rowers.helpers({
    'attendance': function(){
        return RowersList.find()
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
 RowersList = new Mongo.Collection('rowers');
