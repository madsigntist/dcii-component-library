/**
 * <dcii-tabs> and <dcii-tab>
 *
 * Accessible tabbed interface (WCAG 2.2 AA).
 * Arrow keys to navigate tabs, Tab to enter panel.
 *
 * @example
 * <dcii-tabs>
 *   <dcii-tab label="Tab One">
 *     <p>Panel content</p>
 *   </dcii-tab>
 *   <dcii-tab label="Tab Two">
 *     <p>Panel content</p>
 *   </dcii-tab>
 * </dcii-tabs>
 *
 * Theme tokens:
 *   --dcii-tabs-nav-gap
 *   --dcii-tabs-border
 *   --dcii-tabs-radius
 *   --dcii-tabs-tab-padding
 *   --dcii-tabs-tab-bg
 *   --dcii-tabs-tab-color
 *   --dcii-tabs-tab-bg-active
 *   --dcii-tabs-tab-color-active
 *   --dcii-tabs-tab-border-active
 *   --dcii-tabs-panel-bg
 *   --dcii-tabs-panel-padding
 *   --dcii-tabs-focus-ring
 *   --dcii-tabs-transition
 */

/* ----------------------------------------
   DciiTab (child — holds panel content)
   ---------------------------------------- */

class DciiTab extends HTMLElement {
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
}

/* ----------------------------------------
   DciiTabs (parent — builds tablist + panels)
   ---------------------------------------- */

const tabsTemplate = document.createElement("template");
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

class DciiTabs extends HTMLElement {
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
    this.#uid = `dcii-tabs-${DciiTabs.#counter++}`;
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
        detail: { index, label: this.#panels[index].label },
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
}

customElements.define("dcii-tab", DciiTab);
customElements.define("dcii-tabs", DciiTabs);

export { DciiTabs, DciiTab };
