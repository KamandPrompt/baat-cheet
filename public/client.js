var socket = io();

function setUsername() {
    socket.emit('set username', $('#userN').val());
};

function sendMessage() {
    socket.emit('Message Request', $('#textarea').val());
}

socket.on('user exists', function (data) {
    document.getElementById('error_response').innerHTML = data + ' username already taken! Try another one.'
});

socket.on('user set', function (data) {
    var date = new Date()
    $("#user").fadeOut();
    $(".wrapper").fadeIn();
    $(".chat[data-chat='person1']").append("<div class='conversation-start'>\
                                                <span>" + date.getHours() + ':' + date.getMinutes() + "</span>\
                                            </div>")
    socket.username = data;
});

socket.on('user joined', function(data) {
    $.notify(data + " just joined", "info");
});

socket.on('user left', function(data) {
    $.notify(data + " just left", "error");
});

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
