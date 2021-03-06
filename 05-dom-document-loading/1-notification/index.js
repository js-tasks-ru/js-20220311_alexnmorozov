export default class NotificationMessage {
  static active = null;

  constructor(mesage = '', {
    duration = 1000,
    type = ''
  } = {}) {
    this.mesage = mesage;
    this.duration = duration;
    const types = {
      success: 'success',
      error: 'error'
    };
    this.type = types[type] || types.success;
    this.init();
  }

  getTemplate() {
    return `
      <div class="notification ${this.type}" style="--value:${Math.floor(this.duration / 1000)}s">
        <div class="timer"></div>
        <div class="inner-wrapper">
        <div class="notification-header">${this.type}</div>
        <div class="notification-body">
          ${this.mesage}
        </div>
        </div>
      </div>
    `;
  }
  show(container = document.body) {
    const active = NotificationMessage.active;
    if (active) {
      active.hide();
    }
    this._show(container);
    this.timerId = setTimeout(() => this._hide(), this.duration);
  }
  _show(container) {
    container.append(this.element);
    NotificationMessage.active = this;
  }
  hide() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this._hide();
    }
  }
  _hide() {
    this.remove();
    NotificationMessage.active = null; 
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  init() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
  }
  destroy() {
    this.hide();
    this.element = null;
  }
}