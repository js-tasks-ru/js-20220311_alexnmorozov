const orders = {
  asc: 1,
  desc: -1
};

export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = [...data];
    this.init();
  }

  sort(field, order) {
    const sortOrder = orders[order];
    if (!sortOrder) {
      return;
    }   
    const item = this.headerConfig.find(item => item['id'] === field);
    if (item) {
      item.order = order;
      const sortType = item.sortType;
      if (sortType === 'string') {
        this.sortByField(field, sortOrder, (a, b) => a.localeCompare(b, ['ru', 'en'], { 'caseFirst': 'upper' }));
      }
      else if (sortType === 'number') {
        this.sortByField(field, sortOrder, (a, b) => a - b);
      }
    }
    this.clearTable();
    this.fillTable();
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
  }
  fillTable() {
    this.fillHeader();
    this.fillBody();
  }
  fillHeader() {
    const headerHTML = this.headerConfig.reduce((result, item) => result += this.getColumnHeaderHTML(item), '');
    const div = document.createElement('div');
    div.innerHTML = headerHTML;
    this.subElements.header.append(...div.children);
  }
  fillBody() {
    const rowsHTML = this.data.reduce((result, item) => result += this.getRowHTML(item), '');
    const div = document.createElement('div');
    div.innerHTML = rowsHTML;
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

