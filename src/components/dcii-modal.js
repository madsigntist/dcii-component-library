/**
 * <dcii-modal>
 *
 * Accessible modal dialog (WCAG 2.2 AA).
 * Focus trap, Escape to close, backdrop click to close,
 * returns focus to trigger on close.
 *
 * @example
 * <dcii-modal trigger-text="Open Modal">
 *   <span slot="title">Modal Title</span>
 *   <p>Body content goes here.</p>
 *   <button slot="footer">Confirm</button>
 * </dcii-modal>
 *
 * @attr {string}  trigger-text — Label for the built-in trigger button.
 * @attr {boolean} open         — Reflects open state (set programmatically).
 * @attr {boolean} no-backdrop  — Disable backdrop click-to-close.
 *
 * Theme tokens:
 *   --dcii-modal-backdrop
 *   --dcii-modal-bg
 *   --dcii-modal-border
 *   --dcii-modal-radius
 *   --dcii-modal-padding
 *   --dcii-modal-max-width
 *   --dcii-modal-shadow
 *   --dcii-modal-close-size
 *   --dcii-modal-close-color
 *   --dcii-modal-focus-ring
 *   --dcii-modal-transition
 *   --dcii-modal-trigger-bg
 *   --dcii-modal-trigger-color
 *   --dcii-modal-trigger-bg-hover
 *   --dcii-modal-trigger-color-hover
 *   --dcii-modal-trigger-radius
 */

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const template = document.createElement("template");
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

class DciiModal extends HTMLElement {
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
    this.#uid = `dcii-modal-${DciiModal.#counter++}`;
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
}

customElements.define("dcii-modal", DciiModal);

export { DciiModal };
