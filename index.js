const PENDING     = 0;
const FULLFILLED  = 1;
const REJECTED    = 2;

function Promise(fn) {
  let value       = null;
  let state       = PENDING;
  const deferreds = [];

  this.toString = () => '[object Promise]';

  this.then = (onFullfilled = null) => {
    return new Promise((resolve) => {
      handle({ onFullfilled, resolve });
    })
  }

  function handle(deferred) {
    if (state === PENDING) {
      deferreds.push(deferred);
      return;
    }
    let ret = deferred.onFullfilled(value);
    deferred.resolve(ret);
  }

  function resolve(newValue) {
    value = newValue;
    state = FULLFILLED;

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
