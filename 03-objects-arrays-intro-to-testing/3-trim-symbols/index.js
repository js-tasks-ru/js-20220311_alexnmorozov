/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size === undefined) {
    return string;
  }
  const chars = string.split('');
  const result = [];
  let sequenceLength = 0;
  let prevChar;
  for (const char of chars) {
    if (prevChar === char) {
      sequenceLength++;
    } else {
      sequenceLength = 1;
      prevChar = char;
    }
    if (sequenceLength <= size) { 
      result.push(char);
    }
  }
  return result.join('');
}
