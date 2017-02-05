var socket = io();

//sets client username
function setUsername() {
    socket.emit('set username', $('#userN').val());
};

//sends a message
function sendMessage() {
    msg = $('#textarea').val(); 
    //alert(msg);
    msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    room_name = $(".active").attr("id");
    socket.emit('Message Request', {msg: msg, room: room_name});
}

//creates a room
function createRoom() {
    if($("#roomName").val()=='') return ; 
    socket.emit('create room', {room_name: $('#roomName').val(), description: $('#description').val()});
}

//if server emits user exists, propmt for changing username
socket.on('user exists', function (data) {
    document.getElementById('error_response').innerHTML = data + ' username already taken! Try another one.'
});

//if server emits user set, display rooms to user
socket.on('user set', function (data) {
    var date = new Date()
    $("#user").fadeOut();
    $(".wrapper").fadeIn();
    $(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    socket.username = data;
});

//notifies users in room that someone joined
socket.on('user joined', function(data) {
    $.notify(data.username + " just joined", "info");
});

//notifies users in room that someone left
socket.on('user left', function(data) {
    $.notify(data.username + " just left", "error");
});

//displays message to users
socket.on('Display Message', function(data) {
    console.log(data.room);
    var today = new Date();
    var class_name;
    if(socket.username == data.user) {
        class_name = 'self';
    }
    else {
        class_name = 'others'
    }
    $("#"+data.room+"-msg").children(".chat[data-chat='person1']").append("<div class='bubble " + class_name + "' data-chat ='person1'>\
                            " + data.msg + "<br>\
                            <span class='info'>" + data.user + "</span>\
                       </div>")

});

//if room exists, then prompt for another room name
socket.on('room exists', function(data) {
    $('#roomError').text(data + ' room already exists! Try another room name');
});

//displays room to the users
socket.on('room created', function(data) {
    var date = new Date();
    $('.people').append("<li class='person' data-chat='person1' id='" + data.room_name + "' onclick='showRoom(this)'>\
                            <span class='name'>" + data.room_name + "</span><br>\
                            <span class='time'>2:09 PM</span>\
                            <span class='preview'>" + data.description + "</span>\
                        </li>");
    $('.container').append("<div class='right' id='" + data.room_name + "-msg" + "' style='display:none;'>\
            <div class='top'><center><span>" + data.room_name + " Room</span></center></div>\
                            <div class='chat active-chat' data-chat='person1'></div>\
        </div>");
     $("#"+data.room_name+"-msg").children(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    $("#room").fadeOut();
    $(".wrapper").fadeIn();
    $('#roomName').val("");
    $('#description').val(""); 
});
