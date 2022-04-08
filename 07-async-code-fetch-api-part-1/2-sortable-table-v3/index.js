import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headersConfig = [], {
    isSortLocally = false,
    url: path,
    chunkLength = 30,
    sorted: {
      id,
      order = 'asc'
    } = {}
  } = {}) {
    this.headerConfig = headersConfig;
    this.id = id;
    this.order = order;
    this.path = path;
    this.isSortLocally = isSortLocally;
    this.chunkLength = chunkLength;
    this.data = [];
    this.render();
  }
  subscribeToEvents() {
    this.subElements.header.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    document.addEventListener("scroll", (event) => this.onScroll());
  }
  onPointerDown(event) {
    const div = event.target.closest('DIV');
    if (!div) {
      return;
    }
    const { id, order } = div.dataset;
    const reversedOrders = {
      asc: 'desc',
      desc: 'asc'
    };
    const newOrder = reversedOrders[order];
    this.sort(id, newOrder);
  }
  async onScroll() {
    const rect = this.element.getBoundingClientRect();
    if (rect.bottom <= document.documentElement.clientHeight && !this.isLoaded) {
      this.isLoaded = true;
      await this.loadDataChunk();
      this.isLoaded = false;
      this.updateTable();
    }
  }
  sortOnClient(id = this.id, order = this.order) {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    if (!direction) {
      return;
    }
    const item = this.headerConfig.find(item => item['id'] === id);
    if (item && item.sortable) {
      this.id = id;
      this.order = order;
      const sortType = item.sortType;
      if (sortType === 'string') {
        this.sortByField(id, direction, (a, b) => a.localeCompare(b, ['ru', 'en'], { 'caseFirst': 'upper' }));
      }
      else if (sortType === 'number') {
        this.sortByField(id, direction, (a, b) => a - b);
      }
      this.updateTable();
    }
  }
  async sortOnServer(id = this.id, order = this.order) {
    this.id = id;
    this.order = order;
    this.data = [];
    await this.loadDataChunk();
    this.updateTable();
  }
  async loadDataChunk() {
    const chunk = await this.loadData(this.id, this.order);
    this.data.push(...chunk);
  }
  async loadData(id, order) {
    const url = new URL(this.path, BACKEND_URL);
    if (id) {
      url.searchParams.append('_sort', id);
    }
    if (order) { 
      url.searchParams.append('_order', order);
    }
    const start = this.data.length;
    url.searchParams.append('_start', start);
    const end = start + this.chunkLength;
    url.searchParams.append('_end', end);
    return await fetchJson(url);
  }
  updateTable() {
    const prevOrderedColumn = this.subElements.header.querySelector('[data-order]');
    if (prevOrderedColumn) {
      delete prevOrderedColumn.dataset.order;
    }
    if (this.id && this.order) {
      const orderedColumn = this.subElements.header.querySelector(`[data-id="${this.id}"]`);
      orderedColumn.dataset.order = this.order;
    }
    this.clearBody();
    this.renderBody();
  }
  clearBody() {
    this.subElements.body.innerHTML = '';
  }
  async render() {
    const div = document.createElement('div');
    div.innerHTML = this.getTableHTML();
    this.element = div.firstElementChild;
    this.subElements = {};
    const elements = div.querySelectorAll('[data-element]');
    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
    this.fillHeader();
    await this.loadDataChunk();
    this.updateTable();
    this.element.className = 'sortable-table';
    this.subscribeToEvents();
  }
  sort(id, order) {
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }
  fillHeader() {
    const headerCells = this.headerConfig.map((item) => this.getColumnHeaderHTML(item));
    const div = document.createElement('div');
    div.innerHTML = headerCells.join('');
    this.subElements.header.append(...div.children);
  }
  renderBody() {
    const rows = this.data.map((item) => this.getRowHTML(item));
    const div = document.createElement('div');
    div.innerHTML = rows.join('');
    this.subElements.body.append(...div.children);
  }
  getTableHTML() {
    return `
      <div class="sortable-table_empty">
        <div data-element="header" class="sortable-table__header sortable-table__row"></div>
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>

        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    `;
  }
  getColumnHeaderHTML({
    id = '',
    title = '',
    sortable = false,
    sortType = ''
  }) {
    const arrowTemplate = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-sorttype="${sortType}">
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
