class Tooltip {
  static instance = null;
  constructor() {
    if (!Tooltip.instance) {
      Tooltip.instance = this;
    }
    return Tooltip.instance;
  }

  onPointerOut = (event) => {
    this.element.remove();
    document.removeEventListener('pointerout', this.onPointerOut);
    document.removeEventListener('pointermove', this.onPointerMove);
  };
  onPointerMove = (event) => {
    this.setTooltipPosition(event.clientX, event.clientY);
  };

  initialize () {
    const div = document.createElement('div');
    div.className = 'tooltip';
    this.element = div; 
    document.addEventListener('pointerover', event => {
      const target = event.target.closest('[data-tooltip]');
      if (!target) {
        return;
      }
      const tooltip = target.dataset.tooltip;
      this.element.innerHTML = tooltip;
      document.body.append(this.element);
      this.onPointerMove(event);
      document.addEventListener('pointerout', this.onPointerOut);
      document.addEventListener('pointermove', this.onPointerMove);
    });
  }
  render(content) {
    this.element.innerHTML = content;
    document.body.append(this.element);
  }

  setTooltipPosition(x, y) {
    const margin = 10;
    this.element.style.top = y + margin + 'px';
    this.element.style.left = x + margin + 'px';
  }
  destroy() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }
}

export default Tooltip;
