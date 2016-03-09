import Ember from 'ember';

let { camelize } = Ember.String;

export default Ember.Service.extend({

  init() {
    this._super(...arguments);
    this._flags = Object.create(null);

    this.setUnknownProperty = function(key) {
      throw new Error(`Please use enable/disable to set feature flags. You attempted to set ${key}`);
    };
  },

  setup(flags) {
    this._resetFlags();
    for (let flag in flags) {
      if (flags.hasOwnProperty(flag)) {
        if (!!flags[flag]) {
          this.enable(flag);
        } else {
          this.disable(flag);
        }
      }
    }
  },

  normalizeFlag(flag) {
    return camelize(flag);
  },

  enable(flag) {
    let normalizedFlag = this.normalizeFlag(flag);
    this._flags[normalizedFlag] = true;
    this.notifyPropertyChange(normalizedFlag);
  },

  disable(flag) {
    let normalizedFlag = this.normalizeFlag(flag);
    this._flags[normalizedFlag] = false;
    this.notifyPropertyChange(normalizedFlag);
  },

  isEnabled(feature) {
    let isEnabled = this._featureIsEnabled(feature);
    if (this.logFeatureFlagMissEnabled() && !isEnabled) {
      this.logFeatureFlagMiss(feature);
    }
    return isEnabled;
  },

  _resetFlags() {
    this._flags = Object.create(null);
  },

  _featureIsEnabled(feature) {
    let normalizeFeature = this.normalizeFlag(feature);
    return this._flags[normalizeFeature] || false;
  },

  logFeatureFlagMissEnabled() {
    return !!this.get('config.LOG_FEATURE_FLAG_MISS');
  },

  logFeatureFlagMiss(feature) {
    if (console && console.info) {
      console.info('Feature flag off:', feature);
    }
  },

  unknownProperty(key) {
    return this.isEnabled(key);
  }

});
