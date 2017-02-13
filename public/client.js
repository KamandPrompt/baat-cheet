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

//requests server to join a room
function joinRoom(room){
    //if(room == '') return ;
    console.log(room);
    var room_id = convertIntoId(room);
    socket.emit('join room', {name:room} );
    $(".error").hide();
    $("#" + room_id + "-msg").attr("data-joined",1);
    $("#" + room_id + "-msg,.write").show();
}

//requests server to leave a room
function leaveRoom(room){
    //if(room == '') return ; 
    console.log(room);
    var room_id = convertIntoId(room.id);
    socket.emit('leave room', {name:room.id} );
    $(".error").html('<span id="error">You havent joined this room yet. <button onclick="joinRoom( \'' + room.id + '\' )" id="joinBtn">Join<Button/> to see the conversation.</span>');
    
    $("#" + room_id + "-msg").attr("data-joined",0);
    $("#" + room_id + "-msg,.write").hide();
    $(".error").show();
}

//For handling meta-characters in jquery
function convertIntoId(name) {
    return name.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^{|}~ ]/g, "\\$&");
}

//if server emits user exists, propmt for changing username
socket.on('user exists', function (data) {
    document.getElementById('error_response').innerHTML = data + ' username already taken! Try another one.'
});

//if server emits user set, display rooms to user
socket.on('user set', function (data) {
    var date = new Date()
    $("#user").fadeOut();
    $("body").css("background-color","#f8f8f8");
    $(".wrapper").fadeIn();
    $(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    socket.username = data;
});

//notifies users that someone joined baat-cheet
socket.on('user joined', function(data) {
    $.notify(data.username + " just joined", "info");
});

//notifies users that someone left
socket.on('user left', function(data) {
    $.notify(data.username + " just left", "error");
});


//notifies users that someone joined a room
socket.on('user join', function(data) {
    if(data.room!="lobby"){
        $.notify(data.username + " just joined " + data.room + " room!", "info");
    }
});

//displays message to users
socket.on('Display Message', function(data) {
    var today = new Date();
    var class_name;
    if(socket.username == data.user) {
        class_name = 'self';
    }
    else {
        class_name = 'others'
    }
    console.log("recieve for room" + data.room);
    var room_id = convertIntoId(data.room);
    $("#"+ room_id +"-msg").children(".chat[data-chat='person1']").append("<div class='bubble " + class_name + "' data-chat ='person1'>\
                            " + data.msg + "<br>\
                            <span class='info'>" + data.user + "</span>\
                       </div>");
    var room_id = convertIntoId($(".active").attr("id"));
    var height = $("#" + room_id + "-msg").children(".chat")[0].scrollHeight;
    $("#" + room_id + "-msg").children(".chat").scrollTop(height);

});

//if room exists, then prompt for another room name
socket.on('room exists', function(data) {
    $('#roomError').text(data + ' room already exists! Try another room name');
});

//displays room to the creator
socket.on('room created self', function(data) {
    var date = new Date();
    var room_id = convertIntoId(data.room_name);
    $('.people').append("<li class='person' data-chat='person1' id='" + data.room_name + "' onclick='showRoom(this)'>\
                            <span class='name'>" + data.room_name + "</span><br>\
                            <span class='time'>2:09 PM</span>\
                            <span class='preview'>" + data.description + "</span>\
                        </li>");
    $('.container').append("<div class='right' id='" + data.room_name + "-msg" + "' data-joined='1' style='display:none;'>\
            <div class='top'><center><span>" + data.room_name + " Room</span>&nbsp;(<a href='#' onclick='leaveRoom(" + data.room_name + ")'>Leave room</a>)</center></div>\
                            <div class='chat active-chat' data-chat='person1'></div>\
        </div>");
    $("#"+ room_id +"-msg").children(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    $("#room").fadeOut();
    $(".wrapper").fadeIn();
    $('#roomName').val("");
    $('#description').val(""); 
});

//displays room to the others
socket.on('room created other', function(data) {
    var date = new Date();
    var room_id = convertIntoId(data.room_name);
    $('.people').append("<li class='person' data-chat='person1' id='" + data.room_name + "' onclick='showRoom(this)'>\
                            <span class='name'>" + data.room_name + "</span><br>\
                            <span class='time'>2:09 PM</span>\
                            <span class='preview'>" + data.description + "</span>\
                        </li>");
    $('.container').append("<div class='right' id='" + data.room_name + "-msg" + "'  data-joined='0' style='display:none;'>\
            <div class='top'><center><span>" + data.room_name + " Room</span>&nbsp;(<a href='#' onclick='leaveRoom(" + data.room_name + ")'>Leave room</a>)</center></div>\
                            <div class='chat active-chat' data-chat='person1'></div>\
        </div>");
     $("#"+ room_id +"-msg").children(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    $("#room").fadeOut();
    $(".wrapper").fadeIn();
    $('#roomName').val("");
    $('#description').val(""); 
});

//destroys room because there are no users in it
socket.on('destroy room', function(data) {

    //redirect user to lobby if the active room is to be destroyed
    if($(".active").attr("id") == data) {
        $("#lobby").addClass('active');
        $("#lobby-msg").css("display", "inherit");
    }

    $(".error").hide();
    $(".write").css("display","initial");

    var room_id = convertIntoId(data);
    $('#' + room_id).remove();
    $('#' + room_id + '-msg').remove();
});

//notifies when user leaves the room
socket.on('user left room', function(data) {
    $.notify(data.username + " just left room " + data.room, "error");
});
