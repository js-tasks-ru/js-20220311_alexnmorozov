export default class SortableTable {
  constructor(headersConfig = [], {
    data = [],
    sorted: {
      field = '',
      order
    } = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.data = [...data];
    this.init();
    this.sort(field, order);
  }

  sort(field, order = 'desc') {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    if (!direction) {
      return;
    }
    const item = this.headerConfig.find(item => item['id'] === field);
    if (item && item.sortable) {
      this.headerConfig.forEach(item => item.order = null);
      item.order = order;
      const sortType = item.sortType;
      if (sortType === 'string') {
        this.sortByField(field, direction, (a, b) => a.localeCompare(b, ['ru', 'en'], { 'caseFirst': 'upper' }));
      }
      else if (sortType === 'number') {
        this.sortByField(field, direction, (a, b) => a - b);
      }
      this.clearTable();
      this.fillTable();
    }
  }
  clearTable() {
    this.subElements.header.innerHTML = '';
    this.subElements.body.innerHTML = '';
  }
  init() {
    const div = document.createElement('div');
    div.innerHTML = this.getTableHTML();
    this.element = div.firstElementChild;
    this.subElements = {
      header: this.element.querySelector('[data-element=header]'),
      body: this.element.querySelector('[data-element=body]') 
    };
    this.fillTable();
    this.subElements.header.addEventListener("pointerdown", (event) => this._onHeaderClick(event));
  }
  _onHeaderClick(event) {
    const div = event.target.closest('DIV');
    if (!div) {
      return;
    }
    if (div.dataset.sortable !== "true") {
      return;
    }
    const reversedOrders = {
      asc: 'desc',
      desc: 'asc'
    };
    const newOrder = reversedOrders[div.dataset.order];
    this.sort(div.dataset.id, newOrder);
  }
  fillTable() {
    this.fillHeader();
    this.fillBody();
  }
  fillHeader() {
    const headerCells = this.headerConfig.map((item) => this.getColumnHeaderHTML(item));
    const div = document.createElement('div');
    div.innerHTML = headerCells.join('');
    this.subElements.header.append(...div.children);
  }
  fillBody() {
    const rows = this.data.map((item) => this.getRowHTML(item));
    const div = document.createElement('div');
    div.innerHTML = rows.join('');
    this.subElements.body.append(...div.children);
  }
  getTableHTML() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row"></div>
          <div data-element="body" class="sortable-table__body"></div>
        </div>
      </div>
    `;
  }
  getColumnHeaderHTML({
    id = '',
    title = '',
    sortable = false,
    order = ''
  }) {
    const arrowTemplate = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="${order}">
        <span>${title}</span>
        ${sortable ? arrowTemplate : ''}
      </div>
    `;
  }
  getRowHTML(dataRow) {
    const rows = this.headerConfig.map(({template, id}) => {
      const data = dataRow[id];
      if (template) {
        return template(data);
      } else {
        return `<div class="sortable-table__cell">${data}</div>`;
      }
    });
    return `
      <a href="/products/dvd/blu-ray-pleer-sony-dvp-sr760h" class="sortable-table__row">
        ${rows.join('\n')}
      </a>
    `;
  }
  sortByField(field, sortType, comparer) {
    this.data.sort((a, b) => {
      let first = a[field];
      let last = b[field];
      return sortType * comparer(first, last);
    }); 
  }
  destroy() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }
}