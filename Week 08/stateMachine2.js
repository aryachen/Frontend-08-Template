function match(str) {
  let state = start
  for (let c of str) {
    state = state(c)
  }
  return state === end
}
function end() {
  return end
}
function start(c) {
  return c === 'a' ? findB : start
}
function findB(c) {
  return c === 'b' ? findA2 : start(c)
}
function findA2(c) {
  return c === 'a' ? findB2 : start(c)
}
function findB2(c) {
  return c === 'b' ? findA3 : start(c)
}
function findA3(c) {
  return c === 'a' ? findB3 : start(c)
}
function findB3(c) {
  return c === 'b' ? findX : start(c)
}
function findX(c) {
  return c === 'x' ? end : findA3(c)
}

console.log(match('fdasababababxfdsa'))
