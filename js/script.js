/* ============================================
   VeiloScan — Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // -------------------------------------------
  // 1. Header scroll effect
  // -------------------------------------------
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();


  // -------------------------------------------
  // 2. Scroll-reveal (CSS + IntersectionObserver)
  //    This is the ONLY system that reveals elements.
  //    Elements start hidden via CSS (.reveal { opacity:0 })
  //    and get .visible class added when they scroll in.
  // -------------------------------------------
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  revealEls.forEach(el => revealObs.observe(el));


  // -------------------------------------------
  // 3. Animated stat counters
  // -------------------------------------------
  const statNums = document.querySelectorAll('[data-count]');
  let counted = false;

  const animCount = (el) => {
    const target  = parseFloat(el.getAttribute('data-count'));
    const suffix  = el.getAttribute('data-suffix') || '';
    const isFloat = !Number.isInteger(target);
    const dur = 1800, t0 = performance.now();
    const step = (ts) => {
      const p = Math.min((ts - t0) / dur, 1), e = 1 - (1 - p) * (1 - p);
      el.textContent = (isFloat
        ? (e * target).toFixed(1)
        : Math.floor(e * target).toLocaleString()) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const statsSection = document.querySelector('.stats');
  if (statsSection) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !counted) {
        counted = true;
        statNums.forEach((el, i) => setTimeout(() => animCount(el), i * 150));
      }
    }, { threshold: 0.3 }).observe(statsSection);
  }


  // -------------------------------------------
  // 4. Feature card 3-D tilt on hover
  // -------------------------------------------
  document.querySelectorAll('.feature-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r  = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top)  / r.height - 0.5) * -6;
      const ry = ((e.clientX - r.left) / r.width  - 0.5) *  6;
      card.style.transform = `translateY(-6px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });


  // -------------------------------------------
  // 5. Button ripple effect
  // -------------------------------------------
  const rs = document.createElement('style');
  rs.textContent = `@keyframes _rpl{to{transform:scale(4);opacity:0}}`;
  document.head.appendChild(rs);

  document.querySelectorAll('.btn-primary, .cta__btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      const r = this.getBoundingClientRect(), sz = Math.max(r.width, r.height);
      const rpl = document.createElement('span');
      rpl.style.cssText = `
        position:absolute;width:${sz}px;height:${sz}px;
        left:${e.clientX - r.left - sz/2}px;top:${e.clientY - r.top - sz/2}px;
        background:rgba(255,255,255,.26);border-radius:50%;transform:scale(0);
        animation:_rpl .6s ease-out forwards;pointer-events:none;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(rpl);
      setTimeout(() => rpl.remove(), 700);
    });
  });


  // -------------------------------------------
  // 6. GSAP — Hero car scroll animation
  //    Car drives across bottom of hero as user
  //    scrolls. Locked to scroll via scrub.
  // -------------------------------------------
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    const car        = document.querySelector('.hero-road__car');
    const dashes     = document.querySelector('.hero-road__dashes');
    const speedlines = document.querySelector('.hero-road__speedlines');
    const dust       = document.querySelector('.hero-road__dust');
    const hero       = document.querySelector('.hero');

    if (car && hero) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
          invalidateOnRefresh: true
        }
      });

      // `.to()` automatically uses the CSS left/translateX as the starting point.
      // We push it to the right edge of the screen + 100px.
      tl.to(car, { x: () => window.innerWidth + 100, ease: 'none', duration: 1 }, 0);
    }
  }


  // -------------------------------------------
  // 7. Navbar Scroll-Spy & Active State
  // -------------------------------------------
  const navLinks = document.querySelectorAll('.header__nav a');
  const sections = document.querySelectorAll('section[id]');
  
  // Update active state based on scroll position
  const spyOptions = {
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          link.classList.toggle('active', href === id);
        });
      }
    });
  }, spyOptions);

  sections.forEach(sec => spyObserver.observe(sec));

  // Manual click update for immediate feedback
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
});