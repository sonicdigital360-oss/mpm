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

  /* ==========================================================
     Donation payment integrations
     Paystack and Flutterwave: replace the placeholder public
     keys below with your real keys from your dashboards.
     PayPal: replace PAYPAL_CLIENT_ID with your real client ID
     (currently set to "sb" — PayPal's shared sandbox ID — so
     the buttons render and can be tested before go-live).
     ========================================================== */
  var PAYSTACK_PUBLIC_KEY = 'YOUR_PAYSTACK_PUBLIC_KEY';
  var FLUTTERWAVE_PUBLIC_KEY = 'YOUR_FLUTTERWAVE_PUBLIC_KEY';
  var PAYPAL_CLIENT_ID = 'sb';

  function getFieldValue(id, fallback) {
    var el = document.getElementById(id);
    var v = el ? el.value.trim() : '';
    return v || fallback;
  }

  /* ---- Paystack (NGN) ---- */
  document.querySelectorAll('[data-pay="paystack"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeof PaystackPop === 'undefined') {
        alert('Paystack is still loading — please try again in a moment.');
        return;
      }
      var amount = parseFloat(getFieldValue(btn.getAttribute('data-amount-input'), '1000'));
      var email = getFieldValue(btn.getAttribute('data-email-input'), '');
      if (!email) { alert('Please enter your email address to continue.'); return; }
      var handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: email,
        amount: Math.round(amount * 100), // kobo
        currency: 'NGN',
        ref: 'MPM-' + Date.now(),
        callback: function (response) {
          alert('Thank you for your gift! Reference: ' + response.reference);
        },
        onClose: function () {}
      });
      handler.openIframe();
    });
  });

  /* ---- Flutterwave (NGN) ---- */
  document.querySelectorAll('[data-pay="flutterwave"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (typeof FlutterwaveCheckout === 'undefined') {
        alert('Flutterwave is still loading — please try again in a moment.');
        return;
      }
      var amount = parseFloat(getFieldValue(btn.getAttribute('data-amount-input'), '1000'));
      var email = getFieldValue(btn.getAttribute('data-email-input'), '');
      if (!email) { alert('Please enter your email address to continue.'); return; }
      FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: 'MPM-' + Date.now(),
        amount: amount,
        currency: 'NGN',
        customer: { email: email },
        customizations: {
          title: 'Martial Pilgrims Ministry',
          description: 'Donation to MPM'
        },
        callback: function () {
          alert('Thank you for your gift!');
        },
        onclose: function () {}
      });
    });
  });

  /* ---- PayPal (USD / GBP / EUR) — loaded lazily per currency ---- */
  var paypalLoadedCurrencies = {};

  function renderPaypalButtons(currency, containerId, amountInputId) {
    var container = document.getElementById(containerId);
    if (!container || container.getAttribute('data-rendered') === '1') return;

    function doRender() {
      if (typeof paypal === 'undefined' || !window['paypal_' + currency]) return;
      window['paypal_' + currency].Buttons({
        createOrder: function (data, actions) {
          var amount = parseFloat(getFieldValue(amountInputId, '10')) || 10;
          return actions.order.create({
            purchase_units: [{ amount: { value: amount.toFixed(2), currency_code: currency } }]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(function () {
            alert('Thank you for your gift!');
          });
        }
      }).render('#' + containerId);
      container.setAttribute('data-rendered', '1');
    }

    if (paypalLoadedCurrencies[currency]) {
      doRender();
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + PAYPAL_CLIENT_ID + '&currency=' + currency;
    script.onload = function () {
      // Namespace each currency's SDK instance so multiple currencies can coexist
      window['paypal_' + currency] = window.paypal;
      paypalLoadedCurrencies[currency] = true;
      doRender();
    };
    document.body.appendChild(script);
  }

  // Render PayPal buttons lazily the moment a currency tab is opened
  currencyTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var cur = tab.getAttribute('data-currency');
      var trigger = document.querySelector('[data-paypal-currency="' + cur + '"]');
      if (trigger) {
        renderPaypalButtons(
          trigger.getAttribute('data-paypal-currency'),
          trigger.getAttribute('data-paypal-container'),
          trigger.getAttribute('data-paypal-amount')
        );
      }
    });
  });

});
