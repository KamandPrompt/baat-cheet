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
    })


function newRoom(){
    $(".wrapper").fadeOut();
    $("#room").fadeIn();
};

function submitRoom(){
    createRoom(); // used in client.js to pass details to app.js
    //copy the following to the createRoom if creating room is successfull
    // $("#room").fadeOut();
    // $(".wrapper").fadeIn();
    // $('#roomName').val("");
    // $('#description').val("");  
};

$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');

$('.left .person').mousedown(function(){
    if ($(this).hasClass('active')) {
        return false;
    } else {
        var findChat = $(this).attr('data-chat');
        var personName = $(this).find('.name').text();
        $('.right .top .name').html(personName);
        $('.chat').removeClass('active-chat');
        $('.left .person').removeClass('active');
        $(this).addClass('active');
        $('.chat[data-chat = '+findChat+']').addClass('active-chat');
    }
});