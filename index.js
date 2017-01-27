const PENDING     = 0;
const FULLFILLED  = 1;
const REJECTED    = 2;

function Promise(fn) {
  let value       = null;
  let state       = PENDING;
  const deferreds = [];
  const isPromise = (test) => test.toString() === '[object Promise]';

  this.toString = () => '[object Promise]';

  this.then = (onFullfilled = null, onRejected = null) => {
    return new Promise((resolve, reject) => {
      handle({ onFullfilled, onRejected, resolve, reject });
    })
  }

  function handle(deferred) {
    if (state === PENDING) {
      deferreds.push(deferred);
      return;
    }
    const cb = state === FULLFILLED
      ? deferreds.onFullfilled
      : deferreds.onRejected;
    let ret;

    if (cb === null) {
      cb = state === FULLFILLED
        ? deferreds.resolve
        : deferreds.reject;
      cb(value);
      return;
    }

    try {
      ret = cb(value);
      deferred.resolve(ret);
    } catch (e) {
      deferred.reject(e);
    }

  }

  function resolve(newValue) {
    if (newValue && isPromise(newValue)) {
      const then = newValue.then;
      // Use parent promise's 'resolve' as the fullfillment callback
      then.call(newValue, resolve, reject);
      return;
    }

    value = newValue;
    state = FULLFILLED;
    complete();
  }

  function reject(reason) {
    state = REJECTED;
    value = reason;
    complete();
  }

  function complete() {
    asap(() => {
      deferreds.forEach(deferred => handle(deferred));
    });
  }

  fn(resolve);
}

function asap(fn) {
  if (typeof process !== 'undefined' && process.nextTick) {
    // Will be processed in current event loop
    process.nextTick(fn);
  } else {
    // Will be processed after current event loop
    setTimeout(fn, 0);
  }
}

export default Promise;
