/**
 * Mark the tagline paragraph (the first non-button <p> before the h1) inside a
 * hero text group, and tag the group's wrapper as `.hero-text`.
 * @param {Element} scope The element containing the h1 and paragraphs
 */
function markTagline(scope) {
  const h1 = scope.querySelector('h1');
  if (!h1) return;

  const contentDiv = h1.closest('div');
  if (!contentDiv) return;

  const textDiv = contentDiv.parentElement;
  if (textDiv) textDiv.classList.add('hero-text');

  const children = [...contentDiv.children];
  const h1Index = children.indexOf(h1);
  for (let i = 0; i < h1Index; i += 1) {
    if (children[i].tagName === 'P' && !children[i].classList.contains('button-container')) {
      children[i].classList.add('hero-tagline');
      break;
    }
  }
}

/**
 * Decorate the carousel variant: each direct child div is a slide. Adds
 * prev/next controls, dot indicators, keyboard support and auto-rotation.
 * @param {Element} block The hero carousel block
 */
function decorateCarousel(block) {
  const slides = [...block.children];
  slides.forEach((slide, i) => {
    slide.classList.add('hero-slide');
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`);
    if (i !== 0) slide.setAttribute('aria-hidden', 'true');
    markTagline(slide);
  });

  let current = 0;
  const show = (next) => {
    const idx = (next + slides.length) % slides.length;
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === idx);
      if (i === idx) s.removeAttribute('aria-hidden');
      else s.setAttribute('aria-hidden', 'true');
    });
    block.querySelectorAll('.hero-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
      d.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });
    current = idx;
  };

  slides[0].classList.add('active');

  // Controls (prev / next)
  const controls = document.createElement('div');
  controls.className = 'hero-controls';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'hero-nav hero-prev';
  prev.setAttribute('aria-label', 'Previous slide');
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'hero-nav hero-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  controls.append(prev, nextBtn);
  block.append(controls);

  // Dots
  const dots = document.createElement('div');
  dots.className = 'hero-dots';
  dots.setAttribute('role', 'tablist');
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => show(i));
    dots.append(dot);
  });
  block.append(dots);

  // Manual navigation only — no auto-rotation.
  prev.addEventListener('click', () => show(current - 1));
  nextBtn.addEventListener('click', () => show(current + 1));
}

/** @param {Element} block The hero block element */
export default function decorate(block) {
  if (block.classList.contains('carousel')) {
    decorateCarousel(block);
    return;
  }

  const pictures = block.querySelectorAll('picture');

  if (pictures.length >= 2) {
    // Dual-image hero: first = light, second = dark
    const lightDiv = pictures[0].closest('.hero > div');
    const darkDiv = pictures[1].closest('.hero > div');
    if (lightDiv) lightDiv.classList.add('hero-img-light');
    if (darkDiv) darkDiv.classList.add('hero-img-dark');

    // In dark mode, move the dark image first so waitForFirstImage
    // eager-loads the visible (LCP) image rather than the hidden one.
    const isDark = document.body.classList.contains('dark-scheme');
    if (isDark && darkDiv && lightDiv) {
      lightDiv.parentElement.insertBefore(darkDiv, lightDiv);
    }
  } else if (pictures.length < 1) {
    block.classList.add('no-image');
  }

  markTagline(block);
}
