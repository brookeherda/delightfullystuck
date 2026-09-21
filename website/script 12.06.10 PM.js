// ============================================================
// Delightfully Stuck — site behavior
// Nav scroll state, scroll-reveal, tap-to-play reels, contact form
// ============================================================

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Nav: solid background after scrolling past hero ---------- */
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('is-scrolled', window.scrollY > window.innerHeight * 0.7);
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ---------- Scroll reveal ---------- */
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ---------- Reels: tap to load + play, never autoplay ---------- */
document.querySelectorAll('.reel__play').forEach((btn) => {
  btn.addEventListener('click', () => {
    const screen = btn.closest('.reel__screen');
    const video = screen.querySelector('video');
    const poster = screen.querySelector('.reel__poster');

    // Lazily attach the real source on first play so nothing
    // downloads until the visitor actually asks for it.
    if (!video.src) {
      const src = video.dataset.src;
      video.querySelector('source').src = src;
      video.load();
    }

    video.play();
    btn.classList.add('is-playing');
    if (poster) poster.style.display = 'none';
    video.style.display = 'block';
  });
});

// Pause + restore poster when a reel finishes or is paused via controls
document.querySelectorAll('.reel__screen video').forEach((video) => {
  video.setAttribute('controls', '');
  video.addEventListener('ended', () => {
    const screen = video.closest('.reel__screen');
    screen.querySelector('.reel__play').classList.remove('is-playing');
  });
});

/* ---------- Lightbox: tap a grid photo to see it full-size, no caption ---------- */
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');

const openLightbox = (img) => {
  lightboxImg.src = img.currentSrc || img.src;
  lightboxImg.alt = img.alt || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxImg.src = '';
  document.body.style.overflow = '';
};

document.querySelectorAll('.stay-card img, .gallery-item img').forEach((img) => {
  img.addEventListener('click', () => openLightbox(img));
});

lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
});

/* ---------- Contact form: submit via fetch, show inline status ---------- */
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('.form__submit');
    submitBtn.disabled = true;
    status.textContent = 'Sending...';
    status.removeAttribute('data-state');

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });

      if (res.ok) {
        status.textContent = "Thanks — I'll be in touch soon.";
        status.dataset.state = 'success';
        form.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch (err) {
      status.textContent =
        "Something went wrong sending that — please email hello@delightfullystuck.com directly.";
      status.dataset.state = 'error';
    } finally {
      submitBtn.disabled = false;
    }
  });
}
