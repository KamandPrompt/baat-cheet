const socket = io();
let username, scrollDiff;

//sets client username
const setUsername = ()=>  {
    socket.emit('set username', $('#userN').val());
};

//sends a message
const sendMessage = (msg)=>  {
    // alert(msg);
    msg = msg.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    room_name = $(".active").attr("id");
    socket.emit('Message Request', {
        msg: msg,
        room: room_name
    });
}

//creates a room
const createRoom = () => {
    if ($("#roomName").val() == '') return;
    socket.emit('create room', {
        room_name: $('#roomName').val(),
        description: $('#description').val()
    });
    $('#newRoomModal').modal('toggle');
}

//requests server to join a room
const joinRoom = (room) => {
    const room_id = convertIntoId(room);
    socket.emit('join room', {
        name: room
    });
    $(".error").hide();
    $(`#${room_id}-msg`).attr("data-joined", 1);
    $(`#${room_id}-msg,.write`).show();
}

//requests server to leave a room


function leaveRoom(room) {
    var room_id = convertIntoId(room);
    document.getElementById(`lobby-msg`).classList.add("active");
    socket.emit('leave room', {
        name: room
    });
    $(".error").html('<span id="error">You haven\'t joined this room yet. <a onclick="joinRoom( \'' + room + '\' )" id="joinBtn" href="#">Join</a> to see the conversation.</span>');

    $(`#${room_id}-msg`).attr("data-joined", 0);
    $(`#${room_id}-msg,.write`).hide();
    $(".error").show();
}

//For handling meta-characters in jquery
const convertIntoId = (name) => name.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^{|}~ ]/g, "\\$&");



