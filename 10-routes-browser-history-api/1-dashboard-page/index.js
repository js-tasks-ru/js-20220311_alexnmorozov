import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {
  onDateSelected = (event) => {
    const { from, to } = event.detail;
    this.update(from, to);
  };

  render() {
    const from = new Date();
    from.setDate(from.getDate() - 30);
    const to = new Date();
    this.rangePicker = this.createRangePicker(from, to);
    this.ordersChart = this.createOrdersChart(from, to);
    this.salesChart = this.renderSalesChart(from, to);
    this.customersChart = this.renderCustomersChart(from, to);
    this.sortableTable = this.renderSortableTable(from, to);

    this.subElements = {
      rangePicker: this.rangePicker.element,
      ordersChart: this.ordersChart.element,
      salesChart: this.salesChart.element,
      customersChart: this.customersChart.element,
      sortableTable: this.sortableTable.element
    };

    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;

    const topPanel = this.element.querySelector('.content__top-panel');
    topPanel.append(this.subElements.rangePicker);

    const chartsContainer = this.element.querySelector('.dashboard__charts');
    chartsContainer.append(this.subElements.ordersChart);
    chartsContainer.append(this.subElements.salesChart);
    chartsContainer.append(this.subElements.customersChart);

    this.element.append(this.subElements.sortableTable);

    this.subElements.rangePicker.addEventListener('date-select', this.onDateSelected);

    return this.element;
  }
  async update(from, to) {
    await Promise.all([
      this.ordersChart.loadData(from, to),
      this.salesChart.loadData(from, to),
      this.customersChart.loadData(from, to),
      this.sortableTable.loadData(from, to)
    ]);
  }
  createRangePicker(from, to) {
    return new RangePicker({ from, to });
  }
  createOrdersChart(from, to) {
    return new ColumnChart({
      label: 'Заказы',
      link: '/sales',
      url: 'api/dashboard/orders',
      range: {
        from,
        to
      }
    });
  }
  renderSalesChart(from, to) {
    return new ColumnChart({
      label: 'Продажи',
      url: 'api/dashboard/sales',
      formatHeading: (data) => `$${(new Intl.NumberFormat('en-US')).format(data)}`,
      range: {
        from,
        to
      }
    });
  }
  renderCustomersChart(from, to) {
    return new ColumnChart({
      label: 'Клиенты',
      url: 'api/dashboard/customers',
      range: {
        from,
        to
      }
    });
  }
  renderSortableTable(from, to) {
    return new SortableTable(header, {
      url: `api/dashboard/bestsellers?from=${from}&to=${to}`,
      range: {
        from,
        to
      }
    });
  }
  getTemplate() {
    return `
      <div>
        <div class="content__top-panel">
          <h2 class="page-title">Панель управления</h2>
        </div>
        <div class="dashboard__charts">
        </div>
        <h3 class="block-title">Лидеры продаж</h3>
      </div>
    `;
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
    this.element = null;
  }
  destroy() {
    this.rangePicker.destroy();
    this.ordersChart.destroy();
    this.salesChart.destroy();
    this.customersChart.destroy();
    this.sortableTable.destroy();
    this.remove();
  }
}
