// utils/request-context.js
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

function setContext(data) {
  asyncLocalStorage.enterWith(data);
}

function getContext() {
  return asyncLocalStorage.getStore() || {};
}

module.exports = { getContext, setContext };
