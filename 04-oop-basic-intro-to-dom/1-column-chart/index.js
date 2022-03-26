export default class ColumnChart {
  chartHeight = 50;
  constructor({
    data = [],
    label = '',
    link = '',
    value = 0,
    formatHeading = data => data
  } = {}) {
    this.label = label;
    this.link = link;
    this.value = value;
    this.formatHeading = formatHeading;
    this.update(data);
  }

  update(data) {
    this.data = [...data];
    this.element = null;
    this.render();
    if (this.data.length > 0) {
      const elem = this.element.querySelector('.column-chart_loading');
      if (elem) {
        elem.className = 'column-chart';
      }
    }
  }
  getTemplate() {
    return `
<div class="column-chart_loading" style="--chart-height: ${this.chartHeight}">
  <div class="column-chart__title">
    ${this.label}
    ${this.getColumnChartLinkTemplate()}
  </div>
  <div class="column-chart__container">
    <div data-element="header" class="column-chart__header">${this.formatHeading(this.value)}</div>
      <div data-element="body" class="column-chart__chart">
        ${this.getColumnTemplate()}
      </div>
    </div>
  </div>
</div>
    `;
  }
  getColumnChartLinkTemplate() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }
  getColumnTemplate() {
    const result = [];
    const maxValue = Math.max(...this.data);
    for (const value of this.data) {
      const ratio = value / maxValue;
      const val = ratio * this.chartHeight;
      result.push(`<div style="--value: ${Math.floor(val)}" data-tooltip="${(ratio * 100).toFixed(0)}%"></div>`);
    }
    return result.join('\n');
  }
  render() {
    if (this.element) {
      return;
    }
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
  }
}
