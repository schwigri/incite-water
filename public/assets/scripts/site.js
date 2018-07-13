let monitorMasthead = (m, y) => {
  if (y > 0) {
    m.style.transition = '';
    m.classList.add('light');
  } else if (y < 0) {
    m.style.transition = '0';
    m.classList.add('light');
  } else {
    m.style.transition = '';
    m.classList.remove('light');
  }
};
let masthead = document.getElementById('masthead');
let pageId = document.body.getAttribute('id');
if (pageId === 'home') {
  window.setInterval(() => {
    let y = window.scrollY;
    monitorMasthead(masthead, y);
  }, 10);
}