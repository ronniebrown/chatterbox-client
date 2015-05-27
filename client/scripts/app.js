var App = function() {
  this.username = window.location.search.slice(10);
  this.friends = {};
  this.rooms = {};
  this.currentRoom = 'main';
  this.message = {
    'username': '',
    'text': 'hello',
    'roomname': 'Default' 
  };
};

App.prototype.template = function(user, msg, room){
  var userSpan = '<a href="#" class="user ' + user + '">' + user + '</a><br />';
  var msgSpan = '<span class="' + msg + '">' + msg + '</span><br />';
  var roomSpan = '<a href="#" class="' + room + '">' + room + '</a>';
  var message = $('<p>User: ' + userSpan + 'Message: ' + msgSpan + 'Room: ' + roomSpan + '</p>');
  return message;
};

// escape special characters to prevent XSS
App.prototype.escapeChars = function(str){
  // var symbols = {
  //   '&': '&amp;',
  //   '<': '&lt;',
  //   '>': '&gt;',
  //   '"': '&quot;',
  //   '/': '&#x2F;'
  // };
  return str.replace(/[.^$*+?()[{\\|\]-]/g, '\\$&');
};

App.prototype.showRooms = function(rooms){
  $('#rooms').empty();
  for (var key in rooms) {
    $('#rooms').append('<option value="' + key + '">' + key + '</option>');
  }
};

App.prototype.letsBeFriends = function(friend) {
  this.friends[friend] = friend;
  $('#friendsList a').remove();
  for (var key in this.friends) {
    var newFriend = $('<li><a href="#" class="' + key + '">' + key + '</a></li>');
    $('#friendsList').append(newFriend);
  }
};

App.prototype.clear = function() {
  $('.chat').empty();
}

App.prototype.onFetch = function(resultData) {
  $('.chat p').remove();
  var that = this;
  var rooms = that.rooms;
  resultData = _.sortBy(resultData, 'createdAt');
  _.each(resultData, function(item) {
    var room = $('<span>' + item.roomname + '</span>').text();
    room = that.escapeChars(room);
    rooms[room] = room;
    var text = $('<span>' + item.text + '</span>').text();
    text = that.escapeChars(text);
    var user = $('<span>' + item.username + '</span>').text();
    user = that.escapeChars(user);
    var message = that.template(user, text, room);
    $('.chat').prepend(message);
  });
  that.showRooms(rooms);
};

App.prototype.fetch = function(){
  var that = this;
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'GET',
    contentType: 'application/json',
    // data: JSON.stringify(message),
    success: function(data) {
      console.log('chatterbox: Message got');
      that.onFetch(data.results);
    },
    error: function (data) {
      console.error('chatterbox: Failed to get message');
    }
  });
};

App.prototype.send = function(message){
  $.ajax({
    url: 'https://api.parse.com/1/classes/chatterbox',
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message');
    }
  });
};

$(document).ready(function() {  
  var chat = new App();
  
  // chat.showRooms();
  chat.fetch();

  $('#send').on('click', function(e){
    e.preventDefault();
    var message = {
      'username': chat.username,
      'text': $('.textbox').val(),
      'roomname': chat.currentRoom
    };
    chat.send(message);
    $('#send').val('');
    // return false;
  });

  $('#makeRoom').on('submit', function(e) {
    e.preventDefault();
    var newRoom = $('#roomInput').val();
    var option = '<option value="' + newRoom + '">' + newRoom + '</option>';
    console.log('room:' + rooms); // room:[object HTMLSelectElement]
    chat.currentRoom = option;
    $('#roomInput').val('');
  });

  $('body').on('click', '.user', function(e) {
    e.preventDefault();
    chat.letsBeFriends($(this).html());
    console.log('new friend made');
  });

  setInterval(function() {
    chat.fetch();
  }, 500);
  
});