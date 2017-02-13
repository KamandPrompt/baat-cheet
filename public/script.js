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
    $("#room").css("display","block");
};

$("#cancel").click(function() {
    $(this).parent().parent().hide();
});

function submitRoom(){
    createRoom(); // used in client.js to pass details to app.js
};

function showRoom(name){
    var current_room_id = convertIntoId($(".active").attr("id"));
    $("#"+ current_room_id +"-msg").css("display", "none"); 
    $(".active").removeClass('active');
    var room = name.id;
    var room_id = convertIntoId(room);
    $("#" + room_id).addClass('active');
    $("#" + room_id + "-msg").css("display", "inherit");
    if($("#" + room_id + "-msg").attr("data-joined") == 0){
        $(".error").css("display","inherit");
        $(".error").html('<span id="error">You havent joined this room yet. <input type="button" onclick="joinRoom(\'' + name.id + '\')" value="Join" id="joinBtn"/> to see the conversation.</span>');
        $("#" + room_id + "-msg,.write").hide();
    }else {
        $(".error").hide();
        $(".write").css("display","initial");
    }
    

};

$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');
