$(document).ready(function() {
  $("#userN").on("keypress", function(val) {
    if (val.which == 13) {
      setUsername();
    }
  });

  // event listener to dinamic element
  $("body").on("keypress", '.textarea', function(val) {
    if (val.which == 13) {
      sendMessage($(this).val());
      $(this).val("");
    }
  });

  $("body").on("click", '.send', function() {
    var $input = $(this).parents('.write').find('.textarea');
    sendMessage($input.val());
    $input.val("");
  });
});

$(".searchtext").on("keyup", function(val) {
  search();
});

$(".search").click(function() {
  search();
});

function search() {
  var $searchtext = $(".searchtext").val().toLowerCase();
  $("ul[name='people'] li").each(function() {
    var st = $(this).children(".name").text().toLowerCase();
    var $pt = $.trim(st);
    if ($pt.includes($searchtext))
      $(this).show();
    else
      $(this).hide();
  });
};

function newRoom() {
  $("#room").css("display", "block");
};

$("#cancel").click(function() {
  $(this).parent().parent().hide();
});

function submitRoom() {
  createRoom(); // used in client.js to pass details to app.js
};

function showRoom(name) {
  var current_room_id = convertIntoId($(".active").attr("id"));
  $("#" + current_room_id + "-msg").css("display", "none");
  $(".active").removeClass('active');
  var room = name.id;
  var room_id = convertIntoId(room);
  $("#" + room_id).addClass('active');
  $("#" + room_id + "-msg").css("display", "inherit");
  if ($("#" + room_id + "-msg").attr("data-joined") == 0) {
    $(".error").css("display", "inherit");
    $(".error").html('<span id="error">You havent joined this room yet. <input type="button" onclick="joinRoom(\'' + name.id + '\')" value="Join" id="joinBtn"/> to see the conversation.</span>');
    $("#" + room_id + "-msg,.write").hide();
  } else {
    $(".error").hide();
    $(".write").css("display", "initial");
  }

};

$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');

function collap(room_id) {
  room_id = convertIntoId(room_id);
  var height = $("#" + room_id + "-msg").find('.Participants').css('height');
  if(height == '0px') {
   $("#" + room_id + "-msg").find('.Participants').css({"height":"60%" , "z-index":"+10"});
  $("#" + room_id + "-msg").find('.btn').addClass('viewUsers');
  } else {
   $("#" + room_id + "-msg").find('.Participants').css({"height":"0%" , "z-index":"-10"});
  $("#" + room_id + "-msg").find('.btn').removeClass('viewUsers');
  }
}

var emo = document.querySelector(".smiley");

function active() {
  if ($(".smiley").hasClass("active")) {
    $(".smiley").removeClass("active");
    $("#emobox").css("display", "none");
  } else {
    $(".smiley").addClass("active");
    $("#emobox").css("display", "block");
  }
}

emo.addEventListener("click", active, false);

function writeEmoji(emoji) {
  var emojiName = emoji.id;
  $("#textarea").val($("#textarea").val() + ":" + emojiName + ":");
  $("#textarea").focus();
}

// For sidebar to work on small screens

function closeSidebar() {
  const navbar = document.querySelector(".left");
  navbar.style.left = '-300px';
  right.style.width = "100%";
  var toggle = document.querySelector("#toggle-icon");
  toggle.className = '';
  toggle.className += 'fa fa-angle-right';
}

function openSidebar() { 
  const navbar = document.querySelector(".left");
  navbar.style.left = '0px';
  right.style.width = "calc(100% - 300px)";
  var toggle = document.querySelector("#toggle-icon");
  toggle.className = '';
  toggle.className += 'fa fa-angle-left';
}

function SidebarToggle() {
  const navbar = document.querySelector(".left");
  if (navbar.style.left == '0px') {
    closeSidebar();
  } 
  else {
    openSidebar();
    document.body.addEventListener('click', function(event) {
      var sidebar = document.getElementsByClassName('left')[0]; //Ensuring that clicks inside the sidebar(outside lobbies) don't make the sidebar collapse
      var lobbyName = document.getElementsByClassName('person'); //In case user clicks a lobby from the sidebar, the sidebar collapse. This is a list of classes
      var addLobbyPage = document.getElementById('room'); //Ensuring that clicks on page to add lobby names doesn't make the sidebar collapse
      for (var i=0; i<lobbyName.length; i++) { 
        if(lobbyName[i].contains(event.target)) {
          closeSidebar(); 
          return;
        }
      }
      if(!sidebar.contains(event.target) && !addLobbyPage.contains(event.target)) { 
        closeSidebar(); 
      }
    }, false); 
  }
}
