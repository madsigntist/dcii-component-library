/**
 * <dcii-accordion> and <dcii-accordion-item>
 *
 * Accessible accordion component (WCAG 2.2 AA).
 *
 * @example
 * <dcii-accordion>
 *   <dcii-accordion-item>
 *     <span slot="header">Question</span>
 *     <p>Answer content</p>
 *   </dcii-accordion-item>
 * </dcii-accordion>
 *
 * @attr {boolean} multiple — Allow multiple items open at once.
 *
 * Theme tokens (set on :root or the element):
 *   --dcii-accordion-gap
 *   --dcii-accordion-bg
 *   --dcii-accordion-border
 *   --dcii-accordion-radius
 *   --dcii-accordion-padding
 *   --dcii-accordion-header-font-weight
 *   --dcii-accordion-icon-size
 *   --dcii-accordion-transition
 *   --dcii-accordion-focus-ring
 *   --dcii-accordion-hover-bg
 */

/* ----------------------------------------
   DciiAccordionItem
   ---------------------------------------- */

const itemTemplate = document.createElement("template");
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

class DciiAccordionItem extends HTMLElement {
  static #counter = 0;

  /** @type {ShadowRoot} */
  #shadow;

  /** @type {string} */
  #uid;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: "open" });
    this.#shadow.appendChild(itemTemplate.content.cloneNode(true));
    this.#uid = `dcii-acc-${DciiAccordionItem.#counter++}`;
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
        detail: { item: this, open: willOpen },
      }),
    );
  };

  #onKeydown = (event) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "ArrowUp" ||
      event.key === "Home" ||
      event.key === "End"
    ) {
      event.preventDefault();
      this.dispatchEvent(
        new CustomEvent("dcii-accordion-nav", {
          bubbles: true,
          detail: { key: event.key, item: this },
        }),
      );
    }
  };
}

/* ----------------------------------------
   DciiAccordion (parent coordinator)
   ---------------------------------------- */

const accordionTemplate = document.createElement("template");
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

class DciiAccordion extends HTMLElement {
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
}

customElements.define("dcii-accordion-item", DciiAccordionItem);
customElements.define("dcii-accordion", DciiAccordion);

export { DciiAccordion, DciiAccordionItem };
