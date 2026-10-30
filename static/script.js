// scrollspy：滚动时高亮当前导航项（导航已改为页面跳转，只剩显式 #锚点 才参与）
const links = [...document.querySelectorAll('nav a')].filter(l => l.hash);
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
  document.querySelectorAll('section[id]').forEach(s => spy.observe(s));
};
window.addEventListener('rail:partial', initSpy);
