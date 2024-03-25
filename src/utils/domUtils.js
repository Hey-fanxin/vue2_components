export const getScrollElement = (target, container) => {
  if (isWindow(container)) {
    return target.ownerDocument.documentElement;
  }
  return container;
};
export const isWindow = (val) => {
  return val === window;
};
export const isClient =
  typeof window !== "undefined" && typeof document !== "undefined";
export const getOffsetTop = (el) => {
  let offset = 0;
  let parent = el;

  while (parent) {
    offset += parent.offsetTop;
    parent = parent.offsetParent;
  }

  return offset;
};
export const getOffsetTopDistance = (el, containerEl) => {
  return Math.abs(getOffsetTop(el) - getOffsetTop(containerEl));
};

export function animateScrollTo(container, from, to, duration, callback) {
  const startTime = Date.now();

  let handle = 0;
  const scroll = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(
      time > duration ? duration : time,
      from,
      to,
      duration
    );

    if (isWindow(container)) {
      container.scrollTo(window.pageXOffset, nextScrollTop);
    } else {
      container.scrollTop = nextScrollTop;
    }
    if (time < duration) {
      handle = rAF(scroll);
    } else if (typeof callback === "function") {
      callback();
    }
  };

  scroll();

  return () => {
    handle && cAF(handle);
  };
}
export function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return (cc / 2) * t * t * t + b;
  }
  return (cc / 2) * ((t -= 2) * t * t + 2) + b;
}
export const rAF = (fn) =>
  isClient ? window.requestAnimationFrame(fn) : setTimeout(fn, 16);

export const cAF = (handle) =>
  isClient ? window.cancelAnimationFrame(handle) : clearTimeout(handle);
export const throttleByRaf = (cb) => {
  let timer = 0;

  const throttle = (...args) => {
    if (timer) {
      cAF(timer);
    }
    timer = rAF(() => {
      cb(...args);
      timer = 0;
    });
  };

  throttle.cancel = () => {
    cAF(timer);
    timer = 0;
  };

  return throttle;
};
export const getScrollTop = (container) => {
  if (isWindow(container)) {
    return window.scrollY;
  }
  return container.scrollTop;
};

export const useResizeObserver = function useResizeObserver(
  target,
  callback,
  options
) {
  let observer = undefined;
  const isSupported = window && "ResizeObserver" in window;

  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = undefined;
    }
  };
  if (isSupported && window) {
    cleanup();
    observer = new ResizeObserver(callback);
    target && observer.observe(target, options);
  }
  return {
    observer,
    cleanup,
  };
};
export const useElementBounding = (target, callback) => {
  const result = {
    height: 0,
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  };
  function update() {
    if (!target) {
      callback && callback({ ...result });
      return;
    }
    const rect = target.getBoundingClientRect();
    result.height = rect.height;
    result.bottom = rect.bottom;
    result.left = rect.left;
    result.right = rect.right;
    result.top = rect.top;
    result.width = rect.width;
    result.x = rect.x;
    result.y = rect.y;
    callback && callback({ ...result });
  }

  const ob = useResizeObserver(target, update);
  return { ob, update };
};
export const getScrollContainer = (el, isVertical) => {
  if (!isClient) return;

  let parent = el;
  while (parent) {
    if ([window, document, document.documentElement].includes(parent))
      return window;

    if (isScroll(parent, isVertical)) return parent;

    parent = parent.parentNode;
  }

  return parent;
};
export const isScroll = (el, isVertical) => {
  if (!isClient) return false;

  const key = {
    undefined: "overflow",
    true: "overflow-y",
    false: "overflow-x",
  }[String(isVertical)];
  const overflow = getStyle(el, key);
  return ["scroll", "auto", "overlay"].some((s) => overflow.includes(s));
};
export const getStyle = (element, styleName) => {
  if (!isClient || !element || !styleName) return "";

  let key = camelize(styleName);
  if (key === "float") key = "cssFloat";
  try {
    const style = element.style[key];
    if (style) return style;
    const computed = document.defaultView?.getComputedStyle(element, "");
    return computed ? computed[key] : "";
  } catch {
    return element.style[key];
  }
};
function cached(fn) {
  var cache = Object.create(null);
  return function cachedFn(str) {
    var hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
}

/**
 * Camelize a hyphen-delimited string.
 */
var camelizeRE = /-(\w)/g;
var camelize = cached(function (str) {
  return str.replace(camelizeRE, function (_, c) {
    return c ? c.toUpperCase() : "";
  });
});
