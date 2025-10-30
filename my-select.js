const selectTemplate = document.createElement('template');
selectTemplate.innerHTML = `
    <div class="select-container">
        <div class="selected" role="button" tabindex="0">Выберите...</div>
        <ul class="options" role="listbox">
            <!-- динамические опции извне -->
        </ul>
    </div>
`;

const selectStyles = `
    .select-container {
        position: relative;
        display: inline-block;
        width: 200px;
        font-family: Arial, sans-serif;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: white;
        cursor: pointer;
        user-select: none;
    }
    .selected {
        padding: 10px;
        background-color: #f9f9f9;
        border-radius: 4px 4px 0 0;
    }
    .selected:hover {
        background-color: #e9e9e9;
    }
    .options {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        list-style: none;
        margin: 0;
        padding: 0;
        border: 1px solid #ccc;
        border-top: none;
        border-radius: 0 0 4px 4px;
        background-color: white;
        max-height: 150px;
        overflow-y: auto;
        display: none;
        z-index: 10;
    }
    .options.show {
        display: block;
    }
    .options li {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }
    .options li:hover {
        background-color: #f0f0f0;
    }
    .options li:last-child {
        border-bottom: none;
    }
`;

class MySelect extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });

        const templateContent = selectTemplate.content.cloneNode(true);
        this.shadowRoot.appendChild(templateContent);

        const style = document.createElement('style');
        style.textContent = selectStyles;
        this.shadowRoot.appendChild(style);

        this._isOpen = false;
        this.selectedEl = this.shadowRoot.querySelector('.selected');
        this.optionsEl = this.shadowRoot.querySelector('.options');

        this.selectedEl.addEventListener('click', () => this.toggleOptions());
    }

    toggleOptions() {
        this._isOpen ? this.closeOptions() : this.openOptions();
    }

    openOptions() {
        this.optionsEl.classList.add('show');
        this._isOpen = true;
    }

    closeOptions() {
        this.optionsEl.classList.remove('show');
        this._isOpen = false;
    }
}

(function() {
    const script = document.currentScript;
    if (script && script.dataset.name) {
        const componentName = script.dataset.name;
        customElements.define(componentName, MySelect);
        console.log(`Веб-компонент зарегистрирован как '${componentName}'`);
    } else {
        console.error('Не удалось определить имя компонента из data-name атрибута');
    }
})();