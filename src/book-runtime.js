const position = document.querySelector('#reader-position');
const backButton = document.querySelector('#reader-back');
const forwardButton = document.querySelector('#reader-forward');
const frame = document.querySelector('#canonical-substrate-frame');

const screens = [
  {
    key: 'canonical-substrate',
    label: 'canonical substrate',
    src: 'canonical/theorem_zero_canonical_substrate_v1_0_final.html'
  }
];

let activeScreen = 0;

function activateScreen(index) {
  activeScreen = Math.max(0, Math.min(index, screens.length - 1));
  const screen = screens[activeScreen];
  if (frame && frame.getAttribute('src') !== screen.src) frame.setAttribute('src', screen.src);
  if (position) position.textContent = screen.label;
  if (backButton) backButton.disabled = activeScreen === 0;
  if (forwardButton) forwardButton.disabled = activeScreen === screens.length - 1;
}

function step(delta) {
  activateScreen(activeScreen + delta);
}

backButton?.addEventListener('click', () => step(-1));
forwardButton?.addEventListener('click', () => step(1));

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') step(-1);
  if (event.key === 'ArrowRight') step(1);
});

activateScreen(0);
