class MyCard extends HTMLElement {
  #shadow;
  #headerElement;
  #subHeaderElement;

  #styles = `
    :host {
      display: block;
      border: var(--host-card-border, 1px solid #ddd);
      border-radius: var(--host-card-border-radius, 8px);
      background: var(--host-card-background, #fff);
      box-shadow: var(--host-card-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
      overflow: hidden;
    }

    .card-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .card-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--host-card-header-bg, #f5f5f5);
      border-bottom: 1px solid #eee;
      font-weight: bold;
    }

    .card-sub-header {
      display: flex;
      align-items: center;
      padding: 8px 16px;
      background: var(--host-card-sub-header-bg, #fafafa);
      border-bottom: 1px solid #eee;
      font-size: 0.9em;
      color: var(--host-card-sub-header-color, #666);
    }

    .card-body {
      display: block;
      padding: 16px;
      box-sizing: border-box;
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
    }

    .card-footer {
      padding: 12px 16px;
      background: var(--host-card-footer-bg, transparent);
      flex: 0 0 auto;
    }
  `;

  static get observedAttributes() {
    return ["header", "sub-header"];
  }

  constructor() {
    super();
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#createTemplate();
    this.#updateHeader();
    this.#updateSubHeader();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "header") {
      this.#updateHeader();
    } else if (name === "sub-header") {
      this.#updateSubHeader();
    }
  }

  #createTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
      <style>${this.#styles}</style>
      <div class="card-wrapper">
        <div class="card-header">
          <span id="header-text">Default header</span>
        </div>
        <div class="card-sub-header">
          <span id="sub-header-text"></span>
        </div>
        <div class="card-body">
          <slot name="content">This is the sub-header</slot>
          <slot></slot>
        </div>
        <div class="card-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;

    this.#shadow.append(template.content.cloneNode(true));
    this.#headerElement = this.#shadow.querySelector("#header-text");
    this.#subHeaderElement = this.#shadow.querySelector("#sub-header-text");
  }

  #updateHeader() {
    const headerValue = this.getAttribute("header") || "Default header";
    if (this.#headerElement) {
      this.#headerElement.textContent = headerValue;
    }
  }

  #updateSubHeader() {
    const subHeaderValue = this.getAttribute("sub-header") || "This is the sub-header";
    if (this.#subHeaderElement) {
      this.#subHeaderElement.textContent = subHeaderValue;
    }
  }
}

(function () {
  const script = document.currentScript;
  if (script && script.dataset.name) {
    const componentName = script.dataset.name;
    customElements.define(componentName, MyCard);
    console.log(`Веб-компонент зарегистрирован как '${componentName}'`);
  } else {
    console.error("Не удалось определить имя компонента из data-name атрибута");
  }
})();
