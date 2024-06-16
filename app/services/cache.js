const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL 10 minutes

function setCache(key, value) {
  cache.set(key, value);
}

function getCache(key) {
  return cache.get(key);
}

module.exports = { setCache, getCache };
