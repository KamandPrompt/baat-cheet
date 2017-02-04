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
    $("#user").fadeOut();
    $("#lobby").fadeIn();
    socket.username = data;
    // setTimeout(function(){
    //     document.getElementById('after').innerHTML = 'Your username is ' + data;
    // }, 500);
});

socket.on('user joined', function(data) {
    $.notify(data + " just joined", "info");
});

socket.on('user left', function(data) {
    $.notify(data + " just left", "error");
});

socket.on('Display Message', function(data) {
    var today = new Date();
    console.log(data);
    var class_name;
    if(socket.username == data.user) {
        class_name = 'self';
    }
    else {
        class_name = 'other'
    }
    // may be a better approach
    // var li = $('<li>')
    //     .attr('class', class_name)
    //     .append($'<div>')
    //         .attr('class', 'avatar')
    //         .append($'<img>')
    //             .attr({src: '/user.png', draggabe:'false'})
    $('ol').append("<li class= " + class_name + ">\
                        <div class='avatar'><img src='/user.png' draggable='false'/></div>\
                        <div class='msg'>\
                            <p>" + data.msg + "</p>\
                            <time>" + today.getHours() + ":" + today.getMinutes() +"</time>\
                        </div>\
                    </li>");
    $('html, body').animate({scrollTop: $('#lobby').height()}, 1000);

});

$(document).ready(function(){
    $("#userN").on("keypress", function(val) {
        if(val.which == 13) {
            setUsername();
        }
    });

    $('#textarea').on("keypress", function(val) {
        if(val.which == 13) {
            sendMessage();
            $('#textarea').val("");
        }
    });
});