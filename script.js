/* Martial Pilgrims Ministry — shared behaviour */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  /* ---------- Hero slider (5 slides, auto-fade) ---------- */
  var slides = document.querySelectorAll('.hero-slider .slide');
  var dotsWrap = document.querySelector('.hero-dots');
  if (slides.length) {
    var current = 0;
    var timer;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var b = document.createElement('button');
        if (i === 0) b.classList.add('active');
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', function () { goTo(i); resetTimer(); });
        dotsWrap.appendChild(b);
      });
    }

    function render() {
      slides.forEach(function (s, i) { s.classList.toggle('active', i === current); });
      if (dotsWrap) {
        Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
          d.classList.toggle('active', i === current);
        });
      }
    }
    function goTo(i) { current = (i + slides.length) % slides.length; render(); }
    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }
    function resetTimer() { clearInterval(timer); timer = setInterval(next, 6000); }

    var nextBtn = document.querySelector('.hero-arrow.next');
    var prevBtn = document.querySelector('.hero-arrow.prev');
    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetTimer(); });

    render();
    resetTimer();
  }

  /* ---------- Donate modal ---------- */
  var overlay = document.getElementById('donateModal');
  var openBtns = document.querySelectorAll('[data-open-donate]');
  var closeBtns = document.querySelectorAll('[data-close-donate]');

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (overlay) overlay.classList.add('open');
    });
  });
  closeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (overlay) overlay.classList.remove('open');
    });
  });
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) overlay.classList.remove('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') overlay.classList.remove('open');
    });
  }

  var currencyTabs = document.querySelectorAll('.currency-tabs button');
  var currencyPanels = document.querySelectorAll('.currency-panel');
  currencyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-currency');
      currencyTabs.forEach(function (t) { t.classList.remove('active'); });
      currencyPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.currency-panel[data-currency="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  /* ---------- Contact form (static demo — replace with real handler) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = document.getElementById('formNote');
      if (note) {
        note.textContent = 'Thank you — your message has been noted. Connect this form to your email service to receive messages.';
        note.style.display = 'block';
      }
      form.reset();
    });
  }

});
