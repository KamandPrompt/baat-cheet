var socket = io();
var username, scrollDiff;

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
    socket.emit('Message Request', {
        msg: msg,
        room: room_name
    });
}

//creates a room
function createRoom() {
    if ($("#roomName").val() == '') return;
    socket.emit('create room', {
        room_name: $('#roomName').val(),
        description: $('#description').val()
    });
}

//requests server to join a room
function joinRoom(room) {
    var room_id = convertIntoId(room);
    socket.emit('join room', {
        name: room
    });
    $(".error").hide();
    $("#" + room_id + "-msg").attr("data-joined", 1);
    $("#" + room_id + "-msg,.write").show();
}

//requests server to leave a room
function leaveRoom(room) {
    var room_id = convertIntoId(room);
    socket.emit('leave room', {
        name: room
    });
    $(".error").html('<span id="error">You havent joined this room yet. <button onclick="joinRoom( \'' + room + '\' )" id="joinBtn">Join<Button/> to see the conversation.</span>');

    $("#" + room_id + "-msg").attr("data-joined", 0);
    $("#" + room_id + "-msg,.write").hide();
    $(".error").show();
}

//For handling meta-characters in jquery
function convertIntoId(name) {
    return name.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^{|}~ ]/g, "\\$&");
}

//if server emits user exists, propmt for changing username
socket.on('user exists', function(data) {
    document.getElementById('error_response').innerHTML = data + ' username already taken! Try another one.'
});

//if server emits user set, display rooms to user
socket.on('user set', function(data) {
    username = data.username;
    var date = new Date()
    $("#user").fadeOut();
    $("body").css("background-color", "#f8f8f8");
    $(".wrapper").fadeIn();
    // $(".top[data-chat='person1']").("<center><span> " + data.online + " user(s) online</span><center>");
    $(".top[data-chat='person1']").find("span")[1].innerHTML = data.online + " user(s) online</span>";
    socket.username = data.username;
    scrollDiff = $("#lobby-msg").children(".chat")[0].scrollHeight;
});

//notifies users that someone joined baat-cheet
socket.on('user joined', function(data) {
    $.notify(data.username + " just joined", "info");
    $("#lobby-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
});

//notifies users that someone left
socket.on('user left', function(data) {
    $.notify(data.username + " just left", "error");
});


//notifies users that someone joined a room
socket.on('user join', function(data) {
    var room_id = convertIntoId(data.room);
    if (data.room != "lobby") {
        $.notify(data.username + " just joined " + data.room + " room!", "info");
        $("#" + room_id + "-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
    }
});

//displays message to users
socket.on('Display Message', function(data) {
    var today = new Date();
    var class_name;
    if (socket.username == data.user) {
        class_name = 'self';
    } else {
        class_name = 'others'
    }
    // Adding Emoji
    var p = data.msg;
    var colon1 = p.indexOf(":");
    while (colon1 != -1) {
        var colon2 = p.indexOf(":", colon1 + 1);
        if (colon2 != -1) {
            emoji_name = p.slice(colon1 + 1, colon2);
            position = emoji_names.indexOf(emoji_name)
            if (position != -1) {
                p = p.slice(0, colon1) + "<img class=\"emoji\" src=\"images/emoji/" + emojis[position] + ".png\">" + p.slice(colon2 + 1);
            }
            colon1 = p.indexOf(":", colon2 + 1);
        } else {
            break;
        }
    }
    var dateTime = new Date();
    var hours = dateTime.getHours().toString(10);
    var mins = dateTime.getMinutes().toString(10);
    if (hours.length == 1) {
        hours = '0' + hours;
    }
    if (mins.length == 1) {
        mins = '0' + mins;
    }
    // Format Message
    const div = document.createElement('div');
    const username = document.createElement('small');
    const timestamp = document.createElement('small');
    const br = document.createElement('br');
    div.classList.add("bubble", class_name);
    username.classList.add("info");
    timestamp.classList.add("info");
    div.setAttribute("data-chat", "person1")
    username.innerText = data.user;
    timestamp.innerText = hours + ":" + mins;
    if (class_name == 'self') {
        div.innerHTML += p + br.outerHTML + timestamp.outerHTML;
    } else {
        div.innerHTML += username.outerHTML + br.outerHTML + p + br.outerHTML + timestamp.outerHTML;
    }
    var room_id = convertIntoId(data.room);
    $("#" + room_id + "-msg").children(".chat[data-chat='person1']").append(div)
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
                            <span class='preview'>" + data.description + "</span>\
                        </li>");
    $('.container').append("<div class='right' id='" + data.room_name + "-msg" + "' data-joined='1' style='display:none;'>\
            <div class='top'><center id='online'><span>" + data.room_name + " Room</span>&nbsp;(<a href='#' onclick='leaveRoom(\"" + data.room_name + "\")'>Leave room</a>)</center></div>\
                            <div class='chat active-chat' data-chat='person1'></div>\
        </div>");
    $("#" + room_id + "-msg").children(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>");
    $("#" + room_id + "-msg").find('.top').append("<center><span> " + data.online + " users online</span></center>");
    $("#room").fadeOut();
    $(".wrapper").fadeIn();
    $('#roomName').val("");
    $('#description').val("");
});

//displays room to the others
socket.on('room created other', function(data) {
    if (username) {
        var date = new Date();
        var room_id = convertIntoId(data.room_name);
        $('.people').append("<li class='person' data-chat='person1' id='" + data.room_name + "' onclick='showRoom(this)'>\
                                <span class='name'>" + data.room_name + "</span><br>\
                                <span class='preview'>" + data.description + "</span>\
                            </li>");
        $('.container').append("<div class='right' id='" + data.room_name + "-msg" + "'  data-joined='0' style='display:none;'>\
                <div class='top'><center id='online'><span>" + data.room_name + " Room</span>&nbsp;(<a href='#' onclick='leaveRoom(\"" + data.room_name + "\")'>Leave room</a>)</center></div>\
                                <div class='chat active-chat' data-chat='person1'></div>\
            </div>");
        $("#" + room_id + "-msg").children(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                    <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                                </div>");
        $("#" + room_id + "-msg").find('.top').append("<center><span> " + data.online + " users online</span></center>");
    }
});

//destroys room because there are no users in it
socket.on('destroy room', function(data) {

    //redirect user to lobby if the active room is to be destroyed
    if ($(".active").attr("id") == data) {
        $("#lobby").addClass('active');
        $("#lobby-msg").css("display", "inherit");
    }

    $(".error").hide();
    $(".write").css("display", "initial");

    var room_id = convertIntoId(data);
    $('#' + room_id).remove();
    $('#' + room_id + '-msg').remove();
});

//notifies when user leaves the room
socket.on('user left room', function(data) {
    var room_id = convertIntoId(data.room);
    $.notify(data.username + " just left room " + data.room, "error");
    $("#" + room_id + "-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
});

//updates info about number of users
socket.on('update info', function(rooms) {
    var room_id;
    // alert(rooms);
    for (var i = 0; i < rooms.length; i++) {
        room_id = convertIntoId(rooms[i].name);
        $("#" + room_id + "-msg").find('.top').find('span')[1].innerHTML = rooms[i].num_users + " user(s) online";
    }
});

//updates info about number of users
socket.on('room joined', function(data) {
    var room_id = convertIntoId(data.name);
    $("#" + room_id + "-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
});