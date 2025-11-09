class MyPanel extends HTMLElement {
  #shadow;
  #toggleButton;
  #isCollapsed = false;

  #styles = `
    :host {
      display: block;
      border: var(--host-panel-border, 1px solid #ddd);
      border-radius: var(--host-panel-border-radius, 8px);
      background: var(--host-panel-background, #fff);
      box-shadow: var(--host-panel-shadow, 0 2px 8px rgba(0, 0, 0, 0.1));
      overflow: hidden;
    }

    .panel-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    .panel-header {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      background: var(--host-panel-header-bg, #f5f5f5);
      border-bottom: 1px solid #eee;
    }

    .panel-body {
      display: block;
      padding: 16px;
      box-sizing: border-box;
      flex: 1 1 auto;
      min-height: 0;
      overflow: auto;
      transition: max-height 0.25s ease, padding 0.25s ease;
      max-height: 2000px;
    }

    .panel-footer {
      padding: 12px 16px;
      background: var(--host-panel-footer-bg, transparent);
      flex: 0 0 auto;
      transition: max-height 0.25s ease, padding 0.2s ease;
      max-height: 1000px;
      overflow: hidden;
    }

    .toggle-button {
      background: none;
      border: none;
      cursor: pointer;
      margin-left: auto;
      padding: 4px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .toggle-button:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .toggle-icon {
      width: 16px;
      height: 16px;
      transition: transform 0.3s;
      fill: var(--host-panel-primary-color, #007bff);
    }

    :host([data-collapsed="true"]) .panel-body,
    :host([data-collapsed="true"]) .panel-footer {
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    :host([data-collapsed="true"]) .toggle-icon {
      transform: rotate(180deg);
    }
  `;

  constructor() {
    super();
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#createTemplate();

    this.#isCollapsed = this.dataset.collapsed === "true";
    this.#applyCollapsedToHost();
    this.#updateToggleVisibility();
    this.#updateHeaderStyle();

    this._observer = new MutationObserver((mutations) => {
        for (const m of mutations) {
            if (m.type === "attributes" && m.attributeName.startsWith("data-")) {
                this.#onDataAttributeChanged(m.attributeName);
            }
        }
    });
    this._observer.observe(this, { attributes: true });
  }

  #createTemplate() {
    const template = document.createElement("template");
    template.innerHTML = `
      <style>${this.#styles}</style>
      <div class="panel-wrapper">
        <div class="panel-header">
            <slot name="header"></slot>
            <button class="toggle-button" aria-label="Toggle panel">
            <svg class="toggle-icon" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 12l-6-6h12z"/>
            </svg>
            </button>
        </div>

        <div class="panel-body">
            <slot name="content"></slot>

            <slot>
                <!-- Тут будет весь контент, который не был размечен как slot -->
            </slot>
        </div>

        <div class="panel-footer">
            <slot name="footer"></slot>
        </div>
      </div>
    `;

    this.#shadow.append(template.content.cloneNode(true));

    this.#toggleButton = this.#shadow.querySelector(".toggle-button");
    this.#toggleButton.addEventListener("click", this.#toggle.bind(this));
  }

  #toggle() {
    const toggleable = this.dataset.toggleable === "true";
    if (!toggleable) return;

    this.#isCollapsed = !this.#isCollapsed;
    this.dataset.collapsed = this.#isCollapsed ? "true" : "false";
    this.#applyCollapsedToHost();
  }

  #onDataAttributeChanged(attrName) {
    if (attrName === "data-collapsed") {
      const val = this.dataset.collapsed === "true";
      if (val !== this.#isCollapsed) {
        this.#isCollapsed = val;
        this.#applyCollapsedToHost();
      }
    } else if (attrName === "data-toggleable") {
      this.#updateToggleVisibility();
    } else if (attrName === "data-header-style") {
      this.#updateHeaderStyle();
    }
  }

  #applyCollapsedToHost() {
    if (this.#isCollapsed) {
      this.setAttribute("data-collapsed", "true");
    } else {
      this.removeAttribute("data-collapsed");
    }
  }

  #updateToggleVisibility() {
    const isToggleable = this.dataset.toggleable === "true";
    if (this.#toggleButton)
      this.#toggleButton.style.display = isToggleable ? "block" : "none";
  }

  #updateHeaderStyle() {
    const header = this.#shadow.querySelector(".panel-header");
    const style = this.dataset.headerStyle;
    if (header) {
        header.style.cssText = style || "";
    }
  }
}

(function () {
  const script = document.currentScript;
  if (script && script.dataset.name) {
    const componentName = script.dataset.name;
    customElements.define(componentName, MyPanel);
    console.log(`Веб-компонент зарегистрирован как '${componentName}'`);
  } else {
    console.error("Не удалось определить имя компонента из data-name атрибута");
  }
})();
