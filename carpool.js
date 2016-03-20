RowersList = new Mongo.Collection("rowers");
AttendanceList = new Mongo.Collection("attendance");
//each rower's buttons should update every day. on march 17 alex meredith was green red yellow green red yellow and kevin yue was yellow red green
//yellow red green
//updateAttendance();

function updateMon(){
  RowersList.find().forEach(function(obj){
    var userId = obj._id;
    var newAtMon = obj.atTues;
    var newAtTues = obj.atWed;
    var newAtWed = obj.atThurs;
    var newAtThurs = obj.atFri;
    var newAtFri = obj.atSat;
    var newAtSat ='gray';
    RowersList.update(userId, {$set: {
      atMon: newAtMon, 
      atTues: newAtTues,
      atWed: newAtWed,
      atThurs: newAtThurs,
      atFri: newAtFri,
      atSat: newAtSat
    }});
  });
}

function getTodaysDateInMs(){
  var today = new Date();
  var n = today.getTime();
  return Math.floor((n-25200000)/86400000);
}
function getTodaysDate(){
  var today = new Date();
  var dOfW = today.getDay();
  var month = today.getMonth();
  var dOfM = today.getDate();
  var leap = today.getFullYear()%4;
  var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  if(dOfW!==0){
    return "".concat(daysOfWeek[dOfW]).concat(" ").concat(months[month]).concat(" ").concat(dOfM);
  } else {
    dOfW++;
    if(dOfW > 6){
      dOfW = 0;
    }
    dOfM++;
    if(dOfM > 31||(month===3||month===5||month===8||month===10)&&dOfM>30||(month===1&&dOfM>28)&&leap!==0||(month===1&&leap===0&&dOfM>29)) {
      dOfM = 1;
      month++;
      if(month > 11) {
        month = 0;
        leap++;
      }
    }
    return " ".concat(daysOfWeek[dOfW]).concat(" ").concat(months[month]).concat(" ").concat(dOfM);
  } 
}

