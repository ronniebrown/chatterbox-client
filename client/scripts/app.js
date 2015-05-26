var App = function() {
  this.username = window.location.search.slice(10);
  this.friends = {};
  this.message = {
    'username': '',
    'text': 'hello',
    'roomname': '' 
  };
};

App.prototype.template = function(user, msg, room){
  var userSpan = '<a href="#" class="' + user + '">' + user + '</a><br />';
  var msgSpan = '<span class="' + msg + '">' + msg + '</span><br />';
  var roomSpan = '<span class="' + room + '">' + room + '</span>';
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
  for (var key in rooms) {
    $('#rooms').append('<option value="' + key + '">' + key + '</option>');
  }
};

// App.prototype.filterRooms = function(room){
//   var tmp = $('p');
//   $.each(tmp, function(){
//     if (!$(this).find('span').hasClass(room)) {
//       $(this).fadeOut();
//     } else {
//       $(this).fadeIn();
//     }
//   });
// };

App.prototype.onFetch = function(resultData) {
  $('.chat p').remove();
  var that = this;
  var rooms = {};
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
  // that.showRooms(rooms);
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
      // data
      that.onFetch(data.results);
      // if ($('#rooms').val() !== 'Main') {
      //   that.filterRooms($('#rooms').val());
      // } else {
      //   $('p').show();
      // }
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

// saving friends to the friends list
// listing rooms / filtering?

// allow users to select username and send messages
  
  // allow users to create rooms
  // allow users to befriend each other
  // display messages from friends in bold

$(document).ready(function() {  
  var chat = new App();
  chat.fetch();
  // chat.showRooms();

  // send message functionality
  $('#send').on('click', function(e){
    e.preventDefault();
    var message = {
      'username': chat.username,
      'text': $('.textbox').val(),
      'roomname': ''
    };
    chat.send(message);
    // return false;
  });

  // continuous refresh
  // setInterval(function() {
  //   chat.fetch();
  // }, 500);
  
});