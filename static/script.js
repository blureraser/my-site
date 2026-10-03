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

// 局部换页后重新绑定 scrollspy（rail.js 负责替换 <main>，右栏不重载）
const initSpy = () => {
  spy.disconnect();
  document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('section[id]').forEach(s => spy.observe(s));
};
window.addEventListener('rail:partial', initSpy);
