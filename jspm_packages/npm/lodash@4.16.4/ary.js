/* */ 
var createWrap = require('./_createWrap');
var ARY_FLAG = 128;
function ary(func, n, guard) {
  n = guard ? undefined : n;
  n = (func && n == null) ? func.length : n;
  return createWrap(func, ARY_FLAG, undefined, undefined, undefined, undefined, n);
}
module.exports = ary;
