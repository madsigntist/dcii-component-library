/**
 * <dcii-image-slider>
 *
 * Accessible image carousel (WCAG 2.2 AA).
 * Keyboard navigation, autoplay with pause on hover/focus,
 * live-region announcements for screen readers.
 *
 * @example
 * <dcii-image-slider autoplay interval="5000">
 *   <img src="photo1.jpg" alt="Beach sunset">
 *   <img src="photo2.jpg" alt="Mountain view">
 * </dcii-image-slider>
 *
 * @attr {boolean} autoplay  — Enable auto-advance.
 * @attr {number}  interval  — Milliseconds between slides (default 5000).
 * @attr {boolean} loop      — Wrap around at ends (default true).
 *
 * Theme tokens:
 *   --dcii-slider-height
 *   --dcii-slider-bg
 *   --dcii-slider-radius
 *   --dcii-slider-arrow-size
 *   --dcii-slider-arrow-color
 *   --dcii-slider-arrow-bg
 *   --dcii-slider-arrow-bg-hover
 *   --dcii-slider-dot-size
 *   --dcii-slider-dot-color
 *   --dcii-slider-dot-color-active
 *   --dcii-slider-focus-ring
 *   --dcii-slider-transition
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

  /* Live region — visually hidden */
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

class DciiImageSlider extends HTMLElement {
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
    this.#shadow.appendChild(template.content.cloneNode(true));
  }

  static get observedAttributes() {
    return ["autoplay", "interval"];
  }

  get autoplay() {
    return this.hasAttribute("autoplay");
  }

  get interval() {
    return parseInt(this.getAttribute("interval"), 10) || 5000;
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
        detail: { index, total: this.#slides.length },
      })
    );
  }

  #prev = () => {
    const prev = this.loop
      ? (this.#current - 1 + this.#slides.length) % this.#slides.length
      : Math.max(0, this.#current - 1);
    this.#goTo(prev);
  };

  #next = () => {
    const next = this.loop
      ? (this.#current + 1) % this.#slides.length
      : Math.min(this.#slides.length - 1, this.#current + 1);
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
}

customElements.define("dcii-image-slider", DciiImageSlider);

export { DciiImageSlider };
