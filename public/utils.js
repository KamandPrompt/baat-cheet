/**
 * Method to escape and sanitize string and handling meta-characters in jquery
 * @param {string} name String of room name, or any other name
 */
const convertIntoId = (name) => name.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^{|}~ ]/g, "\\$&");


/**
 * Method to convert an array into an unordered list
 * @param {array} arr Array of items
 */
const convertIntoList = (arr) => {
  let list = `<ul class='pt-2'>`;
  for(let i=0; i<arr.length; i++) {
    name = arr[i];
    if (name.slice(arr[i].length - 3, arr[i].length) == 'Bot') {
      list = list.concat(`<li><i class="fas fa-robot"></i> ${name}</li>`);
    } else {
      list = list.concat(`<li><i class="fas fa-user-circle"></i> ${name}</li>`);
    }
  }
  list = list += `</ul>`;
  return list;
}
