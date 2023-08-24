import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

interface TopHeaderArgs {
  icon: any;
  title: any;
  status: any;
  minimize: any;
  maximize: any;
  restore: any;
  focus: any;
  close: any;
}

export default class TopHeader extends Component<TopHeaderArgs> {
  @tracked
  finalTitle: any;

  constructor(owner: any, args: TopHeaderArgs) {
    super(owner, args);

    const title = this.args.title;
    if (title === undefined || typeof title === 'string') {
      this.finalTitle = title;
    } else {
      title.perform().then((computedTitle) => {
        this.finalTitle = computedTitle;
      });
    }
  }

  @action
  doubleClick() {
    if (this.args.status === 'full') {
      this.args.restore();
    } else {
      this.args.maximize();
    }
  }
}
