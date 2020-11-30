$(document).ready(function () {
  $("#userN").on("keypress", (val) => {
    if (val.which == 13) setUsername();
  });
  // event listener for all message areas to send message on pressing 'enter' and add a newline on pressing 'shift+enter'
  $(".app-container").on("keyup", '.message-area', function (event) {
    if (event.which == 13 && event.shiftKey) {
      event.preventDefault();
    } else if (event.which == 13) {
      event.preventDefault();
      sendMsg();
    }
  });
  // Handle touch gestures on body
  let touchstartX, touchstartY, touchendX, touchendY;
  document.body.addEventListener('touchstart', function (event) {
    touchstartX = event.changedTouches[0].screenX;
    touchstartY = event.changedTouches[0].screenY;
  }, false);
  document.body.addEventListener('touchend', function (event) {
    touchendX = event.changedTouches[0].screenX;
    touchendY = event.changedTouches[0].screenY;
    workOnTouch(Number(touchendY < touchstartY), Number(touchendX > touchstartX), Number(touchendY > touchstartY), Number(touchendX < touchstartX));
  }, false);
  // Prevent new room modal from closing on Enter key
  $('#roomName').on("keypress", function (e) {
    if (e.which === 13) {
      e.preventDefault();
      submitRoom();
    }
  });
});
// Sends a message to server
const sendMsg = () => {
  msgArea = document.querySelector('.right.active').querySelector('.message-area');
  msg = msgArea.value.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  room_name = $(".active").attr("id");
  socket.emit('Message Request', {
    msg: msg,
    room: room_name
  });
  msgArea.value = '';
  msgArea.focus();
}
// Work on touch
const workOnTouch = (U, R, D, L) => {
  let leftbar = document.querySelector('.left');
  if (L && leftbar.classList.contains('open-menu')) {
    closeSidebar();
  }
  if (R && leftbar.classList.contains('menu-closed')) {
    openSidebar();
  }
}
$(".searchtext").on("keyup", () => search());
$(".search").click(() => search());
const search = () => {
  const searchtext = $(".searchtext").val().toLowerCase();
  $(".card-columns[name='people'] .card").each(function () {
    var st = $(this).find(".card-body > .name").text().toLowerCase();
    var $pt = $.trim(st);
    if ($pt.includes(searchtext)) $(this).show();
    else $(this).hide();
  });
};
const submitRoom = () => createRoom(); // used in client.js to pass details to app.js
const showRoom = (name) => {
  const current_room_id = convertIntoId($(".active").attr("id"));
  $(`#${current_room_id}-msg`).css("display", "none");
  $(".active").removeClass('active');
  const room = name.id;
  let room_id = convertIntoId(room);
  $(`#${room_id}`).addClass('active');
  $(`#${room_id}-msg`).css("display", "inherit").addClass('active');
  if ($(`#${room_id}-msg`).attr("data-joined") == 0) {
    $(".error").css("display", "inherit");
    $(".error").html('<span id="error">You haven\'t joined this room yet. <a onclick="joinRoom(\'' + name.id + '\')" id="joinBtn" href="#">Join</a> to see the conversation.</span>');
    $(`#${room_id}-msg`).hide();
  } else {
    $(".error").hide();
  }
};
$('.chat[data-chat=person1]').addClass('active-chat');
$('.person[data-chat=person1]').addClass('active');

function toggleUsers(room_id) {
  room_id = convertIntoId(room_id);
  var el = $(`#${room_id}-msg .room-info .Participants`)[0];
  el.classList.toggle('d-none');
}

function active(el) {
  if (el.hasClass("active")) {
    el.removeClass("active");
    el.find('.emobox').css("display", "none");
  } else {
    el.addClass("active");
    el.find('.emobox').css("display", "block");
  }
}
$("body").on("click", '.smiley', function () {
  active($(this));
});

function writeEmoji(emoji) {
  const textarea = $(`.right.active #${emoji.id}`).parents(".right.active").find(".message-area");
  textarea.val(textarea.val() + ":" + emoji.id + ":");
  textarea.focus();
}
// For sidebar to work on small screens
function closeSidebar() {
  const navbar = document.querySelector(".left");
  navbar.classList.remove('open-menu')
  navbar.classList.add('menu-closed')
  let toggle = document.querySelector("#toggle-icon");
  toggle.className = '';
  toggle.className += 'fa fa-angle-right';
}

function openSidebar() {
  const navbar = document.querySelector(".left");
  navbar.classList.remove('menu-closed')
  navbar.classList.add('open-menu')
  let toggle = document.querySelector("#toggle-icon");
  toggle.className = '';
  toggle.className += 'fa fa-angle-left';
}

