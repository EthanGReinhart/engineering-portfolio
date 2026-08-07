const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navigation.classList.toggle('open', !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12 }
);

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll('main section[id]')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visible = entries.find((entry) => entry.isIntersecting);
    if (!visible) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.hash === `#${visible.target.id}`));
  },
  { rootMargin: '-30% 0px -60% 0px' }
);

sections.forEach((section) => sectionObserver.observe(section));
document.querySelector('#current-year').textContent = new Date().getFullYear();

const heroVideos = [...document.querySelectorAll('.hero-video')];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const titleLines = [...document.querySelectorAll('.hero-title-line')];

if (titleLines.length && !reduceMotion) {
  const hero = document.querySelector('.hero');
  const lineText = titleLines.map((line) => line.textContent.trim());
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  hero.classList.add('is-sequencing');
  titleLines.forEach((line) => { line.textContent = ''; });

  const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

  const typeHeadline = async () => {
    await wait(420);

    for (let lineIndex = 0; lineIndex < titleLines.length; lineIndex += 1) {
      const line = titleLines[lineIndex];
      line.append(cursor);

      for (const character of lineText[lineIndex]) {
        line.insertBefore(document.createTextNode(character), cursor);
        await wait(character === ' ' ? 16 : 27);
      }

      if (lineIndex < titleLines.length - 1) await wait(130);
    }

    hero.classList.add('sequence-complete');
    await wait(1500);
    cursor.remove();
    hero.classList.remove('is-sequencing');
  };

  typeHeadline();
}

if (heroVideos.length === 2 && !reduceMotion) {
  const fadeDuration = 1.8;
  let activeIndex = 0;
  let isCrossfading = false;

  heroVideos.forEach((video) => {
    video.muted = true;
  });

  const startVideo = () => heroVideos[activeIndex].play().catch(() => {});

  const monitorLoop = () => {
    const activeVideo = heroVideos[activeIndex];

    if (
      !isCrossfading &&
      Number.isFinite(activeVideo.duration) &&
      activeVideo.duration - activeVideo.currentTime <= fadeDuration
    ) {
      isCrossfading = true;
      const nextIndex = 1 - activeIndex;
      const nextVideo = heroVideos[nextIndex];

      nextVideo.currentTime = 0;
      nextVideo.play().catch(() => {});
      nextVideo.classList.add('is-active');
      activeVideo.classList.remove('is-active');

      window.setTimeout(() => {
        activeVideo.pause();
        activeVideo.currentTime = 0;
        activeIndex = nextIndex;
        isCrossfading = false;
      }, fadeDuration * 1000);
    }

    window.requestAnimationFrame(monitorLoop);
  };

  if (heroVideos[0].readyState >= 2) startVideo();
  else heroVideos[0].addEventListener('loadeddata', startVideo, { once: true });

  window.requestAnimationFrame(monitorLoop);
}
