/**
 * <dcii-lightbox>
 *
 * Accessible gallery lightbox (WCAG 2.2 AA).
 * Renders a grid of thumbnails; click opens a fullscreen
 * lightbox with prev/next navigation, thumbnail strip,
 * keyboard support, and focus trap.
 *
 * @example
 * <dcii-lightbox columns="3">
 *   <img src="photo1.jpg" alt="Sunset over ocean">
 *   <img src="photo2.jpg" alt="Forest trail">
 *   <img src="photo3.jpg" alt="Mountain peak">
 * </dcii-lightbox>
 *
 * @attr {number} columns — Grid columns (default 3).
 *
 * Theme tokens:
 *   --dcii-lightbox-gap
 *   --dcii-lightbox-radius
 *   --dcii-lightbox-thumb-height
 *   --dcii-lightbox-overlay-bg
 *   --dcii-lightbox-arrow-size
 *   --dcii-lightbox-arrow-color
 *   --dcii-lightbox-arrow-bg
 *   --dcii-lightbox-arrow-bg-hover
 *   --dcii-lightbox-close-size
 *   --dcii-lightbox-close-color
 *   --dcii-lightbox-strip-size
 *   --dcii-lightbox-strip-border
 *   --dcii-lightbox-strip-border-active
 *   --dcii-lightbox-focus-ring
 *   --dcii-lightbox-transition
 */

const FOCUSABLE = [
  "button:not([disabled])",
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
    display: block;
    font-family: var(--dcii-font-family, inherit);
  }

  /* ---- Gallery grid ---- */
  .lightbox__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--dcii-lightbox-gap, 1rem);
  }

  @media (min-width: 480px) {
    .lightbox__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 768px) {
    .lightbox__grid {
      grid-template-columns: repeat(var(--dcii-lightbox-columns, 3), 1fr);
    }
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

  /* Live region — visually hidden */
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

class DciiLightbox extends HTMLElement {
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
    this.#shadow.appendChild(template.content.cloneNode(true));
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

      /* Grid thumbnail */
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

      /* Main lightbox image */
      const mainImg = document.createElement("img");
      mainImg.src = src;
      mainImg.alt = alt;
      mainImg.className = index === 0 ? "lightbox__main-img--active" : "";
      main.appendChild(mainImg);
      this.#mainImages.push(mainImg);

      /* Strip thumbnail (button for accessibility) */
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
    const prev =
      (this.#current - 1 + this.#sources.length) % this.#sources.length;
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
    if (
      !event.composedPath().includes(main) &&
      !event.composedPath().includes(strip) &&
      event.target.closest(".lightbox__arrow") === null &&
      event.target.closest(".lightbox__close") === null
    ) {
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
    const focusable = [...overlay.querySelectorAll(FOCUSABLE)];

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
}

customElements.define("dcii-lightbox", DciiLightbox);

export { DciiLightbox };
