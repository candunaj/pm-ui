import classic from 'ember-classic-decorator';
import { classNames } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

@classic
@classNames('popups-container')
export default class Layout extends Component {
  @service('docker-item')
  docker;

  @computed('docker.popups.[]', 'docker.popups.@each.isFromEngine')
  get popups() {
    return this.docker.popups.filter((d) => d.isFromEngine);
  }

  @action
  onDock(popup) {
    this.docker.minimizePopup(popup);
  }

  @action
  onFocus(popup) {
    this.docker.focusPopup(popup);
  }

  @action
  onClose(popup) {
    this.docker.removePopup(popup);
  }
}
