class MySelect extends HTMLElement {
	#selectButton;
	#selectPopup;
	#selectPopupSearch;
	#optionsBox;
	#optionsData = []; // [{ value: 'opt1', text: 'Option 1' }, ...]
	#isOpen = false;

	#styles = {
		host: `
			  position: relative;
			  display: inline-block;
			  font-family: 'Roboto', Arial, sans-serif;
			  font-size: 14px;
		  `,
		selectButton: `
			  padding: 12px 16px;
			  border: 1px solid #ddd;
			  background: #fff;
			  border-radius: 8px;
			  cursor: pointer;
			  width: 250px;
			  text-align: left;
			  transition: all 0.2s ease;
			  outline: none;
			  position: relative;
		  `,
		selectButtonHover: `
			  border-color: #aaa;
			  background: #f9f9f9;
		  `,
		selectButtonFocus: `
			  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
		  `,
		selectButtonAfter: ` /* Стрелка */
			  content: '▼';
			  position: absolute;
			  right: 12px;
			  top: 50%;
			  transform: translateY(-50%);
			  font-size: 12px;
			  color: #666;
			  transition: transform 0.2s ease;
		  `,
		selectPopup: `
			  display: none;
			  position: absolute;
			  top: calc(100% + 4px);
			  left: 0;
			  width: 100%;
			  border: 1px solid #ddd;
			  background: #fff;
			  border-radius: 8px;
			  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			  z-index: 1000;
			  overflow: hidden;
		  `,
		selectPopupSearch: `
			  width: 100%;
			  padding: 10px 12px;
			  box-sizing: border-box;
			  border: none;
			  border-bottom: 1px solid #eee;
			  font-size: 14px;
		  `,
		selectPopupOptions: `
			  max-height: 200px;
			  overflow-y: auto;
		  `,
		option: `
			  display: block;
			  padding: 10px 12px;
			  cursor: pointer;
			  border-bottom: 1px solid #f5f5f5;
			  transition: background 0.2s ease;
		  `,
		optionHover: `
			  background: #f0f8ff;
			  color: #333;
		  `,
		optionInput: `
			  margin-right: 8px;
		  `,
	};

	constructor() {
		super();

		this.attachShadow({ mode: "open" });
	}

	connectedCallback() {
		// Срабатывает, когда пользовательский элемент впервые добавляется в DOM.
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
		selectTemplate.innerHTML = `
    	     <button class="select-button"><!--Здесь будет выбранная опция--></button>
		
    	     <div class="select-popup">
    	        <input class="select-popup-search" placeholder="Search..." />
    	        <!--Здесь будет список опций-->
    	    </div>
    	`;
		this.shadowRoot.append(selectTemplate.content.cloneNode(true));

		const css = `
		  :host { ${this.#styles.host} }
		  .select-button { ${this.#styles.selectButton} }
		  .select-button:hover { ${this.#styles.selectButtonHover} }
		  .select-button:focus { ${this.#styles.selectButtonFocus} }
		  .select-button::after { ${this.#styles.selectButtonAfter} }
		  .select-popup { ${this.#styles.selectPopup} }
		  .select-popup-search { ${this.#styles.selectPopupSearch} }
		  .select-popup-options { ${this.#styles.selectPopupOptions} }
		  .option { ${this.#styles.option} }
		  .option:hover { ${this.#styles.optionHover} }
		  .option input { ${this.#styles.optionInput} }
		`;
		const style = document.createElement("style");
		style.textContent = css;
		this.shadowRoot.appendChild(style);

		this.#selectButton = this.shadowRoot.querySelector(".select-button");
		this.#selectPopup = this.shadowRoot.querySelector(".select-popup");
		this.#selectPopupSearch = this.shadowRoot.querySelector(
			".select-popup-search"
		);
		// this.#optionsBox = this.shadowRoot.querySelector(
		// 	".select-popup-options"
		// );

		this.#addEventListeners();
	}

	#addEventListeners() {
		this.#selectButton.addEventListener("click", (e) => {
			e.stopPropagation();
			this.#toggleOptions();
		});

		document.addEventListener("click", (e) => {
			if (!this.shadowRoot.contains(e.target)) {
				this.#closeOptions();
			}
		});

		// иначе тоже всплывает до document
		this.#selectPopup.addEventListener("click", (e) => {
			e.stopPropagation();
		});

		// будущий поиск
		this.#selectPopupSearch.addEventListener("input", (e) => {
			const query = e.target.value.toLowerCase();
			console.log("query", query);
		});

		// будущая обработка выбора опции
		this.#selectPopup.addEventListener("change", (e) => {
			if (e.target.type === "checkbox") {
				const value = e.target.closest(".option").dataset.value;
				console.log("checked val", value, e.target.checked);
			}
		});
	}

	#toggleOptions() {
		this.#isOpen = !this.#isOpen;
		this.#selectPopup.style.display = this.#isOpen ? "block" : "none";
	}

	#closeOptions() {
		this.#isOpen = false;
		this.#selectPopup.style.display = "none";
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
		console.error(
			"Не удалось определить имя компонента из data-name атрибута"
		);
	}
})();