if (Meteor.isClient) {
  Template.login.helpers({
    'notLoggedIn': function(){
      return !Session.get("loggedIn");
    },
    'rower': function(){
      return RowersList.find();
    },
    'exists': function(){
      return !Session.get("addNewUser");
    },
    'validName': function(name){
      return true;
    },
    'alreadyExists': function(){
      return Session.get("alreadyExists");
    },
    'incorrectPassword': function(){
      return Session.get("incorrectPassword");
    },
    'date': function(){
      var today = new Date();
      var dOfW = today.getDay();
      var month = today.getMonth();
      var dOfM = today.getDate();
      var leap = today.getFullYear()%4;
      var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      var arrToReturn = ["a", "b", "c", "d", "e", "f"];
      var i = 0;
      while(i<6){
        if(dOfW!==0){
          i++;
          arrToReturn[i-1] = " ".concat(daysOfWeek[dOfW]).concat(" ").concat(months[month]).concat(" ").concat(dOfM);
        }
        dOfW++;
        if(dOfW > 6){
          dOfW = 0;
        }
        dOfM++;
        if(dOfM > 31||(month===3||month===5||month===8||month===10)&&dOfM>30||(month===1&&dOfM>28)&&leap!==0||(month===1&&leap===0&&dOfM>29)) {
          dOfM = 1;
          month++;
          if(month > 11){
            month = 0;
            leap++;
          }
        }
      }
      return arrToReturn;
    }
  })
  Template.login.events({
    'submit form': function(event){
      event.preventDefault();
      var passwordInput = document.getElementById('password').value;
      var todaysDate = getTodaysDateInMs();
      if(Session.get("addNewUser")) {
        var firstnameInput = document.getElementById('firstname').value.trim();
        var lastnameInput = document.getElementById('lastname').value.trim();
       // var passwordInput = document.getElementById('password').value.trim();
        var usernameInput = firstnameInput.concat(" ").concat(lastnameInput);
        var userAlreadyExists = RowersList.find({username: usernameInput}).count();
        var isValid = false;
        var nameRe = /^[a-zA-Z]+([a-zA-Z '-]+)*$/;
        var pwordRe = /^[a-zA-Z0-9_]+( +[a-zA-Z0-9_]+)*$/;
        if(usernameInput.match(nameRe)&&passwordInput.match(pwordRe)) {
          isValid = true;
        }
        if(userAlreadyExists === 0&&isValid) {
          RowersList.insert({
            username: usernameInput,
            password: passwordInput,
            mostRecentlyAccessed: todaysDate,
            captain: false,
            atRecord: 0,
            atMon: 'gray',
            atTues: 'gray',
            atWed: 'gray',
            atThurs: 'gray',
            atFri: 'gray',
            atSat: 'gray'
          });
          Session.set("loggedIn", true);
          Session.set("incorrectPassword", false);
          Session.set("currentUser", usernameInput);
        } else if(userAlreadyExists > 0) {
          Session.set("alreadyExists", true);
        }
      } else {
        var usernameInput = document.getElementById('pickUser').value;
        var users = RowersList.find({username: usernameInput}).fetch();
        var dbPassword = users[0].password;
        var userId = users[0]._id;
        var whenAccessed = users[0].mostRecentlyAccessed;
        console.log(userId);
        console.log(passwordInput);
        console.log(users[0].password);
        if(dbPassword===passwordInput) {
          Session.set("incorrectPassword", false);
          Session.set("loggedIn", true);
          Session.set("currentUser", usernameInput);
          for(i = 0; i < (todaysDate-whenAccessed); i++){
            updateMon();
          }
          RowersList.update(userId, {$set: {mostRecentlyAccessed: todaysDate}});
        } else {
          Session.set("incorrectPassword", true);
        }
      }
    },
    'click .attendance': function(event){
      var thisId = event.target.id;
      var currentColor = document.getElementById(thisId).style.background;
      var thisIdLength = thisId.length;
      var actualId = thisId.substr(1, (thisIdLength-1));
      var users = RowersList.find({username: Session.get("currentUser")}).fetch();
      if(users[0]._id==actualId||users[0].captain == true){
        var dayOfWeek = thisId.substr(0,1);
        console.log(currentColor);
        if(currentColor=='green') {
          document.getElementById(thisId).style.background = 'yellow';
          if(dayOfWeek==1)
            RowersList.update(actualId, {$set: {atMon: 'yellow'}});
          else if(dayOfWeek==2)
            RowersList.update(actualId, {$set: {atTues: 'yellow'}});
          else if(dayOfWeek==3)
            RowersList.update(actualId, {$set: {atWed: 'yellow'}});
          else if(dayOfWeek==4)
            RowersList.update(actualId, {$set: {atThurs: 'yellow'}});
          else if(dayOfWeek==5)
            RowersList.update(actualId, {$set: {atFri: 'yellow'}});
          else if(dayOfWeek==6)
            RowersList.update(actualId, {$set: {atSat: 'yellow'}});
        } else if(currentColor=='red') {
          document.getElementById(thisId).style.background = 'green';
          if(dayOfWeek==1)
            RowersList.update(actualId, {$set: {atMon: 'green'}});
          else if(dayOfWeek==2)
            RowersList.update(actualId, {$set: {atTues: 'green'}});
          else if(dayOfWeek==3)
            RowersList.update(actualId, {$set: {atWed: 'green'}});
          else if(dayOfWeek==4)
            RowersList.update(actualId, {$set: {atThurs: 'green'}});
          else if(dayOfWeek==5)
            RowersList.update(actualId, {$set: {atFri: 'green'}});
          else if(dayOfWeek==6)
            RowersList.update(actualId, {$set: {atSat: 'green'}});
        } else {
          document.getElementById(thisId).style.background = 'red';
          if(dayOfWeek==1)
            RowersList.update(actualId, {$set: {atMon: 'red'}});
          else if(dayOfWeek==2)
            RowersList.update(actualId, {$set: {atTues: 'red'}});
          else if(dayOfWeek==3)
            RowersList.update(actualId, {$set: {atWed: 'red'}});
          else if(dayOfWeek==4)
            RowersList.update(actualId, {$set: {atThurs: 'red'}});
          else if(dayOfWeek==5)
            RowersList.update(actualId, {$set: {atFri: 'red'}});
          else if(dayOfWeek==6)
            RowersList.update(actualId, {$set: {atSat: 'red'}});
        }
      }
    },
    'click .addNew': function(){
      Session.set("addNewUser", true);
    },
    'click .back': function(){
      Session.set("addNewUser", false);
    }
  })
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });

}


