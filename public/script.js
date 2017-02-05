$(document).ready(function(){
        $("#userN").on("keypress", function(val) {
            if(val.which == 13) {
                setUsername();
            }
        });

        $('#textarea').on("keypress", function(val) {
            if(val.which == 13) {
                sendMessage();
                $(this).val("");
            }
        });
    })


function newRoom(){
    $(".wrapper").fadeOut();
    $("#room").fadeIn();
};

function submitRoom(){
    createRoom(); // used in client.js to pass details to app.js
};

function showRoom(name){
    var current = $(".active").attr("id");
    $("#"+current+"-msg").css("display", "none"); 
    $(".active").removeClass('active');
    $(".active-area").removeClass('active-area');
    var room = name.id;
    $("#"+room).addClass('active');
    $("#"+room+"-msg").css("display", "inherit");
    $("#"+room+"-msg").find("#textarea").addClass('active-area');
};

$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');