function SidebarToggle() {
  const navbar = document.querySelector(".left");
  if (!navbar.classList.contains('menu-closed') && navbar.classList.contains('open-menu')) {
    closeSidebar();
  } else {
    openSidebar();
    document.body.addEventListener('click', function (event) {
      const sidebar = document.getElementsByClassName('left')[0]; //Ensuring that clicks inside the sidebar(outside lobbies) don't make the sidebar collapse
      const lobbyName = document.getElementsByClassName('person'); //In case user clicks a lobby from the sidebar, the sidebar collapse. This is a list of classes
      const addLobbyPage = document.getElementById('room'); //Ensuring that clicks on page to add lobby names doesn't make the sidebar collapse
      for (let i = 0; i < lobbyName.length; i++) {
        if (lobbyName[i].contains(event.target)) {
          closeSidebar();
          return;
        }
      }
      if (!sidebar.contains(event.target) && !addLobbyPage.contains(event.target)) {
        closeSidebar();
      }
    }, false);
  }
}
/**
 * Notify method called when toast notification should be shown
 * @param {object} data Object with data
 */
function notify(data) {
  var msgHeader;
  var msgBody;
  if (data.indexOf('|') > -1) {
    var notfication = data.split('|');
    msgHeader = notfication[0];
    msgBody = notfication[1];
  } else {
    msgHeader = 'Info';
    msgBody = data;
  }
  var notficationID = Date.now();
  var toastTemplate = `<div class="toast" id="${notficationID}">
                        <div class="toast-header">
                          <strong class="mr-auto">${msgHeader}</strong>
                            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                              <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="toast-body">${msgBody}</div>
                      </div>`;
  $('#toast-wrapper').append(toastTemplate);
  // Init notiifications
  $('.toast').toast({
    delay: 3000
  });
  $(`#${notficationID}`).toast('show');
  $(`#${notficationID}`).on('hidden.bs.toast', function () {
    $(`#${notficationID}`).remove();
  });
}
/**
 * Method called to show the chat message
 * @param {object} socket The socket instance
 * @param {object} data The data object with msg, username, room, etc
 */
function displayMessage(socket = null, data) {
  let {
    msg
  } = data;
  const {
    user,
    room,
    sender
  } = data;
  let class_name;
  if (socket.username === user && !sender) {
    class_name = 'self';
  } else {
    class_name = 'others'
  }
  // Adding Emoji
  let p;
  let colon1 = msg.indexOf(":");
  while (colon1 != -1) {
    let colon2 = msg.indexOf(":", colon1 + 1);
    if (colon2 != -1) {
      emoji_name = msg.slice(colon1 + 1, colon2);
      position = emojiNames.indexOf(emoji_name)
      if (position != -1) {
        msg = msg.slice(0, colon1) + "<img class=\"emoji\" src=\"images/emoji/" + emojiCodes[position] + ".png\">" + msg.slice(colon2 + 1);
      }
      colon1 = msg.indexOf(":", colon2 + 1);
    } else {
      break;
    }
  }
  // Format the current timestamp
  const current_date = new Date();
  const fulldatetime = dateFns.format(current_date, 'MMM DD H:mm:ss');
  const timestamp = dateFns.format(current_date, 'H:mm');
  // Create msg HTML
  const msg_template = `<div class="card m-1 w-75 ${sender === 'Welcome Bot' ? 'bg-info' : ''} ${class_name === 'self' ? '' : 'bg-primary'} ${class_name}" data-chat="person1">
      <div class="card-body">
        <small class="d-inline-block ${class_name === 'self' ? 'text-secondary' : ''}">${sender ? `🤖 ${sender}` : user}</small>
        <small class="d-inline-block mx-2 message-today ${class_name === 'self' ? 'text-secondary' : ''}" data-timestamp="${current_date.getTime()}" title="${fulldatetime}">${timestamp}</small>
        <p class="card-text mb-0 ${class_name === 'self' ? 'text-primary' : 'text-white'}">${msg.replace(/\n/g, '<br>')}</p>
      </div>
    </div>`;
  let room_id = convertIntoId(room);
  // Append the template into the conversation window
  $(`#${room_id}-msg`).children(".chat[data-chat='person1']").append(msg_template)
  room_id = convertIntoId($(".active").attr("id"));
  const height = $(`#${room_id}-msg`).children(".chat")[0].scrollHeight;
  $(`#${room_id}-msg`).children(".chat").scrollTop(height);
  let currRoom = $(".active").attr("id");
  let isJoined = $(`#${room_id}-msg`).attr("data-joined");
  if (socket.username != user && currRoom != room && isJoined == 1) {
    notify(`Room ${room} | ${user}: ${(msg.length >= 20) ? msg.substr(0, 20) + '...' : msg}`, "info");
  }
}
/**
 * Method called to check and update timestamp without month and date
 * @param {object} current_date The current date time when message comes
 */
function updateTimestamps() {
  const ts_el = document.querySelectorAll(".message-today");
  ts_el.forEach(function (el) {
    const ts = el.getAttribute("data-timestamp");
    const sent_date = new Date(parseInt(ts, 10));
    // Sent time is not on today, update innerText to have month and day
    el.innerText = dateFns.format(sent_date, 'MMM DD H:mm');
    el.classList.remove('message-today');
  });
}
