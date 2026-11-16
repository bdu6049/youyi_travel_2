const legacyPlaces = new Set([
  'machinery', 'museum', 'yilou', 'fenglin', 'flag-site', 'architecture',
  'youth', 'fields', 'park',
]);

function followOldPlaceLink() {
  const fragment = window.location.hash.slice(1);
  if (legacyPlaces.has(fragment)) window.location.replace(`place-${fragment}.html`);
  if (['directory', 'carnival', 'chengfu'].includes(fragment)) window.location.replace('places.html');
}

followOldPlaceLink();
window.addEventListener('hashchange', followOldPlaceLink);

const carousel = document.querySelector('[data-carousel]');

if (carousel) {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const controls = carousel.querySelector('[data-controls]');
  const caption = carousel.querySelector('[data-slide-caption]');
  const counter = carousel.querySelector('[data-slide-count]');
  const toggle = carousel.querySelector('[data-slide-toggle]');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let requested = 0;
  let timer;
  let paused = reducedMotion.matches;

  function schedule() {
    clearTimeout(timer);
    if (!paused && !document.hidden) {
      timer = setTimeout(() => show(1), 7000);
    }
  }

  function setPaused(value) {
    paused = value;
    toggle.textContent = paused ? '播放' : '暂停';
    toggle.setAttribute('aria-label', paused ? '播放封面轮播' : '暂停封面轮播');
    schedule();
  }

  async function show(step) {
    clearTimeout(timer);
    const index = (requested + step + slides.length) % slides.length;
    requested = index;
    const incoming = slides[index];
    if (incoming.dataset.src) {
      incoming.src = incoming.dataset.src;
      delete incoming.dataset.src;
    }
    await incoming.decode().catch(() => {});
    if (index !== requested) return;
    if (incoming.naturalWidth) {
      slides[current].hidden = true;
      incoming.hidden = false;
      current = index;
      caption.textContent = incoming.alt;
      counter.textContent = `${index + 1} / ${slides.length}`;
    }
    schedule();
  }

  for (const button of controls.querySelectorAll('[data-slide-step]')) {
    button.addEventListener('click', () => show(Number(button.dataset.slideStep)));
  }
  toggle.addEventListener('click', () => setPaused(!paused));
  reducedMotion.addEventListener('change', (event) => setPaused(event.matches));
  document.addEventListener('visibilitychange', schedule);
  counter.textContent = `1 / ${slides.length}`;
  controls.hidden = false;
  setPaused(paused);
}

const provinceMap = document.querySelector('[data-province-map]');

if (provinceMap) {
  const regions = [...provinceMap.querySelectorAll('[data-region]')];
  const picker = provinceMap.querySelector('[data-province-picker]');
  const select = provinceMap.querySelector('[data-region-select]');
  const info = provinceMap.querySelector('[data-region-info]');
  const name = provinceMap.querySelector('[data-region-name]');
  const summary = provinceMap.querySelector('[data-region-summary]');
  const close = provinceMap.querySelector('[data-region-close]');
  let activeRegion;

  function showRegion(region) {
    activeRegion?.removeAttribute('aria-current');
    activeRegion = region;
    select.value = region.dataset.region;
    region.setAttribute('aria-current', 'true');
    info.hidden = false;
    name.textContent = region.getAttribute('aria-label');
    summary.textContent = region.dataset.description;
  }

  function closeRegion() {
    activeRegion?.removeAttribute('aria-current');
    activeRegion = undefined;
    select.value = '';
    info.hidden = true;
  }

  for (const region of regions) {
    region.addEventListener('click', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      showRegion(region);
    });
  }
  select.addEventListener('change', () => {
    const region = regions.find((item) => item.dataset.region === select.value);
    if (region) showRegion(region);
    else closeRegion();
  });
  close.addEventListener('click', () => {
    closeRegion();
    select.focus();
  });
  provinceMap.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !info.hidden) close.click();
  });
  picker.hidden = false;
}

function openAuthorFromLink() {
  if (window.location.hash !== '#author-bio') return;
  const bio = document.getElementById('author-bio');
  bio.closest('details').open = true;
  bio.scrollIntoView({block: 'nearest'});
}

openAuthorFromLink();
window.addEventListener('hashchange', openAuthorFromLink);
