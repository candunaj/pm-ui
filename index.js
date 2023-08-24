'use strict';

// module.exports = {
//   name: require('./package').name,
//   lazyLoading: {
//     enabled: false,
//   },
//   isDevelopingAddon: function () {
//     return true;
//   },
// };

const EngineAddon = require('ember-engines/lib/engine-addon');

module.exports = EngineAddon.extend({
  name: require('./package').name,

  lazyLoading: Object.freeze({
    enabled: false,
  }),

  isDevelopingAddon() {
    return true;
  },
});
