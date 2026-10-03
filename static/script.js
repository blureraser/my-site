// scrollspy：滚动时高亮当前导航项
const links = [...document.querySelectorAll('nav a')];
const sections = [...document.querySelectorAll('section[id]')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.hash === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));
