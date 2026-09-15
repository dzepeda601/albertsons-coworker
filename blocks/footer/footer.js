import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment (skip if aem-embed already provided content)
  // metadata-independent dual path: /content first (localhost), then root (DA/EDS prod)
  if (block.textContent === '') {
    const fragment = await loadFragment('/content/footer').catch(() => null)
      || await loadFragment('/footer').catch(() => null);
    if (!fragment) return;

    block.textContent = '';
    const footer = document.createElement('div');
    while (fragment.firstElementChild) footer.append(fragment.firstElementChild);
    block.append(footer);
  }

  const sections = block.querySelectorAll('.section');

  // First section = link columns; mark it and each column for the grid layout.
  if (sections.length) {
    sections[0].classList.add('footer-columns');
    sections[0]
      .querySelectorAll(':scope > .default-content-wrapper, :scope > div > div')
      .forEach((col) => {
        if (col.querySelector('h3, h4, ul')) col.classList.add('footer-column');
      });
  }

  // Last section = copyright / legal strip.
  if (sections.length > 1) {
    sections[sections.length - 1].classList.add('footer-legal');
  }
}
