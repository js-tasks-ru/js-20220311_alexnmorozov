import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  onSubmit = async (event) => {

  }

  constructor (productId) {
    this.productId = productId;
  }

  save() {
    const eventName = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(eventName));
  }
  async loadProducs() {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.append('id', this.productId);
    return await fetchJson(url);
  }
  async loadCategories() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.append('_sort', 'weight');
    url.searchParams.append('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async render () {
    const categories = await this.loadCategories();
    let products;
    if (this.productId) {
      products = await this.loadProducs();
    }
    const product = products[0];
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate(product, categories);
    this.element = div.firstElementChild;
    this.subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
    const button = this.element.querySelector('#save');
    button.onclick = () => this.save();
    this.fillForm(product);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    return this.element;
  }
  fillForm(product) {
    const form = this.subElements.productForm;
    form.elements.title.value = product.title;
    form.elements.description.value = product.description;
    form.elements.price.value = product.price;
    form.elements.discount.value = product.discount;
    form.elements.quantity.value = product.quantity;
    form.elements.status.value = product.status;
  }
  getTemplate(product, categories) {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            ${product ? this.getImageListContainerTemplate(product.images) : ''}
            <button type="button" name="uploadImage" class="button-primary-outline fit-content">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.getSubcategoryOptions(categories)}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" id="save" name="save" class="button-primary-outline">
              ${product ? 'Сохранить товар' : 'Добавить товар'}
            </button>
          </div>
        </form>
      </div>
    `;
  }
  getSubcategoryOptions(categories) {
    return categories.map(category => {
      return category.subcategories.map(subcategory => {
        const text = escapeHtml(`${category.title} > ${subcategory.title}`);
        return `<option value="kormlenie-i-gigiena">${text}</option>`; 
      });
    });
  }
  getImageListContainerTemplate(items) {
    return `
      <div data-element="imageListContainer">
        <ul class="sortable-list">
          ${items.map(item => this.getImageItemTemplate(item)).join('')}
        </ul>
      </div>
    `;
  }
  getImageItemTemplate(item) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
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
