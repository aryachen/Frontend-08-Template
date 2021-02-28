const css = require('css')
let currentToken = null
let currentAttribute = null
let currentTextNode = null
let stack = [{
  type: 'document',
  children: []
}]
const EOF = Symbol('EOF') 

function emit(token) {
  // console.log('token', token)
  const tokenType = token.type
  if (token.tagName === 'p' || token.tagName === 'img' || token.tagName === 'span') {
    // console.log(token.tagName)
  }
  let top = stack[stack.length -1]
  if (tokenType === 'text') {
    if (!currentTextNode) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  } else if (tokenType === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }
    element.tagName = token.tagName
    for (let p in token) {
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })

      }
    }
    computeCss(element)
    top.children.push(element)
    element.parent = top
    if (!token.isSelfClosing) {
      stack.push(element)
    }
    currentTextNode = null
  } else if (tokenType === 'endTag') {
    if (top.tagName != token.tagName) {
      throw new Error('Tag start end doesn\'t match !')
    } else {
      if (top.tagName == 'style') {
        addCssRules(top.children[0].content)
      }
      stack.pop()
    }
    currentTextNode = null
  }
}

let rules = [] 
function addCssRules(text) {
  const ast = css.parse(text)
  // console.log(JSON.stringify(ast, null, '    '))
  rules.push(...ast.stylesheet.rules)
}

function match(element, selector) {
  if (!selector || !element.attributes) {
    return false
  } 
  if (selector.charAt(0) === '#') {
    const attr = element.attributes.filter(attr => attr.name === 'id')[0]
    if (attr && attr.value === selector.replace('#', '')) {
      return true
    }
  } else if (selector.charAt(0) === '.') {
    const attr = element.attributes.filter(attr => attr.name === 'class')[0]
    if (attr && attr.value === selector.replace('.', '')) {
      return true
    }
  } else {
    if (element.tagName === selector) {
      return true
    }
  }
  return false
}

function computeCss(element) {
  // console.log('rules', rules)
  // console.log('element', element)
  const elements = stack.slice().reverse()
  if (!element.computedStyle) {
    element.computedStyle = {}
  }
  for (let rule of rules) {
    const selectorParts = rule.selectors[0].split(' ').reverse()
    if (!match(element, selectorParts[0])) {
      continue
    }
    let matched = false
    let j = 1
    for (let i = 0; i < elements.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++
      }
    }
    if (j >= selectorParts.length) {
      matched = true
    }
    if (matched) {
      // console.log('element', element, 'rule', rule)
      const sp = specificity(rule.selectors[0])
      let computedStyle = element.computedStyle
      for (let declaration of rule.declarations) {
        const prop = declaration.property
        if (!computedStyle[prop]) {
          computedStyle[prop] = {}
        }
        if (!computedStyle[prop].specificity || compare(computedStyle[prop].specificity, sp) < 0) {
          computedStyle[prop].value = declaration.value
          computedStyle[prop].specificity = sp
        }
      }
      // console.log('element.computedStyle', element.computedStyle)
    }
  }

}

function specificity(selector) {
  let p = [0, 0, 0, 0]
  const selectorParts = selector.split(' ')
  for (let part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1] += 1
    } else if (part.charAt(0) === '.') { 
      p[2] += 1
    } else {
      p[3] += 1
    }
  }
  return p

}
function compare(sp1, sp2) {
  return (sp1[0] - sp2[0]) || (sp1[1] - sp2[1]) || (sp1[2] - sp2[2]) || (sp1[3] - sp2[3])
}

function data(c) {
  if (c == '<') {
    return tagOpen
  } else if (c == EOF) {
    emit({
      type: 'EOF'
    })
    return
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}
function tagOpen(c) {
  if (c == '/') {
    return endTagOpen
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    return
  }
}
function endTagOpen(c) { 
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c == '>') {
    
  } else if (c == EOF) {

  } else {

  }
}
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c
    return tagName
  } else if (c == '>') {
    emit(currentToken)
    return data
  } else {
    return tagName
  }
}

function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c == '>' || c == '/' || c == EOF) {
    return afterAttributeName(c)
  } else if (c == '=') {
    // return beforeAttributeValue
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {

  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return afterAttributeName(c)
  }
}

function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return afterAttributeName(c)
  } else if (c == '=') {
    return beforeAttributeValue
  } else if (c == '\u0000') {

  } else if (c == '"' || c == '\'' || c == '<') {

  } else {
    currentAttribute.name += c
    return attributeName 
  }
}

function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c == '/' || c == '>' || c == EOF) {
    return beforeAttributeValue(c)
  } else if (c == '"') {
    return doubleQuoteAttributeValue
  } else if (c == '\'') {
    return singleQuoteAttributeValue
  } else if (c == '>') {

  } else {
    return UnquoteAttributeValue(c)
  }
}

function doubleQuoteAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuoteAttributeValue
  } else if (c == '\u0000') {

  } else if (c == EOF) { 

  } else {
    currentAttribute.value += c
    return doubleQuoteAttributeValue
  }
}
function singleQuoteAttributeValue(c) {
  if (c == '\'') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuoteAttributeValue
  } else if (c == '\u0000') {

  } else if (c == EOF) { 

  } else {
    currentAttribute.value += c
    return singleQuoteAttributeValue
  }
}

function afterQuoteAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c == '/') {
    return selfClosingStartTag
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == EOF) {
    
  } else {
    currentAttribute.value += c
    return afterQuoteAttributeValue
  }
}
function UnquoteAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c == '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    return selfClosingStartTag
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c == '\u0000') {

  } else if (c == '"' || c == '\'' || c == '<' || c == '=' || c == '`') {

  } else if (c == EOF) {
    
  } else {
    currentAttribute.value += c
    return UnquoteAttributeValue
  }
}
function selfClosingStartTag(c) {
  if (c == '>') {
    currentToken.isSelfClosing = true
    return data
  } else if (c == 'EOF') {

  } else {

  }
}
module.exports.parseHTML = function parseHTML(html) {
  // console.log('parser', html)
  let state = data
  for (let c of html) {
    state = state(c)
  }
  state = state(EOF)
  return stack[0]
}