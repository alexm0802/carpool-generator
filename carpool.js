RowersList = new Mongo.Collection("rowers");
if (Meteor.isClient) {
  Template.login.helpers({
    'notLoggedIn': function(){
      return !Session.get("loggedIn");
    }
  })
  Template.login.events({
    'click .login': function(){
      var firstnameInput = document.getElementById('firstname').value;
      var lastnameInput = document.getElementById('lastname').value;
      var userAlreadyExists = RowersList.find({firstname: firstnameInput, lastname: lastnameInput}).count();
      console.log(userAlreadyExists);
      if(userAlreadyExists === 0) {
        RowersList.insert({
          firstname: firstnameInput,
          lastname: lastnameInput,
          password: document.getElementById('password').value
        });
      }
      console.log(RowersList.find({firstname: firstnameInput, lastname: lastnameInput}).fetch());
      Session.set("loggedIn", true);
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
