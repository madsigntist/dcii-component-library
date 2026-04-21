(() => {
  // src/components/dcii-accordion.js
  var itemTemplate = document.createElement("template");
  itemTemplate.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
  }

  .accordion-item {
    border: 1px solid var(--dcii-accordion-border, #d4d4d4);
    border-radius: var(--dcii-accordion-radius, 5px);
    background: var(--dcii-accordion-bg, #fff);
    overflow: hidden;
  }

  .accordion-item__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: var(--dcii-accordion-padding, 1.25rem);
    border: none;
    background: transparent;
    cursor: pointer;
    font-family: var(--dcii-font-family, inherit);
    font-size: var(--dcii-accordion-header-font-size, 1rem);
    font-weight: var(--dcii-accordion-header-font-weight, 600);
    color: var(--dcii-accordion-header-color, inherit);
    text-align: left;
    transition: background var(--dcii-accordion-transition, 0.25s) ease;
  }

  .accordion-item__header:hover {
    background: var(--dcii-accordion-hover-bg, #f5f5f5);
  }

  .accordion-item__header:focus-visible {
    outline: var(--dcii-accordion-focus-ring, 2px solid #005fcc);
    outline-offset: -2px;
  }

  .accordion-item__icon {
    flex-shrink: 0;
    width: var(--dcii-accordion-icon-size, 0.75rem);
    height: var(--dcii-accordion-icon-size, 0.75rem);
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
    transform: rotate(0deg);
    transition: transform var(--dcii-accordion-transition, 0.25s) ease;
    margin-left: 1rem;
  }

  :host([open]) .accordion-item__icon {
    transform: rotate(180deg);
  }

  .accordion-item__content {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows var(--dcii-accordion-transition, 0.25s) ease;
  }

  :host([open]) .accordion-item__content {
    grid-template-rows: 1fr;
  }

  .accordion-item__inner {
    overflow: hidden;
  }

  .accordion-item__body {
    padding: 0 var(--dcii-accordion-padding, 1.25rem) var(--dcii-accordion-padding, 1.25rem);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<div class="accordion-item" part="item">
  <button
    class="accordion-item__header"
    part="header"
    aria-expanded="false"
  >
    <span class="accordion-item__header-text">
      <slot name="header">Accordion Item</slot>
    </span>
    <span class="accordion-item__icon" aria-hidden="true"></span>
  </button>
  <div class="accordion-item__content" role="region">
    <div class="accordion-item__inner">
      <div class="accordion-item__body" part="body">
        <slot></slot>
      </div>
    </div>
  </div>
</div>
`;
  var DciiAccordionItem = class _DciiAccordionItem extends HTMLElement {
    static #counter = 0;
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {string} */
    #uid;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(itemTemplate.content.cloneNode(true));
      this.#uid = `dcii-acc-${_DciiAccordionItem.#counter++}`;
    }
    static get observedAttributes() {
      return ["open"];
    }
    connectedCallback() {
      const header = this.#shadow.querySelector(".accordion-item__header");
      const content = this.#shadow.querySelector(".accordion-item__content");
      header.id = `${this.#uid}-header`;
      content.id = `${this.#uid}-panel`;
      header.setAttribute("aria-controls", content.id);
      content.setAttribute("aria-labelledby", header.id);
      header.addEventListener("click", this.#toggle);
      header.addEventListener("keydown", this.#onKeydown);
      this.#syncState();
    }
    disconnectedCallback() {
      const header = this.#shadow.querySelector(".accordion-item__header");
      header.removeEventListener("click", this.#toggle);
      header.removeEventListener("keydown", this.#onKeydown);
    }
    attributeChangedCallback() {
      this.#syncState();
    }
    /** Whether this item is open. */
    get open() {
      return this.hasAttribute("open");
    }
    set open(value) {
      if (value) {
        this.setAttribute("open", "");
      } else {
        this.removeAttribute("open");
      }
    }
    /** @return {HTMLButtonElement} */
    get headerButton() {
      return this.#shadow.querySelector(".accordion-item__header");
    }
    #syncState() {
      const header = this.#shadow.querySelector(".accordion-item__header");
      if (!header) {
        return;
      }
      header.setAttribute("aria-expanded", String(this.open));
    }
    #toggle = () => {
      const willOpen = !this.open;
      this.dispatchEvent(
        new CustomEvent("dcii-accordion-toggle", {
          bubbles: true,
          detail: { item: this, open: willOpen }
        })
      );
    };
    #onKeydown = (event) => {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
        event.preventDefault();
        this.dispatchEvent(
          new CustomEvent("dcii-accordion-nav", {
            bubbles: true,
            detail: { key: event.key, item: this }
          })
        );
      }
    };
  };
  var accordionTemplate = document.createElement("template");
  accordionTemplate.innerHTML = `
<style>
  :host {
    display: flex;
    flex-direction: column;
    gap: var(--dcii-accordion-gap, 1rem);
    max-width: var(--dcii-accordion-max-width, 900px);
  }
</style>
<slot></slot>
`;
  var DciiAccordion = class extends HTMLElement {
    /** @type {ShadowRoot} */
    #shadow;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(accordionTemplate.content.cloneNode(true));
    }
    /** @return {boolean} */
    get multiple() {
      return this.hasAttribute("multiple");
    }
    connectedCallback() {
      this.addEventListener("dcii-accordion-toggle", this.#onToggle);
      this.addEventListener("dcii-accordion-nav", this.#onNav);
    }
    disconnectedCallback() {
      this.removeEventListener("dcii-accordion-toggle", this.#onToggle);
      this.removeEventListener("dcii-accordion-nav", this.#onNav);
    }
    /** @return {DciiAccordionItem[]} */
    get #items() {
      return [...this.querySelectorAll("dcii-accordion-item")];
    }
    /**
     * Handles toggle events from items.
     * @param {CustomEvent} event
     */
    #onToggle = (event) => {
      const { item, open } = event.detail;
      if (open && !this.multiple) {
        this.#items.forEach((i) => {
          if (i !== item) {
            i.open = false;
          }
        });
      }
      item.open = open;
    };
    /**
     * Handles keyboard navigation between items.
     * @param {CustomEvent} event
     */
    #onNav = (event) => {
      const { key, item } = event.detail;
      const items = this.#items;
      const index = items.indexOf(item);
      let target;
      switch (key) {
        case "ArrowDown":
          target = items[(index + 1) % items.length];
          break;
        case "ArrowUp":
          target = items[(index - 1 + items.length) % items.length];
          break;
        case "Home":
          target = items[0];
          break;
        case "End":
          target = items[items.length - 1];
          break;
        default:
          return;
      }
      if (target) {
        target.headerButton.focus();
      }
    };
  };
  customElements.define("dcii-accordion-item", DciiAccordionItem);
  customElements.define("dcii-accordion", DciiAccordion);

  // src/components/dcii-modal.js
  var FOCUSABLE = [
    "a[href]",
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(", ");
  var template = document.createElement("template");
  template.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: inline-block;
    font-family: var(--dcii-font-family, inherit);
  }

  .modal__trigger {
    display: inline-block;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--dcii-modal-trigger-radius, 5px);
    background: var(--dcii-modal-trigger-bg, #d6a64c);
    color: var(--dcii-modal-trigger-color, #fff);
    font-family: var(--dcii-font-family, inherit);
    font-size: 1rem;
    cursor: pointer;
    transition: background var(--dcii-modal-transition, 0.25s) ease,
                color var(--dcii-modal-transition, 0.25s) ease;
  }

  .modal__trigger:hover {
    background: var(--dcii-modal-trigger-bg-hover, #333);
    color: var(--dcii-modal-trigger-color-hover, #fff);
  }

  .modal__trigger:focus-visible {
    outline: var(--dcii-modal-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .modal__backdrop {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 9999;
    justify-content: center;
    align-items: center;
    background: var(--dcii-modal-backdrop, rgba(0, 0, 0, 0.5));
    backdrop-filter: blur(4px);
  }

  :host([open]) .modal__backdrop {
    display: flex;
  }

  .modal__panel {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: var(--dcii-modal-max-width, 600px);
    width: 90vw;
    max-height: 85vh;
    overflow-y: auto;
    padding: var(--dcii-modal-padding, 2rem);
    background: var(--dcii-modal-bg, #fff);
    border: 1px solid var(--dcii-modal-border, #d4d4d4);
    border-radius: var(--dcii-modal-radius, 5px);
    box-shadow: var(--dcii-modal-shadow, 0 8px 30px rgba(0, 0, 0, 0.15));
    color: var(--dcii-modal-text-color, inherit);
  }

  .modal__close {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--dcii-modal-close-size, 2rem);
    height: var(--dcii-modal-close-size, 2rem);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--dcii-modal-close-color, #666);
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: color var(--dcii-modal-transition, 0.25s) ease;
  }

  .modal__close:hover {
    color: var(--dcii-modal-close-color-hover, #000);
  }

  .modal__close:focus-visible {
    outline: var(--dcii-modal-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .modal__title {
    font-size: 1.25rem;
    font-weight: 700;
    padding-right: 2rem;
  }

  .modal__body {
    flex: 1;
  }

  .modal__footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  .modal__footer ::slotted(button) {
    display: inline-block;
    padding: 0.6rem 1.25rem !important;
    margin: 0 !important;
    border: 1px solid var(--dcii-modal-btn-border, #d4d4d4) !important;
    border-radius: var(--dcii-modal-btn-radius, 5px);
    background: var(--dcii-modal-btn-bg, #f5f5f5);
    color: var(--dcii-modal-btn-color, #333);
    font-family: var(--dcii-font-family, inherit);
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.25s ease, color 0.25s ease, border-color 0.25s ease;
  }

  .modal__footer ::slotted(button:hover) {
    background: var(--dcii-modal-btn-bg-hover, #e0e0e0);
    color: var(--dcii-modal-btn-color-hover, #000);
    border-color: var(--dcii-modal-btn-border-hover, #bbb);
  }

  .modal__footer ::slotted(button:focus-visible) {
    outline: var(--dcii-modal-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<button class="modal__trigger" part="trigger">
  <slot name="trigger">Open</slot>
</button>

<div class="modal__backdrop" part="backdrop">
  <div
    class="modal__panel"
    part="panel"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <button class="modal__close" aria-label="Close modal">&times;</button>
    <div class="modal__title" id="modal-title">
      <slot name="title"></slot>
    </div>
    <div class="modal__body" part="body">
      <slot></slot>
    </div>
    <div class="modal__footer" part="footer">
      <slot name="footer"></slot>
    </div>
  </div>
</div>
`;
  var DciiModal = class _DciiModal extends HTMLElement {
    static #counter = 0;
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {string} */
    #uid;
    /** @type {HTMLElement|null} */
    #previouslyFocused = null;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(template.content.cloneNode(true));
      this.#uid = `dcii-modal-${_DciiModal.#counter++}`;
    }
    static get observedAttributes() {
      return ["open", "trigger-text"];
    }
    connectedCallback() {
      const trigger = this.#shadow.querySelector(".modal__trigger");
      const close = this.#shadow.querySelector(".modal__close");
      const backdrop = this.#shadow.querySelector(".modal__backdrop");
      const panel = this.#shadow.querySelector(".modal__panel");
      const titleEl = this.#shadow.querySelector("#modal-title");
      titleEl.id = `${this.#uid}-title`;
      panel.setAttribute("aria-labelledby", titleEl.id);
      trigger.addEventListener("click", this.#open);
      close.addEventListener("click", this.#close);
      backdrop.addEventListener("click", this.#onBackdropClick);
      this.addEventListener("keydown", this.#onKeydown);
    }
    disconnectedCallback() {
      const trigger = this.#shadow.querySelector(".modal__trigger");
      const close = this.#shadow.querySelector(".modal__close");
      const backdrop = this.#shadow.querySelector(".modal__backdrop");
      trigger.removeEventListener("click", this.#open);
      close.removeEventListener("click", this.#close);
      backdrop.removeEventListener("click", this.#onBackdropClick);
      this.removeEventListener("keydown", this.#onKeydown);
    }
    attributeChangedCallback(name, oldVal, newVal) {
      if (name === "trigger-text") {
        const trigger = this.#shadow.querySelector(".modal__trigger");
        if (trigger && !this.querySelector('[slot="trigger"]')) {
          trigger.textContent = newVal || "Open";
        }
      }
      if (name === "open") {
        if (this.open) {
          this.#onOpen();
        } else {
          this.#onClose();
        }
      }
    }
    /** Whether the modal is open. */
    get open() {
      return this.hasAttribute("open");
    }
    set open(value) {
      if (value) {
        this.setAttribute("open", "");
      } else {
        this.removeAttribute("open");
      }
    }
    #open = () => {
      this.#previouslyFocused = document.activeElement;
      this.open = true;
    };
    #close = () => {
      this.open = false;
    };
    #onOpen() {
      document.body.style.overflow = "hidden";
      const panel = this.#shadow.querySelector(".modal__panel");
      const close = this.#shadow.querySelector(".modal__close");
      requestAnimationFrame(() => {
        close.focus();
      });
      this.dispatchEvent(new CustomEvent("dcii-modal-open", { bubbles: true }));
    }
    #onClose() {
      document.body.style.overflow = "";
      if (this.#previouslyFocused && this.#previouslyFocused.focus) {
        this.#previouslyFocused.focus();
        this.#previouslyFocused = null;
      }
      this.dispatchEvent(new CustomEvent("dcii-modal-close", { bubbles: true }));
    }
    /**
     * Closes on backdrop click (outside panel).
     * @param {MouseEvent} event
     */
    #onBackdropClick = (event) => {
      if (this.hasAttribute("no-backdrop")) {
        return;
      }
      const panel = this.#shadow.querySelector(".modal__panel");
      if (!event.composedPath().includes(panel)) {
        this.#close();
      }
    };
    /**
     * Keyboard handler — Escape to close, Tab to trap focus.
     * @param {KeyboardEvent} event
     */
    #onKeydown = (event) => {
      if (!this.open) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        this.#close();
        return;
      }
      if (event.key === "Tab") {
        this.#trapFocus(event);
      }
    };
    /**
     * Traps focus within the modal panel.
     * @param {KeyboardEvent} event
     */
    #trapFocus(event) {
      const panel = this.#shadow.querySelector(".modal__panel");
      const shadowFocusable = [...panel.querySelectorAll(FOCUSABLE)];
      const slotted = [...this.querySelectorAll(FOCUSABLE)];
      const allFocusable = [...shadowFocusable, ...slotted];
      if (allFocusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = allFocusable[0];
      const last = allFocusable[allFocusable.length - 1];
      const active = this.#shadow.activeElement || document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  customElements.define("dcii-modal", DciiModal);

  // src/components/dcii-tabs.js
  var DciiTab = class extends HTMLElement {
    static get observedAttributes() {
      return ["label"];
    }
    get label() {
      return this.getAttribute("label") || "Tab";
    }
    set label(value) {
      this.setAttribute("label", value);
    }
    connectedCallback() {
      if (!this.hasAttribute("role")) {
        this.setAttribute("role", "tabpanel");
      }
      this.setAttribute("tabindex", "0");
      this.style.display = "none";
      this.style.outline = "none";
    }
  };
  var tabsTemplate = document.createElement("template");
  tabsTemplate.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: var(--dcii-font-family, inherit);
  }

  .tabs {
    display: flex;
    flex-direction: column;
  }

  .tabs__nav {
    display: flex;
    gap: var(--dcii-tabs-nav-gap, 0);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .tabs__tab {
    padding: var(--dcii-tabs-tab-padding, 0.75rem 1.5rem);
    border: 1px solid var(--dcii-tabs-border, #b8b8b8);
    border-bottom: none;
    border-right: none;
    border-radius: var(--dcii-tabs-radius, 5px) var(--dcii-tabs-radius, 5px) 0 0;
    background: var(--dcii-tabs-tab-bg, transparent);
    color: var(--dcii-tabs-tab-color, inherit);
    font-family: var(--dcii-font-family, inherit);
    font-size: 1rem;
    cursor: pointer;
    transition: background var(--dcii-tabs-transition, 0.25s) ease,
                color var(--dcii-tabs-transition, 0.25s) ease;
    white-space: nowrap;
  }

  .tabs__tab:last-child {
    border-right: 1px solid var(--dcii-tabs-border, #b8b8b8);
  }

  .tabs__tab:hover {
    background: var(--dcii-tabs-tab-bg-hover, #f5f5f5);
    color: var(--dcii-tabs-tab-color-hover, inherit);
  }

  .tabs__tab[aria-selected="true"] {
    background: var(--dcii-tabs-tab-bg-active, #fff);
    color: var(--dcii-tabs-tab-color-active, inherit);
    border-bottom: 1px solid var(--dcii-tabs-tab-bg-active, #fff);
    margin-bottom: -1px;
    position: relative;
    z-index: 1;
  }

  .tabs__tab:focus-visible {
    outline: var(--dcii-tabs-focus-ring, 2px solid #005fcc);
    outline-offset: -2px;
  }

  .tabs__panels {
    border: 1px solid var(--dcii-tabs-border, #b8b8b8);
    border-radius: 0 var(--dcii-tabs-radius, 5px) var(--dcii-tabs-radius, 5px) var(--dcii-tabs-radius, 5px);
    background: var(--dcii-tabs-panel-bg, #fff);
    padding: var(--dcii-tabs-panel-padding, 2rem);
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<div class="tabs" part="tabs">
  <div class="tabs__nav" role="tablist" part="nav"></div>
  <div class="tabs__panels" part="panels">
    <slot></slot>
  </div>
</div>
`;
  var DciiTabs = class _DciiTabs extends HTMLElement {
    static #counter = 0;
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {string} */
    #uid;
    /** @type {HTMLButtonElement[]} */
    #tabButtons = [];
    /** @type {DciiTab[]} */
    #panels = [];
    /** @type {number} */
    #activeIndex = 0;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(tabsTemplate.content.cloneNode(true));
      this.#uid = `dcii-tabs-${_DciiTabs.#counter++}`;
    }
    connectedCallback() {
      const slot = this.#shadow.querySelector("slot");
      slot.addEventListener("slotchange", () => this.#buildTabs());
      this.#buildTabs();
    }
    /** Reads <dcii-tab> children and builds the tablist buttons. */
    #buildTabs() {
      const nav = this.#shadow.querySelector(".tabs__nav");
      nav.innerHTML = "";
      this.#tabButtons = [];
      this.#panels = [...this.querySelectorAll("dcii-tab")];
      this.#panels.forEach((panel, index) => {
        const tabId = `${this.#uid}-tab-${index}`;
        const panelId = `${this.#uid}-panel-${index}`;
        panel.id = panelId;
        panel.setAttribute("aria-labelledby", tabId);
        const btn = document.createElement("button");
        btn.className = "tabs__tab";
        btn.id = tabId;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", String(index === this.#activeIndex));
        btn.setAttribute("aria-controls", panelId);
        btn.setAttribute("tabindex", index === this.#activeIndex ? "0" : "-1");
        btn.textContent = panel.label;
        btn.addEventListener("click", () => this.#selectTab(index));
        btn.addEventListener("keydown", (e) => this.#onKeydown(e, index));
        nav.appendChild(btn);
        this.#tabButtons.push(btn);
      });
      this.#updatePanels();
    }
    /**
     * Activates a tab by index.
     * @param {number} index
     */
    #selectTab(index) {
      this.#activeIndex = index;
      this.#tabButtons.forEach((btn, i) => {
        const selected = i === index;
        btn.setAttribute("aria-selected", String(selected));
        btn.setAttribute("tabindex", selected ? "0" : "-1");
      });
      this.#updatePanels();
      this.#tabButtons[index].focus();
      this.dispatchEvent(
        new CustomEvent("dcii-tab-change", {
          bubbles: true,
          detail: { index, label: this.#panels[index].label }
        })
      );
    }
    /** Shows the active panel, hides others. */
    #updatePanels() {
      this.#panels.forEach((panel, i) => {
        panel.style.display = i === this.#activeIndex ? "" : "none";
        panel.setAttribute("tabindex", i === this.#activeIndex ? "0" : "-1");
      });
    }
    /**
     * Keyboard navigation for the tablist.
     * @param {KeyboardEvent} event
     * @param {number} currentIndex
     */
    #onKeydown(event, currentIndex) {
      const count = this.#tabButtons.length;
      let target = -1;
      switch (event.key) {
        case "ArrowRight":
          target = (currentIndex + 1) % count;
          break;
        case "ArrowLeft":
          target = (currentIndex - 1 + count) % count;
          break;
        case "Home":
          target = 0;
          break;
        case "End":
          target = count - 1;
          break;
        default:
          return;
      }
      event.preventDefault();
      this.#selectTab(target);
    }
  };
  customElements.define("dcii-tab", DciiTab);
  customElements.define("dcii-tabs", DciiTabs);

  // src/components/dcii-image-slider.js
  var template2 = document.createElement("template");
  template2.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    position: relative;
    overflow: hidden;
    background: var(--dcii-slider-bg, #333);
    border-radius: var(--dcii-slider-radius, 0);
  }

  .slider {
    position: relative;
    width: 100%;
    height: var(--dcii-slider-height, 60vh);
  }

  .slider__track {
    display: flex;
    width: 100%;
    height: 100%;
    transition: transform var(--dcii-slider-transition, 0.4s) ease;
  }

  .slider__track--no-transition {
    transition: none;
  }

  .slider__slide {
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }

  .slider__slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* Arrow buttons */
  .slider__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--dcii-slider-arrow-size, 3rem);
    height: var(--dcii-slider-arrow-size, 3rem);
    border: none;
    border-radius: 50%;
    background: var(--dcii-slider-arrow-bg, rgba(0, 0, 0, 0.4));
    color: var(--dcii-slider-arrow-color, #fff);
    cursor: pointer;
    transition: background var(--dcii-slider-transition, 0.25s) ease;
  }

  .slider__arrow:hover {
    background: var(--dcii-slider-arrow-bg-hover, rgba(0, 0, 0, 0.7));
  }

  .slider__arrow:focus-visible {
    outline: var(--dcii-slider-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .slider__arrow--prev {
    left: 1rem;
  }

  .slider__arrow--next {
    right: 1rem;
  }

  .slider__arrow-icon {
    display: block;
    width: 0.65rem;
    height: 0.65rem;
    border-right: 2.5px solid currentColor;
    border-bottom: 2.5px solid currentColor;
  }

  .slider__arrow--prev .slider__arrow-icon {
    transform: rotate(135deg);
    margin-left: 3px;
  }

  .slider__arrow--next .slider__arrow-icon {
    transform: rotate(-45deg);
    margin-right: 3px;
  }

  /* Pagination dots */
  .slider__dots {
    position: absolute;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    z-index: 10;
  }

  .slider__dot {
    width: var(--dcii-slider-dot-size, 0.75rem);
    height: var(--dcii-slider-dot-size, 0.75rem);
    border: 2px solid var(--dcii-slider-dot-color, rgba(255, 255, 255, 0.7));
    border-radius: 50%;
    background: transparent;
    padding: 0;
    cursor: pointer;
    transition: background var(--dcii-slider-transition, 0.25s) ease,
                transform var(--dcii-slider-transition, 0.25s) ease;
  }

  .slider__dot:hover {
    background: var(--dcii-slider-dot-color, rgba(255, 255, 255, 0.7));
    transform: scale(1.15);
  }

  .slider__dot:focus-visible {
    outline: var(--dcii-slider-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .slider__dot--active {
    background: var(--dcii-slider-dot-color-active, #fff);
    transform: scale(1.2);
  }

  /* Live region \u2014 visually hidden */
  .slider__live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<div
  class="slider"
  role="region"
  aria-roledescription="carousel"
  aria-label="Image slider"
  part="slider"
>
  <div class="slider__track"></div>

  <button class="slider__arrow slider__arrow--prev" aria-label="Previous slide" part="arrow-prev">
    <span class="slider__arrow-icon" aria-hidden="true"></span>
  </button>
  <button class="slider__arrow slider__arrow--next" aria-label="Next slide" part="arrow-next">
    <span class="slider__arrow-icon" aria-hidden="true"></span>
  </button>

  <div class="slider__dots" role="tablist" aria-label="Slide navigation" part="dots"></div>

  <div class="slider__live" aria-live="polite" aria-atomic="true"></div>
</div>
`;
  var DciiImageSlider = class extends HTMLElement {
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {HTMLElement[]} */
    #slides = [];
    /** @type {HTMLButtonElement[]} */
    #dots = [];
    /** @type {number} */
    #current = 0;
    /** @type {number|null} */
    #timer = null;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(template2.content.cloneNode(true));
    }
    static get observedAttributes() {
      return ["autoplay", "interval"];
    }
    get autoplay() {
      return this.hasAttribute("autoplay");
    }
    get interval() {
      return parseInt(this.getAttribute("interval"), 10) || 5e3;
    }
    get loop() {
      return !this.hasAttribute("no-loop");
    }
    connectedCallback() {
      this.#buildSlides();
      const prev = this.#shadow.querySelector(".slider__arrow--prev");
      const next = this.#shadow.querySelector(".slider__arrow--next");
      const slider = this.#shadow.querySelector(".slider");
      prev.addEventListener("click", this.#prev);
      next.addEventListener("click", this.#next);
      slider.addEventListener("keydown", this.#onKeydown);
      slider.addEventListener("mouseenter", this.#pauseAutoplay);
      slider.addEventListener("mouseleave", this.#resumeAutoplay);
      slider.addEventListener("focusin", this.#pauseAutoplay);
      slider.addEventListener("focusout", this.#resumeAutoplay);
      if (this.autoplay) {
        this.#startAutoplay();
      }
    }
    disconnectedCallback() {
      this.#stopAutoplay();
    }
    attributeChangedCallback() {
      if (this.autoplay) {
        this.#startAutoplay();
      } else {
        this.#stopAutoplay();
      }
    }
    /** Reads slotted <img> elements and creates internal slides. */
    #buildSlides() {
      const track = this.#shadow.querySelector(".slider__track");
      const dotsContainer = this.#shadow.querySelector(".slider__dots");
      const images = [...this.querySelectorAll("img")];
      track.innerHTML = "";
      dotsContainer.innerHTML = "";
      this.#slides = [];
      this.#dots = [];
      images.forEach((img, index) => {
        const slide = document.createElement("div");
        slide.className = "slider__slide";
        slide.setAttribute("role", "group");
        slide.setAttribute("aria-roledescription", "slide");
        slide.setAttribute("aria-label", img.alt || `Slide ${index + 1} of ${images.length}`);
        const clonedImg = img.cloneNode(true);
        clonedImg.removeAttribute("loading");
        slide.appendChild(clonedImg);
        track.appendChild(slide);
        this.#slides.push(slide);
        const dot = document.createElement("button");
        dot.className = "slider__dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.setAttribute("tabindex", index === 0 ? "0" : "-1");
        dot.addEventListener("click", () => this.#goTo(index));
        dotsContainer.appendChild(dot);
        this.#dots.push(dot);
      });
      this.#goTo(0);
    }
    /**
     * Navigates to a slide by index.
     * @param {number} index
     */
    #goTo(index) {
      if (index < 0 || index >= this.#slides.length) {
        return;
      }
      this.#current = index;
      const track = this.#shadow.querySelector(".slider__track");
      track.style.transform = `translateX(-${index * 100}%)`;
      this.#dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle("slider__dot--active", active);
        dot.setAttribute("aria-selected", String(active));
        dot.setAttribute("tabindex", active ? "0" : "-1");
      });
      const live = this.#shadow.querySelector(".slider__live");
      const alt = this.#slides[index].querySelector("img")?.alt || "";
      live.textContent = `Slide ${index + 1} of ${this.#slides.length}${alt ? `: ${alt}` : ""}`;
      this.dispatchEvent(
        new CustomEvent("dcii-slide-change", {
          bubbles: true,
          detail: { index, total: this.#slides.length }
        })
      );
    }
    #prev = () => {
      const prev = this.loop ? (this.#current - 1 + this.#slides.length) % this.#slides.length : Math.max(0, this.#current - 1);
      this.#goTo(prev);
    };
    #next = () => {
      const next = this.loop ? (this.#current + 1) % this.#slides.length : Math.min(this.#slides.length - 1, this.#current + 1);
      this.#goTo(next);
    };
    /**
     * Keyboard navigation.
     * @param {KeyboardEvent} event
     */
    #onKeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          this.#prev();
          break;
        case "ArrowRight":
          event.preventDefault();
          this.#next();
          break;
        case "Home":
          event.preventDefault();
          this.#goTo(0);
          break;
        case "End":
          event.preventDefault();
          this.#goTo(this.#slides.length - 1);
          break;
        default:
          break;
      }
    };
    #startAutoplay() {
      this.#stopAutoplay();
      this.#timer = setInterval(() => this.#next(), this.interval);
    }
    #stopAutoplay() {
      if (this.#timer !== null) {
        clearInterval(this.#timer);
        this.#timer = null;
      }
    }
    #pauseAutoplay = () => {
      this.#stopAutoplay();
    };
    #resumeAutoplay = () => {
      if (this.autoplay) {
        this.#startAutoplay();
      }
    };
  };
  customElements.define("dcii-image-slider", DciiImageSlider);

  // src/components/dcii-card-slider.js
  var template3 = document.createElement("template");
  template3.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: var(--dcii-font-family, inherit);
  }

  .card-slider {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .card-slider__arrow {
    flex-shrink: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--dcii-card-slider-arrow-size, 2.5rem);
    height: var(--dcii-card-slider-arrow-size, 2.5rem);
    border: 1px solid var(--dcii-card-slider-arrow-border, #d4d4d4);
    border-radius: 50%;
    background: var(--dcii-card-slider-arrow-bg, transparent);
    color: var(--dcii-card-slider-arrow-color, #333);
    cursor: pointer;
    transition: background var(--dcii-card-slider-transition, 0.25s) ease,
                color var(--dcii-card-slider-transition, 0.25s) ease;
  }

  .card-slider__arrow:hover {
    background: var(--dcii-card-slider-arrow-bg-hover, #f0f0f0);
    color: var(--dcii-card-slider-arrow-color-hover, #000);
  }

  .card-slider__arrow:focus-visible {
    outline: var(--dcii-card-slider-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .card-slider__arrow:disabled {
    opacity: 0.3;
    cursor: default;
  }

  .card-slider__arrow-icon {
    display: block;
    width: 0.5rem;
    height: 0.5rem;
    border-right: 2px solid currentColor;
    border-bottom: 2px solid currentColor;
  }

  .card-slider__arrow--prev .card-slider__arrow-icon {
    transform: rotate(135deg);
    margin-left: 2px;
  }

  .card-slider__arrow--next .card-slider__arrow-icon {
    transform: rotate(-45deg);
    margin-right: 2px;
  }

  .card-slider__viewport {
    flex: 1;
    overflow: hidden;
  }

  .card-slider__track {
    display: flex;
    gap: var(--dcii-card-slider-gap, 1.5rem);
    transition: transform var(--dcii-card-slider-transition, 0.35s) ease;
  }

  .card-slider__card {
    flex-shrink: 0;
    width: var(--dcii-card-slider-card-width, 350px);
    padding: var(--dcii-card-slider-card-padding, 1.5rem);
    background: var(--dcii-card-slider-card-bg, #fff);
    border: 1px solid var(--dcii-card-slider-card-border, #d4d4d4);
    border-radius: var(--dcii-card-slider-card-radius, 5px);
  }

  /* Live region \u2014 visually hidden */
  .card-slider__live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<div
  class="card-slider"
  role="region"
  aria-roledescription="carousel"
  aria-label="Card slider"
  part="slider"
>
  <button
    class="card-slider__arrow card-slider__arrow--prev"
    aria-label="Previous cards"
    part="arrow-prev"
  >
    <span class="card-slider__arrow-icon" aria-hidden="true"></span>
  </button>

  <div class="card-slider__viewport">
    <div class="card-slider__track"></div>
  </div>

  <button
    class="card-slider__arrow card-slider__arrow--next"
    aria-label="Next cards"
    part="arrow-next"
  >
    <span class="card-slider__arrow-icon" aria-hidden="true"></span>
  </button>

  <div class="card-slider__live" aria-live="polite" aria-atomic="true"></div>
</div>
`;
  var DciiCardSlider = class extends HTMLElement {
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {HTMLElement[]} */
    #cards = [];
    /** @type {number} */
    #position = 0;
    /** @type {number} */
    #maxPosition = 0;
    /** @type {number} */
    #cardWidth = 0;
    /** @type {number} */
    #gap = 0;
    /** @type {ResizeObserver|null} */
    #resizeObserver = null;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(template3.content.cloneNode(true));
    }
    connectedCallback() {
      this.#buildCards();
      const prev = this.#shadow.querySelector(".card-slider__arrow--prev");
      const next = this.#shadow.querySelector(".card-slider__arrow--next");
      const slider = this.#shadow.querySelector(".card-slider");
      prev.addEventListener("click", this.#prev);
      next.addEventListener("click", this.#next);
      slider.addEventListener("keydown", this.#onKeydown);
      this.#resizeObserver = new ResizeObserver(() => this.#recalc());
      this.#resizeObserver.observe(
        this.#shadow.querySelector(".card-slider__viewport")
      );
    }
    disconnectedCallback() {
      if (this.#resizeObserver) {
        this.#resizeObserver.disconnect();
      }
    }
    /** Reads light DOM children and wraps them in card containers. */
    #buildCards() {
      const track = this.#shadow.querySelector(".card-slider__track");
      track.innerHTML = "";
      this.#cards = [];
      const children = [...this.children];
      children.forEach((child, index) => {
        const card = document.createElement("div");
        card.className = "card-slider__card";
        card.setAttribute("role", "group");
        card.setAttribute("aria-roledescription", "card");
        card.setAttribute(
          "aria-label",
          `Card ${index + 1} of ${children.length}`
        );
        card.appendChild(child.cloneNode(true));
        track.appendChild(card);
        this.#cards.push(card);
      });
      this.#recalc();
    }
    /** Recalculates dimensions and max scroll position. */
    #recalc() {
      if (this.#cards.length === 0) {
        return;
      }
      const track = this.#shadow.querySelector(".card-slider__track");
      this.#gap = parseFloat(getComputedStyle(track).gap) || 0;
      this.#cardWidth = this.#cards[0].offsetWidth + this.#gap;
      const viewport = this.#shadow.querySelector(".card-slider__viewport");
      const visibleCards = Math.floor(viewport.offsetWidth / this.#cardWidth) || 1;
      this.#maxPosition = Math.max(0, this.#cards.length - visibleCards);
      if (this.#position > this.#maxPosition) {
        this.#position = this.#maxPosition;
      }
      this.#updatePosition();
    }
    /** Applies the current position to the track transform. */
    #updatePosition() {
      const track = this.#shadow.querySelector(".card-slider__track");
      track.style.transform = `translateX(-${this.#position * this.#cardWidth}px)`;
      const live = this.#shadow.querySelector(".card-slider__live");
      live.textContent = `Showing card ${this.#position + 1} of ${this.#cards.length}`;
    }
    #prev = () => {
      if (this.#position > 0) {
        this.#position--;
      } else {
        this.#position = this.#maxPosition;
      }
      this.#updatePosition();
    };
    #next = () => {
      if (this.#position < this.#maxPosition) {
        this.#position++;
      } else {
        this.#position = 0;
      }
      this.#updatePosition();
    };
    /**
     * Keyboard navigation.
     * @param {KeyboardEvent} event
     */
    #onKeydown = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          this.#prev();
          break;
        case "ArrowRight":
          event.preventDefault();
          this.#next();
          break;
        default:
          break;
      }
    };
  };
  customElements.define("dcii-card-slider", DciiCardSlider);

  // src/components/dcii-lightbox.js
  var FOCUSABLE2 = [
    "button:not([disabled])",
    '[tabindex]:not([tabindex="-1"])'
  ].join(", ");
  var template4 = document.createElement("template");
  template4.innerHTML = `
<style>
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  :host {
    display: block;
    font-family: var(--dcii-font-family, inherit);
  }

  /* ---- Gallery grid ---- */
  .lightbox__grid {
    display: grid;
    grid-template-columns: repeat(var(--dcii-lightbox-columns, 3), 1fr);
    gap: var(--dcii-lightbox-gap, 1rem);
  }

  .lightbox__grid-item {
    overflow: hidden;
    border-radius: var(--dcii-lightbox-radius, 5px);
    cursor: pointer;
    transition: box-shadow var(--dcii-lightbox-transition, 0.25s) ease,
                transform var(--dcii-lightbox-transition, 0.25s) ease;
  }

  .lightbox__grid-item:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    transform: scale(1.01);
  }

  .lightbox__grid-item:focus-visible {
    outline: var(--dcii-lightbox-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .lightbox__grid-item img {
    display: block;
    width: 100%;
    height: var(--dcii-lightbox-thumb-height, 300px);
    object-fit: cover;
  }

  /* ---- Overlay ---- */
  .lightbox__overlay {
    display: none;
    position: fixed;
    inset: 0;
    z-index: 10000;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: var(--dcii-lightbox-overlay-bg, rgba(0, 0, 0, 0.85));
    backdrop-filter: blur(4px);
  }

  .lightbox__overlay--open {
    display: flex;
  }

  /* ---- Close button ---- */
  .lightbox__close {
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--dcii-lightbox-close-size, 2.5rem);
    height: var(--dcii-lightbox-close-size, 2.5rem);
    border: none;
    background: transparent;
    color: var(--dcii-lightbox-close-color, #fff);
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    transition: opacity var(--dcii-lightbox-transition, 0.25s) ease;
    opacity: 0.7;
  }

  .lightbox__close:hover {
    opacity: 1;
  }

  .lightbox__close:focus-visible {
    outline: var(--dcii-lightbox-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  /* ---- Main image area ---- */
  .lightbox__main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 80vw;
    height: calc(85vh - 200px);
    flex-shrink: 0;
  }

  .lightbox__main img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    display: none;
  }

  .lightbox__main img.lightbox__main-img--active {
    display: block;
  }

  /* ---- Arrow buttons ---- */
  .lightbox__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 10;
    display: flex;
    justify-content: center;
    align-items: center;
    width: var(--dcii-lightbox-arrow-size, 3rem);
    height: var(--dcii-lightbox-arrow-size, 3rem);
    border: none;
    border-radius: 50%;
    background: var(--dcii-lightbox-arrow-bg, rgba(255, 255, 255, 0.15));
    color: var(--dcii-lightbox-arrow-color, #fff);
    cursor: pointer;
    transition: background var(--dcii-lightbox-transition, 0.25s) ease;
  }

  .lightbox__arrow:hover {
    background: var(--dcii-lightbox-arrow-bg-hover, rgba(255, 255, 255, 0.3));
  }

  .lightbox__arrow:focus-visible {
    outline: var(--dcii-lightbox-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .lightbox__arrow--prev {
    left: 1.5rem;
  }

  .lightbox__arrow--next {
    right: 1.5rem;
  }

  .lightbox__arrow-icon {
    display: block;
    width: 0.65rem;
    height: 0.65rem;
    border-right: 2.5px solid currentColor;
    border-bottom: 2.5px solid currentColor;
  }

  .lightbox__arrow--prev .lightbox__arrow-icon {
    transform: rotate(135deg);
    margin-left: 3px;
  }

  .lightbox__arrow--next .lightbox__arrow-icon {
    transform: rotate(-45deg);
    margin-right: 3px;
  }

  /* ---- Thumbnail strip ---- */
  .lightbox__strip {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    padding-top: 1.5rem;
    max-width: 80vw;
    overflow-x: auto;
  }

  .lightbox__strip-thumb {
    flex-shrink: 0;
    width: var(--dcii-lightbox-strip-size, 100px);
    height: var(--dcii-lightbox-strip-size, 100px);
    object-fit: cover;
    border: 3px solid var(--dcii-lightbox-strip-border, transparent);
    border-radius: 4px;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity var(--dcii-lightbox-transition, 0.25s) ease,
                border-color var(--dcii-lightbox-transition, 0.25s) ease;
    padding: 0;
    background: none;
  }

  .lightbox__strip-thumb:hover {
    opacity: 0.85;
  }

  .lightbox__strip-thumb:focus-visible {
    outline: var(--dcii-lightbox-focus-ring, 2px solid #005fcc);
    outline-offset: 2px;
  }

  .lightbox__strip-thumb--active {
    opacity: 1;
    border-color: var(--dcii-lightbox-strip-border-active, #fff);
  }

  /* Live region \u2014 visually hidden */
  .lightbox__live {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>

<div class="lightbox__grid" role="list" aria-label="Image gallery" part="grid"></div>

<div class="lightbox__overlay" part="overlay">
  <button class="lightbox__close" aria-label="Close lightbox">&times;</button>

  <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Previous image" part="arrow-prev">
    <span class="lightbox__arrow-icon" aria-hidden="true"></span>
  </button>
  <button class="lightbox__arrow lightbox__arrow--next" aria-label="Next image" part="arrow-next">
    <span class="lightbox__arrow-icon" aria-hidden="true"></span>
  </button>

  <div class="lightbox__main" role="img" aria-live="polite" part="main"></div>

  <div class="lightbox__strip" role="tablist" aria-label="Image thumbnails" part="strip"></div>

  <div class="lightbox__live" aria-live="polite" aria-atomic="true"></div>
</div>
`;
  var DciiLightbox = class extends HTMLElement {
    /** @type {ShadowRoot} */
    #shadow;
    /** @type {string[]} */
    #sources = [];
    /** @type {string[]} */
    #alts = [];
    /** @type {HTMLImageElement[]} */
    #mainImages = [];
    /** @type {HTMLButtonElement[]} */
    #thumbs = [];
    /** @type {HTMLElement[]} */
    #gridItems = [];
    /** @type {number} */
    #current = 0;
    /** @type {boolean} */
    #isOpen = false;
    /** @type {HTMLElement|null} */
    #previouslyFocused = null;
    constructor() {
      super();
      this.#shadow = this.attachShadow({ mode: "open" });
      this.#shadow.appendChild(template4.content.cloneNode(true));
    }
    static get observedAttributes() {
      return ["columns"];
    }
    get columns() {
      return parseInt(this.getAttribute("columns"), 10) || 3;
    }
    connectedCallback() {
      this.#build();
      const close = this.#shadow.querySelector(".lightbox__close");
      const prev = this.#shadow.querySelector(".lightbox__arrow--prev");
      const next = this.#shadow.querySelector(".lightbox__arrow--next");
      const overlay = this.#shadow.querySelector(".lightbox__overlay");
      close.addEventListener("click", this.#close);
      prev.addEventListener("click", this.#prev);
      next.addEventListener("click", this.#next);
      overlay.addEventListener("click", this.#onOverlayClick);
      this.addEventListener("keydown", this.#onKeydown);
    }
    disconnectedCallback() {
      this.removeEventListener("keydown", this.#onKeydown);
    }
    attributeChangedCallback(name) {
      if (name === "columns") {
        const grid = this.#shadow.querySelector(".lightbox__grid");
        grid.style.setProperty("--dcii-lightbox-columns", String(this.columns));
      }
    }
    /** Reads slotted <img> elements and builds the gallery + overlay. */
    #build() {
      const grid = this.#shadow.querySelector(".lightbox__grid");
      const main = this.#shadow.querySelector(".lightbox__main");
      const strip = this.#shadow.querySelector(".lightbox__strip");
      const images = [...this.querySelectorAll("img")];
      grid.innerHTML = "";
      main.innerHTML = "";
      strip.innerHTML = "";
      grid.style.setProperty("--dcii-lightbox-columns", String(this.columns));
      this.#sources = [];
      this.#alts = [];
      this.#mainImages = [];
      this.#thumbs = [];
      this.#gridItems = [];
      images.forEach((img, index) => {
        const src = img.getAttribute("data-full") || img.src;
        const alt = img.alt || `Image ${index + 1}`;
        this.#sources.push(src);
        this.#alts.push(alt);
        const gridItem = document.createElement("div");
        gridItem.className = "lightbox__grid-item";
        gridItem.setAttribute("role", "listitem");
        gridItem.setAttribute("tabindex", "0");
        gridItem.setAttribute("aria-label", `View ${alt}`);
        const gridImg = document.createElement("img");
        gridImg.src = img.src;
        gridImg.alt = alt;
        gridImg.loading = "lazy";
        gridItem.appendChild(gridImg);
        gridItem.addEventListener("click", () => this.#open(index));
        gridItem.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            this.#open(index);
          }
        });
        grid.appendChild(gridItem);
        this.#gridItems.push(gridItem);
        const mainImg = document.createElement("img");
        mainImg.src = src;
        mainImg.alt = alt;
        mainImg.className = index === 0 ? "lightbox__main-img--active" : "";
        main.appendChild(mainImg);
        this.#mainImages.push(mainImg);
        const thumbBtn = document.createElement("button");
        thumbBtn.className = "lightbox__strip-thumb";
        thumbBtn.setAttribute("role", "tab");
        thumbBtn.setAttribute("aria-label", `View ${alt}`);
        thumbBtn.setAttribute("tabindex", "-1");
        thumbBtn.style.backgroundImage = `url('${img.src}')`;
        thumbBtn.style.backgroundSize = "cover";
        thumbBtn.style.backgroundPosition = "center";
        thumbBtn.addEventListener("click", () => this.#goTo(index));
        strip.appendChild(thumbBtn);
        this.#thumbs.push(thumbBtn);
      });
    }
    /**
     * Opens the lightbox at the given index.
     * @param {number} index
     */
    #open(index) {
      this.#previouslyFocused = document.activeElement;
      this.#isOpen = true;
      const overlay = this.#shadow.querySelector(".lightbox__overlay");
      overlay.classList.add("lightbox__overlay--open");
      document.body.style.overflow = "hidden";
      this.#goTo(index);
      requestAnimationFrame(() => {
        this.#shadow.querySelector(".lightbox__close").focus();
      });
    }
    #close = () => {
      this.#isOpen = false;
      const overlay = this.#shadow.querySelector(".lightbox__overlay");
      overlay.classList.remove("lightbox__overlay--open");
      document.body.style.overflow = "";
      if (this.#previouslyFocused && this.#previouslyFocused.focus) {
        this.#previouslyFocused.focus();
        this.#previouslyFocused = null;
      }
    };
    /**
     * Navigates to a specific image.
     * @param {number} index
     */
    #goTo(index) {
      this.#current = index;
      this.#mainImages.forEach((img, i) => {
        img.classList.toggle("lightbox__main-img--active", i === index);
      });
      this.#thumbs.forEach((thumb, i) => {
        const active = i === index;
        thumb.classList.toggle("lightbox__strip-thumb--active", active);
        thumb.setAttribute("aria-selected", String(active));
        thumb.setAttribute("tabindex", active ? "0" : "-1");
      });
      const live = this.#shadow.querySelector(".lightbox__live");
      live.textContent = `Image ${index + 1} of ${this.#sources.length}: ${this.#alts[index]}`;
    }
    #prev = () => {
      const prev = (this.#current - 1 + this.#sources.length) % this.#sources.length;
      this.#goTo(prev);
    };
    #next = () => {
      const next = (this.#current + 1) % this.#sources.length;
      this.#goTo(next);
    };
    /**
     * Closes on overlay click (outside main image area).
     * @param {MouseEvent} event
     */
    #onOverlayClick = (event) => {
      const main = this.#shadow.querySelector(".lightbox__main");
      const strip = this.#shadow.querySelector(".lightbox__strip");
      if (!event.composedPath().includes(main) && !event.composedPath().includes(strip) && event.target.closest(".lightbox__arrow") === null && event.target.closest(".lightbox__close") === null) {
        this.#close();
      }
    };
    /**
     * Keyboard handler — arrows, Escape, focus trap.
     * @param {KeyboardEvent} event
     */
    #onKeydown = (event) => {
      if (!this.#isOpen) {
        return;
      }
      switch (event.key) {
        case "Escape":
          event.preventDefault();
          this.#close();
          break;
        case "ArrowLeft":
          event.preventDefault();
          this.#prev();
          break;
        case "ArrowRight":
          event.preventDefault();
          this.#next();
          break;
        case "Tab":
          this.#trapFocus(event);
          break;
        default:
          break;
      }
    };
    /**
     * Traps focus within the overlay.
     * @param {KeyboardEvent} event
     */
    #trapFocus(event) {
      const overlay = this.#shadow.querySelector(".lightbox__overlay");
      const focusable = [...overlay.querySelectorAll(FOCUSABLE2)];
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = this.#shadow.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  customElements.define("dcii-lightbox", DciiLightbox);
})();
