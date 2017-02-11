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
    var current = $(".active").attr("id");
    $("#"+current+"-msg").css("display", "none"); 
    $(".active").removeClass('active');
    var room = name.id;
    $("#"+room).addClass('active');
    $("#"+room+"-msg").css("display", "inherit");
    if($("#"+room+"-msg").attr("data-joined") == 0){
        $(".error").css("display","inherit");
        $(".error").html("<span id='error'>You haven't joined this room yet. <input type='button' onclick='joinRoom(" + room + ")' value='Join' id='joinBtn'/> to see the conversation.</span>");
        $("#"+room+"-msg,.write").hide();
    }else {
        $(".error").hide();
        $(".write").css("display","initial");
    }
    

};

$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');
