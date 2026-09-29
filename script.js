// MENTORO — shared interactivity

document.addEventListener('DOMContentLoaded', function () {

  /* Mobile nav toggle + reliable body scroll lock */
  var toggle = document.querySelector('.nav-toggle');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (toggle && mobileMenu) {
    var closeMenu = function () {
      var savedScroll = parseInt(document.body.dataset.menuScrollY || '0', 10);

      mobileMenu.classList.remove('is-open');
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');

      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');

      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      document.body.style.width = '';

      delete document.body.dataset.menuScrollY;

      window.scrollTo(0, savedScroll);
    };

    toggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('is-open');

      if (isOpen) {
        closeMenu();
        return;
      }

      var scrollY = window.scrollY || window.pageYOffset || 0;
      document.body.dataset.menuScrollY = String(scrollY);

      mobileMenu.classList.add('is-open');
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');

      /* position: fixed is the reliable mobile lock;
         overflow:hidden alone can still allow viewport scrolling. */
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');

      document.body.style.position = 'fixed';
      document.body.style.top = '-' + scrollY + 'px';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.width = '100%';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu();
      });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');

      item.closest('.faq').querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        var q = other.querySelector('.faq-question');
        if (q) q.setAttribute('aria-expanded', 'false');
      });

      if (!wasOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* Highlight the current page in the nav */
  var path = window.location.pathname.replace(/\/+$/, '');
  var here = path.split('/').pop() || 'index.html';

  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href') || '';

    if (
      href === here ||
      href === path ||
      (here === '' && href === 'index.html') ||
      (path === '' && href === 'index.html')
    ) {
      link.classList.add('is-active');
    }
  });

  /* Back to Top button & Nav scroll elevation */
  var backToTop = document.createElement('button');
  backToTop.className = 'back-to-top';
  var isRtl = document.documentElement.lang === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
  backToTop.setAttribute('aria-label', isRtl ? 'العودة إلى الأعلى' : 'Back to top');
  backToTop.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 15l-6-6-6 6"/></svg>';
  document.body.appendChild(backToTop);

  backToTop.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  var nav = document.querySelector('.nav');
  var ticking = false;

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        var scrollY = window.scrollY || window.pageYOffset;

        if (scrollY > 350) {
          backToTop.classList.add('is-visible');
        } else {
          backToTop.classList.remove('is-visible');
        }

        if (nav) {
          if (scrollY > 20) {
            nav.classList.add('is-scrolled');
          } else {
            nav.classList.remove('is-scrolled');
          }
        }

        ticking = false;
      });
      ticking = true;
    }
  });
});
