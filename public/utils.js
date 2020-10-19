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
  let list = ('<ul>');
  for(let i=0; i<arr.length; i++)	list = list.concat(`<li>${arr[i]}</li>`);
  list = list.concat('</ul>');
  return list;
}