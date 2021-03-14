function walker(selector, element, parent) {
  const { classList, id, localName } = element;
  const idRegx = /#\w+/;
  const classRegx = /.[\w|-]+/ig;
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
      console.log('ddd', className,  Array.from(classList));
      return Array.from(classList).includes(className.replace('.', ''));
    });
    if (!allMatch) {
      isMatch = false;
    }
  }
  
  if (isMatch) {
    return true;
  } else {
    if (parent && element.parentNode.nodeName !== 'BODY') {
      return walker(selector, element.parentNode, parent);
    } else {
      return false;
    }
  }
}


function match(selector, element) {
  const selectorList = selector.split(/\s+/);
  const len = selectorList.length - 1;
  let isMatch = false;
  for (let i = len; i >= 0; i--) {
    isMatch = walker(selectorList[i], element, i !== length);
    if (!isMatch) {
      return false;
    }
  }
  return isMatch;
}