/**
 * Method to escape and sanitize string and handling meta-characters in jquery
 * @param {string} name String of room name, or any other name
 */
const convertIntoId = (name) => name.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^{|}~ ]/g, "\\$&");
/**
 * Method to convert an array into an unordered list
 * @param {array} arr Array of items
 */
const convertIntoList = (arr) => {
  let list = `<ul class='pt-2'>`;
  for (let i = 0; i < arr.length; i++) {
    let name = arr[i];
    if (name.slice(arr[i].length - 3, arr[i].length) == 'Bot') {
      list = list.concat(`<li><i class="fas fa-robot"></i> ${name}</li>`);
    } else {
      list = list.concat(`<li><i class="fas fa-user-circle"></i> ${name}</li>`);
    }
  }
  list = list += `</ul>`;
  return list;
}
//sets client username
const setUsername = () => {
  socket.emit('set username', $('#userN').val());
};
// Creates a new room
const createRoom = () => {
  if ($("#roomName").val() == '') return;
  socket.emit('create room', {
    room_name: $('#roomName').val(),
    description: $('#description').val()
  });
  $('#newRoomModal').modal('toggle');
}
// Requests server to join a room
const joinRoom = (room) => {
  const room_id = convertIntoId(room);
  socket.emit('join room', {
    name: room
  });
  $(".error").hide();
  $(`#${room_id}-msg`).attr("data-joined", 1);
  $(`#${room_id}-msg`).show();
}
//requests server to leave a room
const leaveRoom = (room) => {
  var room_id = convertIntoId(room);
  document.getElementById(`lobby-msg`).classList.add("active");
  socket.emit('leave room', {
    name: room
  });
  $(".error").html('<span id="error">You haven\'t joined this room yet. <a onclick="joinRoom( \'' + room + '\' )" id="joinBtn" href="#">Join</a> to see the conversation.</span>');
  $(`#${room_id}-msg`).attr("data-joined", 0);
  $(`#${room_id}-msg`).hide();
  $(".error").show();
}
