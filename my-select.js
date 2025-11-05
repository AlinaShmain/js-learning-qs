class MySelect extends HTMLElement {
  #selectButton;
  #selectPopup;
  #selectPopupSearch;
  #shadow;
  #optionsData = [];
  #selectedOptions = new Set();
  #allCheckbox;

  #styles = `
    :host {
      position: relative;
      display: inline-block;
      font-family: 'Roboto', Arial, sans-serif;
      font-size: 14px;
      --border-radius: var(--host-select-button-border-radius, 8px);              /* Радиус кнопки/попапа */
      --button-bg: var(--host-select-button-background, #fff);                   /* Фон кнопки */
      --button-border: var(--host-select-button-border, 1px solid #ddd);         /* Рамка кнопки */
      --popup-bg: var(--host-select-popup-background, #fff);                     /* Фон попапа */
      --popup-border: var(--host-select-popup-border, 1px solid #ddd);           /* Рамка попапа */
      --popup-shadow: var(--host-select-popup-shadow, 0 4px 12px rgba(0, 0, 0, 0.15)); /* Тень попапа */
      --primary: var(--host-select-primary-color, #007bff);                      /* Акцентный цвет */
      --option-hover-bg: var(--host-select-option-hover-bg, var(--primary));     /* Hover для опций — теперь ссылается на ЛОКАЛЬНУЮ --primary, без цикла! */
    }

  .select-button {
    padding: 8px 12px;
    border: var(--button-border);
    background: var(--button-bg);
    border-radius: var(--border-radius);
    cursor: pointer;
    width: 220px;
    text-align: left;
    transition: all 0.2s ease;
    outline: none;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .select-button:hover {
    border-color: var(--primary, #aaa),
    background: #f9f9f9;
  }

  .select-button:focus {
    box-shadow: 0 0 0 2px var(--primary, rgba(0, 123, 255, 0.25));  /* Теперь --primary для консистентности */
  }

  .select-button-text {
    flex: 1;
  }

  .select-button-icon {
    width: 12px;
    height: 12px;
    transition: transform 0.2s ease;
    fill: var(--primary);
  }

  .select-button.open .select-button-icon {
    transform: rotate(180deg);
  }

  .select-popup {
    display: none;
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    width: 220px;
    border: var(--popup-border);
    background: var(--popup-bg);
    border-radius: var(--border-radius);
    box-shadow: var(--popup-shadow);
    z-index: 1000;
    overflow: hidden;
    animation: fadeIn 0.2s ease;
  }

  .select-popup.open {
    display: block;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .select-popup-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid #eee;
  }

  .all-checkbox {
    margin-right: 8px;
    cursor: pointer;
  }

  .select-popup-search {
    flex: 1;
    padding: 6px 8px;
    box-sizing: border-box;
    border: none;
    font-size: 14px;
  }

  .select-popup-options {
    max-height: 180px;
    overflow-y: auto;
    padding: 0;
  }

  .option {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    cursor: pointer;
    border-bottom: 1px solid #f5f5f5;
    transition: background 0.2s ease;
  }

  .option:hover {
    background: var(--option-hover-bg);
  }

  .option input {
    margin-right: 8px;
  }

  .option span {
    flex: 1;
  }
`;

  constructor() {
    super();
  }

  connectedCallback() {
    // Срабатывает, когда пользовательский элемент впервые добавляется в DOM.
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#createTemplate();
    this.#renderOptions();
  }

  disconnectedCallback() {
    // Срабатывает, когда пользовательский элемент удаляется из DOM.
  }

  adoptedCallback() {
    // Срабатывает, когда пользовательский элемент перемещён в новый документ.
  }

  attributeChangedCallback() {
    // Срабатывает, когда пользовательскому элементу добавляют, удаляют или изменяют атрибут.
  }

  #createTemplate() {
    const selectTemplate = document.createElement("template");

    const stylesContent = this.#styles;
    selectTemplate.innerHTML = `
      <style>${stylesContent}</style>

      <button class="select-button">
        <span class="select-button-text">Выбрать опции</span>
        <svg class="select-button-icon" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 4.5l3 3 3-3z"/>
        </svg>
      </button>

      <div class="select-popup">
        <div class="select-popup-header">
          <input type="checkbox" class="all-checkbox" title="Select all" />
          <input class="select-popup-search" placeholder="Search..." />
        </div>
      </div>
    `;

    this.#shadow.append(selectTemplate.content.cloneNode(true));

    this.#selectButton = this.shadowRoot.querySelector(".select-button");
    this.#selectPopup = this.shadowRoot.querySelector(".select-popup");
    this.#selectPopupSearch = this.#shadow.querySelector(
      ".select-popup-search"
    );
    this.#allCheckbox = this.#shadow.querySelector(".all-checkbox");

    this.#addEventListeners();
  }

  #addEventListeners() {
    this.#selectButton.addEventListener("click", (e) => {
      e.stopPropagation();
      this.#openPopup();
    });

    document.addEventListener("click", (e) => {
      if (!this.#shadow.contains(e.target)) {
        this.#closePopup();
      }
    });

    // иначе тоже всплывает до document
    this.#selectPopup.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    this.#allCheckbox.addEventListener("change", () => {
      this.#toggleAll(this.#allCheckbox.checked);
    });

    // будущий поиск
    this.#selectPopupSearch.addEventListener("input", (e) => {
      const query = e.target.value.toLowerCase();
      console.log("query", query);
    });

    this.#selectPopup.addEventListener("change", (e) => {
      if (
        e.target.type === "checkbox" &&
        !e.target.classList.contains("all-checkbox")
      ) {
        const value = e.target.closest(".option").dataset.value;
        if (e.target.checked) {
          this.#selectedOptions.add(value);
        } else {
          this.#selectedOptions.delete(value);
        }
        this.#updateButton();
        this.#updateAllCheckbox();
      }
    });
  }

  #toggleAll(selected) {
    const optionCheckboxes = this.#selectPopup.querySelectorAll(
      '.option input[type="checkbox"]'
    );
    optionCheckboxes.forEach((cb) => {
      cb.checked = selected;
      const value = cb.closest(".option").dataset.value;
      if (selected) {
        this.#selectedOptions.add(value);
      } else {
        this.#selectedOptions.delete(value);
      }
    });
    this.#updateButton();
    this.#updateAllCheckbox();
  }

  #updateAllCheckbox() {
    if (this.#optionsData.length === 0) {
      this.#allCheckbox.checked = false;
      this.#allCheckbox.indeterminate = false;
      this.#allCheckbox.disabled = true;
      return;
    }

    const allChecked = this.#optionsData.every((opt) =>
      this.#selectedOptions.has(opt.value)
    );
    const someChecked = this.#selectedOptions.size > 0 && !allChecked;

    this.#allCheckbox.checked = allChecked;
    this.#allCheckbox.indeterminate = someChecked;
    this.#allCheckbox.disabled = false;
  }

  #openPopup() {
    this.#selectPopup.classList.toggle("open");
    this.#selectButton.classList.toggle("open");
    this.#updateAllCheckbox();
  }

  #closePopup() {
    this.#selectPopup.classList.remove("open");
    this.#selectButton.classList.remove("open");
  }

  #updateButton() {
    const selectedTexts = Array.from(this.#selectedOptions)
      .map((val) => this.#optionsData.find((opt) => opt.value === val)?.text)
      .filter(Boolean);
    const textElement = this.#shadow.querySelector(".select-button-text");

    if (selectedTexts.length === 0) {
      textElement.textContent = "Выбрать опции";
    } else if (selectedTexts.length === 1) {
      textElement.textContent = selectedTexts[0];
    } else {
      textElement.textContent = `${selectedTexts.length} опций выбрано`;
    }
  }

  #renderOptions() {
    const optionElements = Array.from(this.querySelectorAll("option"));
    if (optionElements.length === 0) {
      console.warn("Ни одной опции не найдено");
      return;
    }

    this.#optionsData = optionElements.map((opt) => ({
      value: opt.value || opt.textContent.trim(),
      text: opt.textContent.trim(),
    }));
    console.log("optionsData", this.#optionsData);

    const optionsList = this.#buildOptionsList(this.#optionsData);

    this.#selectPopup.appendChild(optionsList);

    optionElements.forEach((opt) => opt.remove());
  }

  // принимает массив опций, возвращает готовый <div class="select-popup-options">
  #buildOptionsList(optionsArray) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "select-popup-options";

    const optionTemplate = document.createElement("template");
    optionTemplate.innerHTML = `
            <label class="option">
                <input type="checkbox" />
                <span></span> <!-- Placeholder для текста -->
            </label>
        `;

    optionsArray.forEach((option) => {
      const clone = optionTemplate.content.cloneNode(true);
      const label = clone.querySelector(".option");
      const textSpan = clone.querySelector("span");

      label.dataset.value = option.value;
      textSpan.textContent = option.text;

      if (this.#selectedOptions.has(option.value)) {
        clone.querySelector("input").checked = true;
      }

      optionsContainer.appendChild(clone);
    });

    return optionsContainer;
  }
}

(function () {
  const script = document.currentScript;
  if (script && script.dataset.name) {
    const componentName = script.dataset.name;
    customElements.define(componentName, MySelect);
    console.log(`Веб-компонент зарегистрирован как '${componentName}'`);
  } else {
    console.error("Не удалось определить имя компонента из data-name атрибута");
  }
})();
