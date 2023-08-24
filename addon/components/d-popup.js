import classic from 'ember-classic-decorator';
import {
  classNames,
  attributeBindings,
  classNameBindings,
} from '@ember-decorators/component';
import { observes } from '@ember-decorators/object';
import { htmlSafe } from '@ember/template';
import $ from 'jquery';
import Component from '@ember/component';
import Ember from 'ember';
import EmberObject, { action, computed } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';

@classic
class Dimensions extends EmberObject {
  x = 0;
  y = 0;
  w = 0;
  h = 0;
}

@classic
@attributeBindings('positioning:style')
@classNameBindings(
  'screenCoverage',
  'focused:focused',
  'canResize:can-resize',
  'undocked::docked',
  'noMinHeight:no-min-height'
)
@classNames('ui-widget-content', 'popup-container')
export default class DPopup extends Component {
  header = null;
  footer = null;
  icon = null;
  title = null;
  status = 'auto';
  focused = false;
  undocked = false;
  screenHeight = 0;
  origin = null; // current position and dimensions X,Y,W,H
  moving = false; // mover activated flag
  resizing = null; // resizer activated flag
  start = null; // mover/resizer start position X,Y

  get noMinHeight() {
    return this.get('appearance.noMinHeight');
  }

  @action
  undock(status) {
    Ember.Logger.debug('POPUP undock:', status);
    this.set('status', status);
  }

  init() {
    super.init();

    if (this.get('appearance.status')) {
      this.set('status', this.get('appearance.status'));
    }
  }

  // setFocus(position) {
  //   setTimeout(() => {
  //     Ember.$('html, body').animate({
  //       scrollTop: position.y,
  //       scrollLeft: position.x
  //     }, 600);
  //   }, 10);
  // },

  // onFocused: function(a, property) {
  //   if (!property || (property === 'focused' && this.get('focused')) || (property === 'status' && this.get('status') === 'auto')) {
  //     // get popup position and size
  //     let pop = this.actualCoordinates(this.$());
  //     // get window position and size
  //     let win = {
  //       x: Ember.$('body').scrollLeft(),
  //       y: Ember.$('body').scrollTop(),
  //       w: Ember.$(window).width(),
  //       h: Ember.$(window).height()
  //     };
  //
  //     if (win.y > pop.y || win.x > pop.x || pop.y + pop.h > win.h || pop.x + pop.w > win.w) {
  //       this.setFocus(pop);
  //     }
  //   }
  // }.on('didInsertElement').observes('focused', 'status'),

  actualCoordinates(c$) {
    let actual = Dimensions.create({
      x: c$.offset().left,
      y: c$.offset().top,
      w: c$.width(),
      h: c$.height(),
    });
    // Ember.Logger.info("Actual coordinates:", actual);
    return actual;
  }

  cursorPosition(event) {
    let cursor = {
      x: event.pageX,
      y: event.pageY,
    };
    // Ember.Logger.info("Cursor position:", cursor);
    return cursor;
  }

  // keeping all attached jQuery event handlers in one array
  _jQueryEventHandlers = null;

  _registerEventHandler(target, event, handler) {
    $(target).on(event, handler);
    this._jQueryEventHandlers.push({
      target: target,
      event: event,
      handler: handler,
    });
  }

  @observes('popupItem._order')
  orderObserver() {
    this.element.style['z-index'] = 1000 + this.get('popupItem._order');
  }

  @computed('appearance.canResize', 'status')
  get canResize() {
    return (
      (this.get('appearance.canResize') ?? true) &&
      (!this.status || this.status === 'auto')
    );
  }

  @computed('status', 'appearance.size')
  get screenCoverage() {
    switch (this.status) {
      case 'auto':
        return 'auto-size ' + this.get('appearance.size');
      case 'full':
        return 'full-screen';
      case 'left':
        return 'left-half';
      case 'right':
        return 'right-half';
      default:
        return '';
    }
  }

  // hook after initial DOM node render completed
  didInsertElement() {
    super.didInsertElement(...arguments);

    this.orderObserver();

    this.set('_jQueryEventHandlers', []);
    let self = this;

    this._registerEventHandler(this.$('*'), 'mousedown', function () {
      if (!self.get('focused')) {
        self.attrs.onFocus();
      }
    });

    const componentElement = $(`#${this.elementId}`);
    componentElement.draggable({
      handle: '.popup-drag',
      stop: function (event, ui) {
        let position = componentElement.offset().top;
        let cssPos = {
          position: 'absolute',
          top: position + 'px',
        };
        componentElement.css(cssPos);
      },
    });
    componentElement.resizable();
  }

  clearSelection() {
    setTimeout(() => {
      if (document.selection) {
        document.selection.empty();
      } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
      }
    }, 10);
  }

  setScreenPreset(preset) {
    let height = $(window).height();
    this.set('screenHeight', height);
    this.set('status', preset);

    // this.attrs.onHeightChange(height);
    this.clearSelection();
  }

  @computed(
    'origin.{h,w,x,y}',
    'popupItem._order',
    'screenHeight',
    'screenWidth',
    'status'
  )
  get positioning() {
    let origin = this.origin;
    let result = `z-index:${1000 + this.get('popupItem._order')};`;

    if (!origin) {
      origin = this.actualCoordinates(this.$());
      this.set('origin', origin);
    }
    let screenHeight = this.screenHeight;
    if (!screenHeight) {
      screenHeight = $(window).height();
      this.set('screenHeight', screenHeight);
    }

    let screenWidth = this.screenWidth;
    if (!screenWidth) {
      screenWidth = $(window).width();
      this.set('screenWidth', screenWidth);
    }

    switch (this.status) {
      case 'auto':
        break;
      case 'full':
        //result += `height:${screenHeight}px;width:${screenWidth}px;`;
        break;
      case 'left':
      case 'right':
        // width and position are specified in stylesheet
        result = `height:${screenHeight}px;z-index:${
          1000 + this.get('popupItem._order')
        };`;
        break;
      default:
        result = `width:${Math.round(origin.w)}px; height:${Math.round(
          origin.h
        )}px; top:${Math.round(origin.y)}px; left:${Math.round(origin.x)}px;`;
        // Ember.Logger.info("style resulted to:", result);
        break;
    }
    return htmlSafe(result);
  }
}
