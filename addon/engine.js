import Engine from '@ember/engine';

import loadInitializers from 'ember-load-initializers';
import Resolver from 'ember-resolver';

// import config from './config/environment';

// const { modulePrefix } = config;
const modulePrefix = 'pm-ui';

export default class YourEngine extends Engine {
  modulePrefix = modulePrefix;
  Resolver = Resolver;
  dependencies = {
    services: ['docker-item'],
  };
}

loadInitializers(YourEngine, modulePrefix);
