const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // Cache TTL 10 minutes

const cacheMethods = {
  set: (key, value) => {
    cache[key] = value;
  },

  get: (key) => {
    return cache[key];
  },
};

module.exports = cacheMethods;