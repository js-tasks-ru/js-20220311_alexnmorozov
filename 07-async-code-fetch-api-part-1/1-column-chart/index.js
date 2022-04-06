import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  chartHeight = 50;
  constructor({
    url: path,
    range = {},
    label = '',
    link = '',
    formatHeading = data => data
  } = {}) {
    this.path = path;
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.render();
    this.update(this.range.from, this.range.to);
  }

  async update(from, to) {
    const url = new URL(this.path, BACKEND_URL);
    if (from) {
      url.searchParams.append('from', from);
    }
    if (to) {
      url.searchParams.append('to', to);
    }
    this.data = await fetchJson(url);
    const values = Object.values(this.data);
    if (values && values.length > 0) {
      this.subElements.body.innerHTML = this.getColumnTemplate(values);
      const value = values.reduce((total, val) => total + val, 0);
      this.subElements.header.textContent = value;
      this.element.className = 'column-chart';
    }
    return this.data;
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
      </div>
    </div>
  </div>
<div>
    `;
  }
  getColumnChartLinkTemplate() {
    return this.link ? `<a href="${this.link}" class="column-chart__link">View all</a>` : '';
  }
  getColumnTemplate(data) {
    const result = [];
    const maxValue = Math.max(...data);
    for (const value of data) {
      const ratio = value / maxValue;
      const val = ratio * this.chartHeight;
      result.push(`<div style="--value: ${Math.floor(val)}" data-tooltip="${(ratio * 100).toFixed(0)}%"></div>`);
    }
    return result.join('\n');
  }
  render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    this.subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
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
  