//convert an array into list elements
const convertIntoList = (arr) => {
    let list = ('<ul>');
    for(let i=0; i<arr.length; i++)	list = list.concat(`<li>${arr[i]}</li>`);
    list = list.concat('</ul>');
    return list;
}

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
                                <div class='top'><center id='online'><span>${room_name} Room</span>&nbsp;(<a href='#' onclick='leaveRoom("${room_name}")'>Leave room</a>)</center>
                                    <center><button class='btn btn-sm p-0' onclick='collap("${room_name}")'><span>${online} user online</span></button></center>
                                </div>
                                <div class='Participants'>
                                    <center><h2>Participants</h2></center>
                                    <span></span>
                                </div>
                                <div class='chat active-chat' data-chat='person1'></div>
                                <div class="input-group write">
                                  <textarea type="text" class="textarea form-control" placeholder="Message to ${room_name}..." data-active="lobby" rows="2"></textarea>
                                  <div class="input-group-append">
                                    <button class="btn smiley text-primary" type="button">
                                      <i class="far fa-smile icon"></i>
                                      ${emobox}
                                    </button>
                                    <button class="btn send text-primary" type="button">
                                      <i class="fas fa-paper-plane icon"></i>
                                    </button>
                                  </div>
                                </div>
                            </div>
                        `;

    $('.app-container').append($contentInfo);
}

//if server emits user exists, propmt for changing username
socket.on('user exists', (data) => {
    nameError = document.getElementById('nicknameError');
    nameError.innerHTML = 'There is already one person with this nickname, try another one.';
});

//if server emits user set, display rooms to user
socket.on('user set', (data) => {
    username = data.username;
    $("#user").fadeOut();
    $("body").css("background-color", "#f8f8f8");
    $(".wrapper").fadeIn();
    // $(".top[data-chat='person1']").("<center><span> " + data.online + " user(s) online</span><center>");
    $(".top[data-chat='person1']").find("span")[1].innerHTML = data.online + " user(s) online</span>";
    $(".Participants").find('span')[0].innerHTML = convertIntoList(data.online_users);
    socket.username = data.username;
    scrollDiff = $("#lobby-msg").children(".chat")[0].scrollHeight;
});

//notifies users that someone joined baat-cheet

socket.on('user joined', function(data) {
    notify(data.username + " just joined", "info");
    $("#lobby-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
    $(".Participants").find('span')[0].innerHTML = convertIntoList(data.online_users);
});

//notifies users that someone left
socket.on('user left', function(data) {
    notify(data.username + " just left", "error");
});


//notifies users that someone joined a room
socket.on('user join', (data) => {
    const room_id = convertIntoId(data.room);
    if (data.room != "lobby") {
        notify(data.username + " just joined " + data.room + " room!", "info");
        $("#" + room_id + "-msg").find('.top').find('span')[1].innerHTML = data.online + " user(s) online";
        $("#" + room_id + "-msg").find('.Participants').find('span')[0].innerHTML = convertIntoList(data.online_users);
    }
});

//displays message to users
socket.on('Display Message', (data) => {
    let class_name;
    if (socket.username == data.user) {
        class_name = 'self';
    } else {
        class_name = 'others'
    }
    // Adding Emoji
    let p = data.msg;
    let colon1 = p.indexOf(":");
    while (colon1 != -1) {
        let colon2 = p.indexOf(":", colon1 + 1);
        if (colon2 != -1) {
            emoji_name = p.slice(colon1 + 1, colon2);
            position = emoji_names.indexOf(emoji_name)
            if (position != -1) {
                p = p.slice(0, colon1) + "<img class=\"emoji\" src=\"images/emoji/" + emojis[position] + ".png\">" + p.slice(colon2 + 1);
            }
            colon1 = p.indexOf(":", colon2 + 1);
        } else {
            break;
        }
    }

    var dateTime = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    var month = months[dateTime.getMonth()];
    var day = dateTime.getDate().toString();
    var hours = dateTime.getHours().toString();
    var mins = dateTime.getMinutes().toString();
    var secs = dateTime.getSeconds().toString();

    if (hours.length == 1) {
        hours = '0' + hours;
    }
    if (mins.length == 1) {
        mins = '0' + mins;
    }
    if (secs.length == 1) {
        secs = '0' + secs;
    }
    // Format Message
    const div = document.createElement('div');
    const username = document.createElement('small');
    const timestamp = document.createElement('small');
    const userMsg = document.createElement('p');
    //const br = document.createElement('br');
    div.classList.add("card", "mb-3", "w-75", class_name);
    username.classList.add("d-block");
    timestamp.classList.add("d-block");
    userMsg.classList.add("card-text", "mb-0");
    div.setAttribute("data-chat", "person1")
    username.innerText = data.user;
    timestamp.innerText = hours + ":" + mins + ":" + secs + ", " + month + " " + day;
    userMsg.innerHTML = p.replace(/\n/g, '<br>');
    if (class_name == 'self') {
        username.classList.add("text-secondary");
        timestamp.classList.add("text-secondary");
        userMsg.classList.add("text-primary");
        div.innerHTML += "<div class='card-body'>" + username.outerHTML + userMsg.outerHTML + timestamp.outerHTML + "</div>";
    } else {
        div.classList.add("bg-primary");
        div.innerHTML += "<div class='card-body'>" + username.outerHTML + userMsg.outerHTML + timestamp.outerHTML+ "</div>";
    }
  let room_id = convertIntoId(data.room);
    $(`#${room_id}-msg`).children(".chat[data-chat='person1']").append(div)
    room_id = convertIntoId($(".active").attr("id"));
    const height = $(`#${room_id}-msg`).children(".chat")[0].scrollHeight;
    $(`#${room_id}-msg`).children(".chat").scrollTop(height);


    let currRoom = $(".active").attr("id");
    let isJoined = $(`#${room_id}-msg`).attr("data-joined");

    if (socket.username != data.user && currRoom != data.room && isJoined == 1) {
        var p_notif=data.msg;
        notify(`Room ${data.room} | ${data.user}: ${(p_notif.length >= 20) ? p_notif.substr(0, 20) + '...' : p_notif}`, "info");
    }
});

