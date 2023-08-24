import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service dockerItem;

  @action
  openPopup() {
    this.dockerItem.invokePopup(
      'first',
      {
        id: 'first',
        title: 'First',
        size: 'large',
        custom: false,
        icon: 'fa fa-plus',
      },
      undefined,
      undefined,
      undefined,
      true
    );
  }
}
