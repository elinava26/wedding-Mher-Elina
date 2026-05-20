import './styles/main.css';
import { initAudio } from './audio';
import { initCountdown } from './countdown';
import { initForm } from './form';
import { initPhotoCarousel } from './photo-carousel';

function initScrollReveal(): void {
  const els: NodeListOf<HTMLElement> = document.querySelectorAll('.js-reveal');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach((el: HTMLElement) => el.classList.add('is-visible'));
    return;
  }
  const io: IntersectionObserver = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((e: IntersectionObserverEntry) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    },
    { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el: HTMLElement) => io.observe(el));
}

initScrollReveal();
initPhotoCarousel();
initCountdown();
initAudio();
initForm();
