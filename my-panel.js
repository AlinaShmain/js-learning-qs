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

    :host([collapsed="true"]) .panel-body,
    :host([collapsed="true"]) .panel-footer {
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
    }

    :host([collapsed="true"]) .toggle-icon {
      transform: rotate(180deg);
    }
  `;

  static get observedAttributes() {
    return ["collapsed", "toggleable", "header-style"];
    }

  constructor() {
    super();
  }

  connectedCallback() {
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#createTemplate();

    this.#isCollapsed = this.getAttribute("collapsed") === "true";
    this.#applyCollapsedToHost();
    this.#updateToggleVisibility();
    this.#updateHeaderStyle();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "collapsed") {
      this.#isCollapsed = newValue === "true";
      this.#applyCollapsedToHost();
    } else if (name === "toggleable") {
      this.#updateToggleVisibility();
    } else if (name === "header-style") {
      this.#updateHeaderStyle();
    }
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
    if (
      !this.hasAttribute("toggleable") ||
      this.getAttribute("toggleable") !== "true"
    )
      return;

    this.#isCollapsed = !this.#isCollapsed;
    this.#applyCollapsedToHost();
  }

    #applyCollapsedToHost() {
      if (this.#isCollapsed) {
        this.setAttribute("collapsed", "true");
      } else {
        this.removeAttribute("collapsed");
      }
    }

    #updateToggleVisibility() {
      const isToggleable = this.getAttribute("toggleable") === "true";
      if (this.#toggleButton)
        this.#toggleButton.style.display = isToggleable ? "block" : "none";
    }

    #updateHeaderStyle() {
      const header = this.#shadow.querySelector(".panel-header");
      const style = this.getAttribute("header-style");
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
