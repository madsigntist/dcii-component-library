/**
 * <dcii-card-slider>
 *
 * Accessible horizontal card carousel (WCAG 2.2 AA).
 * Shows multiple cards at once, navigates with arrows and keyboard.
 *
 * @example
 * <dcii-card-slider>
 *   <div>Card 1 content</div>
 *   <div>Card 2 content</div>
 *   <div>Card 3 content</div>
 * </dcii-card-slider>
 *
 * @attr {string} card-width — Fixed card width (default "350px").
 * @attr {string} gap        — Gap between cards (default "1.5rem").
 *
 * Theme tokens:
 *   --dcii-card-slider-gap
 *   --dcii-card-slider-card-width
 *   --dcii-card-slider-card-bg
 *   --dcii-card-slider-card-border
 *   --dcii-card-slider-card-radius
 *   --dcii-card-slider-card-padding
 *   --dcii-card-slider-arrow-size
 *   --dcii-card-slider-arrow-color
 *   --dcii-card-slider-arrow-bg
 *   --dcii-card-slider-arrow-bg-hover
 *   --dcii-card-slider-focus-ring
 *   --dcii-card-slider-transition
 */

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

  /* Live region — visually hidden */
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

class DciiCardSlider extends HTMLElement {
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
    this.#shadow.appendChild(template.content.cloneNode(true));
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
      this.#shadow.querySelector(".card-slider__viewport"),
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
        `Card ${index + 1} of ${children.length}`,
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
    const visibleCards =
      Math.floor(viewport.offsetWidth / this.#cardWidth) || 1;
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
}

customElements.define("dcii-card-slider", DciiCardSlider);

export { DciiCardSlider };
