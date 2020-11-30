// Adding emojis in emoji-box
let emobox = document.getElementById('emobox');
for (var i = 0; i < emojiCodes.length; i++) {
  var listElement = document.createElement('li');
  var imgElement = document.createElement('img');
  imgElement.src = '/images/emoji/' + emojiCodes[i] + '.png';
  imgElement.id = emojiNames[i];
  imgElement.title = emojiNames[i].replace(/_/g, ' ');
  imgElement.setAttribute('onclick', 'writeEmoji(this)');
  listElement.appendChild(imgElement);
  emobox.appendChild(listElement);
}
const socket = io();
let username, scrollDiff;
// Appending the user info into left side card
const appendUserInfo = (room_name, description) => {
  const $userInfo = `
                    <div data-chat='person1' id='${room_name}' onclick='showRoom(this)' class="card person">
                        <div class="card-body">
                            <h5 class="card-title name">${room_name}</h5>
                            <p class="card-text preview">${description}</p>
                        </div>
                    </div>
                    `;
  $('.card-columns').append($userInfo);
}
// Appending the content
const appendContentInfo = (room_name, online, data_joined) => {
  emobox = document.getElementById(`emobox`).outerHTML;
  const $contentInfo = `
                            <div class='right' id='${room_name}-msg' data-joined='${data_joined}' style='display:none;'>
                            <div class="room-info container-fluid text-center pt-1" data-chat="person1">
                              <p id="online">${room_name} Room (<a href='#' onclick='leaveRoom("${room_name}")'>Leave room</a>)</p>
                              <button class="btn p-0" onclick="toggleUsers('${room_name}')">${online} user online</button>
                              <div class="Participants bg-light d-none">
                              </div>
                            </div>
                            <div class='chat active-chat' data-chat='person1'></div>
                            <div class="input-group write">
                              <textarea type="text" class="message-area form-control" placeholder="Message to ${room_name}..." data-active="lobby" rows="2"></textarea>
                              <div class="input-group-append">
                                      <button class="btn smiley text-primary" type="button">
                                      <i class="far fa-smile icon"></i>
                                      ${emobox}
                                      </button>
                                      <button class="btn send text-primary" type="button" onclick="sendMsg()">
                                      <i class="fas fa-paper-plane icon"></i>
                                      </button>
                              </div>
                                </div>
                            </div>
                        `;
  $('.app-container').append($contentInfo);
}
socket.on('user invalid', (data) => {
  if (data === "This user name is invalid.") {
    nameError = document.getElementById('nicknameError');
    nameError.innerHTML = data;
  }
})
//if server emits user exists, propmt for changing username
socket.on('user exists', (data) => {
  nameError = document.getElementById('nicknameError');
  nameError.innerHTML = 'There is already one person with this nickname, try another one.';
});
//if server emits user set, display rooms to user
socket.on('user set', (data) => {
  username = data.username;
  $("#user").toggleClass('d-none');
  $("body").css("background-color", "#f8f8f8");
  $(".app-container").toggleClass('d-none');
  $('.message-area').focus();
  $('.room-info button')[0].innerText = data.online + ' user(s) online';
  $(".Participants")[0].innerHTML = convertIntoList(data.online_users);
  socket.username = data.username;
  scrollDiff = $("#lobby-msg").children(".chat")[0].scrollHeight;
});
// Notifies users that someone joined baat-cheet
socket.on('user joined', function (data) {
  notify(data.username + " just joined", "info");
  $("#lobby-msg .room-info button")[0].innerHTML = data.online + " user(s) online";
  $(".Participants")[0].innerHTML = convertIntoList(data.online_users);
});
// Welcomes the user to the app
socket.on('welcome user', function (data) {
  const {
    user,
    room,
    sender
  } = data;
  const welcome_msg = `Welcome, <em>${user}</em>! Enjoy your stay! <br /> <small style='color: #75ecff!important'>Remember: if you leave this tab or window, all chat history will be lost!</small>`
  displayMessage(socket, {
    user,
    msg: welcome_msg,
    room,
    sender
  });
});
//notifies users that someone left
socket.on('user left', function (data) {
  notify(data.username + " just left", "error");
});
//notifies users that someone joined a room
socket.on('user join', (data) => {
  const room_id = convertIntoId(data.room);
  if (data.room != "lobby") {
    notify(data.username + " just joined " + data.room + " room!", "info");
    $(`#${room_id}-msg .room-info button`)[0].innerHTML = data.online + " user(s) online";
    $(`#${room_id}-msg .room-info .Participants`)[0].innerHTML = convertIntoList(data.online_users);
  }
});
// displays message to users
socket.on('Display Message', (data) => {
  displayMessage(socket, data);
});
// if room exists, then prompt for another room name
socket.on('room exists', function (data) {
  $('#roomError').show();
  $('#roomError').text(data + ' room already exists! Try another room name');
  setTimeout(() => $('#roomError').hide(), 2000);
  $('#roomName').val("");
});
// displays room to the creator
socket.on('room created self', (data) => {
  const {
    description,
    room_name,
    online,
    online_users
  } = data;
  let room_id = convertIntoId(room_name);
  appendUserInfo(room_name, description);
  appendContentInfo(room_name, online, 1);
  $(`#${room_id}-msg`).find('.Participants')[0].innerHTML = convertIntoList(online_users);
  $('#roomName').val("");
  $('#description').val("");
});
// displays room to the others
socket.on('room created other', (data) => {
  if (username) {
    const {
      description,
      room_name,
      online,
      online_users
    } = data;
    var date = new Date();
    var room_id = convertIntoId(room_name);
    const $userInfo = `
                            <li class='person' data-chat='person1' id='${room_name}' onclick='showRoom(this)'>
                                <span class='name'>${room_name}</span><br>
                                <span class='preview'>${description}</span>
                            </li>
                        `;
    $('.people').append($userInfo);
    emobox = document.getElementById(`emobox`).outerHTML;
    const $contentInfo = `
                            <div class='right' id='${room_name}-msg' data-joined='0' style='display:none;'>
                              <div class="room-info container-fluid text-center pt-1" data-chat="person1">
                                <p id="online">${room_name} Room (<a href='#' onclick='leaveRoom("${room_name}")'>Leave room</a>)</p>
                                <button class="btn p-0" onclick="toggleUsers('${room_name}')">${online} users online</button>
                                <div class="Participants bg-light d-none">
                                </div>
                              </div>
                                <div class='chat active-chat' data-chat='person1'></div>
                                <div class="input-group write">
                                  <textarea type="text" class="message-area form-control" placeholder="Message to ${room_name}..." data-active="lobby" rows="2"></textarea>
                                  <div class="input-group-append">
                                  <button class="btn smiley text-primary" type="button">
                                      <i class="far fa-smile icon"></i>
                                      ${emobox}
                                  </button>
                                  <button class="btn send text-primary" type="button" onclick="sendMsg()">
                                      <i class="fas fa-paper-plane icon"></i>
                                  </button>
                                </div>
                                </div>
                          </div>
                        `;
    $('.app-container').append($contentInfo);
    appendUserInfo(room_name, description);
    appendContentInfo(room_name, online, 0);
    $(`#${room_id}-msg`).find('.Participants')[0].innerHTML = convertIntoList(online_users);
  }
});
// destroys room because there are no users in it
socket.on('destroy room', function (data) {
  //redirect user to lobby if the active room is to be destroyed
  if ($(".active").attr("id") == data) {
    $("#lobby").addClass('active');
    $("#lobby-msg").css("display", "inherit");
  }
  $(".error").hide();
  var room_id = convertIntoId(data);
  $(`#${room_id}`).remove();
  $(`#${room_id}-msg`).remove();
});
// notifies when user leaves the room
socket.on('user left room', (data) => {
  let room_id = convertIntoId(data.room);
  notify(`${data.username} just left room  ${data.room}`, "error");
  $(`#${room_id}-msg .room-info button`)[0].innerHTML = data.online + ` user(s) online`;
  $(`#${room_id}-msg`).find('.Participants')[0].innerHTML = convertIntoList(data.online_users);
});
// updates info about number of users
socket.on('update info', (rooms) => {
  let room_id;
  // alert(rooms);
  for (let i = 0; i < rooms.length; i++) {
    room_id = convertIntoId(rooms[i].name);
    $(`#${room_id}-msg .room-info button`)[0].innerHTML = rooms[i].num_users + " user(s) online";
    $(`#${room_id}-msg`).find('.Participants')[0].innerHTML = convertIntoList(rooms[i].users);
  }
});
// updates info about number of users
socket.on('room joined', function (data) {
  const {
    name,
    online,
    online_users
  } = data;
  var room_id = convertIntoId(name);
  $(`#${room_id}-msg .room-info button`)[0].innerHTML = online + " user(s) online";
  $(`#${room_id}-msg`).find('.Participants')[0].innerHTML = convertIntoList(online_users);
});
// Schedule update of timestamps at 12:00am
function scheduleUpdateTs() {
  let current_date = new Date();
  let today_date = new Date(current_date.getFullYear(), current_date.getMonth(), current_date.getDate(), 0, 0, 0);
  let next_date = dateFns.addDays(today_date, 1);
  let ts_diff = dateFns.differenceInSeconds(next_date, current_date);
  if (ts_diff > 0) {
    window.timer = setTimeout(function () {
      updateTimestamps();
      clearTimeout(window.timer);
      scheduleUpdateTs();
    }, ts_diff * 1000);
  }
}
if (!window.timer) {
  scheduleUpdateTs();
}
