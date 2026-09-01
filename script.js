// id:type:打字效果
const typeEl = document.getElementById('type');
const text = '如你所见，还在学前端，未来还有什么呢...';
let i = 0;
(function type() {
  typeEl.textContent = text.slice(0, ++i);
  if (i < text.length) setTimeout(type, 110);
})();

// id:clock:侧边栏实时时钟
setInterval(() => {
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('zh-CN');
}, 1000);

// scrollspy：滚动时高亮当前导航项
const links = [...document.querySelectorAll('nav a')];
const sections = [...document.querySelectorAll('section[id]')];
const spy = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));
