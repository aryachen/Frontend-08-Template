function walker(selector, element, parent) {
  const { classList, id, localName } = element;
  const idRegx = /#\w+/;
  const classRegx = /\.[\w|-]+/ig;
  const tagRegx = /^\w+/i;

  const ids = selector.match(idRegx);
  const classes = selector.match(classRegx);
  const tags = selector.match(tagRegx);
  

  let isMatch = true;

  if (ids && ids[0].replace('#', '') !== id) {
    isMatch = false;
  }

  if (tags && tags[0] !== localName && isMatch) {
    isMatch = false;
  }

  if (classes && isMatch) {
    const allMatch = classes.every(className => {
      return Array.from(classList).includes(className.replace('.', ''));
    });
    if (!allMatch) {
      isMatch = false;
    }
  }

  if (isMatch) {
    return { isMatch: true, element };
  } else {
    if (parent && element.parentNode.nodeName !== 'BODY') {
      return walker(selector, element.parentNode, parent);
    } else {
      return { isMatch: false };
    }
  }
}


export function match(selector, element) {
  const selectorList = selector.split(/\s+/);
  const len = selectorList.length - 1;
  let isMatch = false;
  for (let i = len; i >= 0; i--) {
    const result = walker(selectorList[i], element, i !== length);
    isMatch = result.isMatch;
    if (!isMatch) {
      return false;
    } else {
      element = result.element.parentNode;
    }
  }
  return isMatch;
}