//if room exists, then prompt for another room name

socket.on('room exists', function(data) {
    $('#roomError').show();
    $('#roomError').text(data + ' room already exists! Try another room name');
    setTimeout(() => $('#roomError').hide(), 2000);
    $('#roomName').val("");
});

//displays room to the creator
socket.on('room created self', (data) =>  {
    const { description, room_name, online, online_users } = data;
    let room_id = convertIntoId(room_name);
    appendUserInfo(room_name,description);
    appendContentInfo(room_name,online,1);
    $(`#${room_id}-msg`).find('.Participants').find('span')[0].innerHTML = convertIntoList(online_users);
    $('#roomName').val("");
    $('#description').val("");
});

//displays room to the others
socket.on('room created other', (data) =>{
    if (username) {
        const { description, room_name, online, online_users } = data;
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
                                <div class='top'><center id='online'><span>${room_name} Room</span>&nbsp;(<a href='#' onclick='leaveRoom("${room_name}")'>Leave room</a>)</center>
                                    <center><button class='btn' onclick='collap("${room_name}")'><span>${online} users online</span></button></center>
                                </div>
                                <div class='Participants'>
                                    <center><h2>Participants</h2></center>
                                    <span></span>
                                </div>
                                <div class='chat active-chat' data-chat='person1'></div>
                                <div class="input-group write">
                                  <textarea type="text" class="textarea form-control" placeholder="Message to ${room_name}..." data-active="lobby" rows="2"></textarea>
                                  <div class="input-group-append">
                                    <button class="btn smiley text-primary" type="button">
                                      <i class="far fa-smile icon"></i>
                                      ${emobox}
                                    </button>
                                    <button class="btn send text-primary" type="button">
                                      <i class="fas fa-paper-plane icon"></i>
                                    </button>
                                  </div>
                                </div>
                            </div>
                        `;
        $('.app-container').append($contentInfo);
        appendUserInfo(room_name, description);
        appendContentInfo(room_name,online,0);
        $(`#${room_id}-msg`).find('.Participants').find('span')[0].innerHTML = convertIntoList(online_users);
    }
});

//destroys room because there are no users in it
socket.on('destroy room', function(data) {

    //redirect user to lobby if the active room is to be destroyed
    if ($(".active").attr("id") == data) {
        $("#lobby").addClass('active');
        $("#lobby-msg").css("display", "inherit");
    }

    $(".error").hide();
    $(".write").css("display", "initial");

    var room_id = convertIntoId(data);
    $(`#${room_id}`).remove();
    $(`#${room_id}-msg`).remove();
});

//notifies when user leaves the room
socket.on('user left room', (data) =>  {
    let room_id = convertIntoId(data.room);
    notify(`${data.username} just left room  ${data.room}`, "error");
    $(`#${room_id}-msg`).find('.top').find('span')[1].innerHTML = data.online + ` user(s) online`;
    $(`#${room_id}-msg`).find('.Participants').find('span')[0].innerHTML = convertIntoList(data.online_users);
});

//updates info about number of users
socket.on('update info', (rooms)=> {
    let room_id;
    // alert(rooms);
    for (let i = 0; i < rooms.length; i++) {
        room_id = convertIntoId(rooms[i].name);
        $(`#${room_id}-msg`).find('.top').find('span')[1].innerHTML = rooms[i].num_users + " user(s) online";
        $(`#${room_id}-msg`).find('.Participants').find('span')[0].innerHTML = convertIntoList(rooms[i].users);
    }
});

//updates info about number of users
socket.on('room joined', function(data) {
    const { name, online, online_users } = data;
    var room_id = convertIntoId(name);
    $(`#${room_id}-msg`).find('.top').find('span')[1].innerHTML = online + " user(s) online";
    $(`#${room_id}-msg`).find('.Participants').find('span')[0].innerHTML = convertIntoList(online_users);
});
