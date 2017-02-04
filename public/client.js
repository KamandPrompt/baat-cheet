var socket = io();

//sets client username
function setUsername() {
    socket.emit('set username', $('#userN').val());
};

//sends a message
function sendMessage() {
    msg = $('#textarea').val(); 
    msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    socket.emit('Message Request', msg);
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
                                            </div>")
    socket.username = data;
});

//notifies users in room that someone joined
socket.on('user joined', function(data) {
    $.notify(data + " just joined", "info");
});

//notifies users in room that someone left
socket.on('user left', function(data) {
    $.notify(data + " just left", "error");
});

//displays message to users
socket.on('Display Message', function(data) {
    console.log(data);
    var today = new Date();
    var class_name;
    if(socket.username == data.user) {
        class_name = 'self';
    }
    else {
        class_name = 'others'
    }
    $(".chat[data-chat='person1']").append("<div class='bubble " + class_name + "' data-chat ='person1'>\
                            " + data.msg + "<br>\
                            <span class='info'>" + data.user + "</span>\
                       </div>")

});
