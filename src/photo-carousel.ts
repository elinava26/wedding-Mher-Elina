const CAROUSEL_INTERVAL_MS: number = 4500;

export function initPhotoCarousel(): void {
  const root: HTMLElement | null = document.querySelector('[data-photo-carousel]');
  if (!root) {
    return;
  }

  const slides: HTMLElement[] = Array.from(
    root.querySelectorAll<HTMLElement>('.photo-carousel__slide'),
  );
  const dots: HTMLButtonElement[] = Array.from(
    root.querySelectorAll<HTMLButtonElement>('.photo-carousel__dot'),
  );

  if (slides.length < 2) {
    return;
  }

  let activeIndex: number = 0;
  let timerId: ReturnType<typeof setInterval> | null = null;
  const prefersReducedMotion: boolean = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const goTo = (nextIndex: number): void => {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach((slide: HTMLElement, slideIndex: number) => {
      const isActive: boolean = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    dots.forEach((dot: HTMLButtonElement, dotIndex: number) => {
      const isActive: boolean = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const stopAutoPlay = (): void => {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  };

  const startAutoPlay = (): void => {
    if (prefersReducedMotion) {
      return;
    }
    stopAutoPlay();
    timerId = setInterval(() => {
      goTo(activeIndex + 1);
    }, CAROUSEL_INTERVAL_MS);
  };

  dots.forEach((dot: HTMLButtonElement, dotIndex: number) => {
    dot.addEventListener('click', () => {
      goTo(dotIndex);
      startAutoPlay();
    });
  });

  root.addEventListener('mouseenter', stopAutoPlay);
  root.addEventListener('mouseleave', startAutoPlay);
  root.addEventListener('focusin', stopAutoPlay);
  root.addEventListener('focusout', startAutoPlay);

  goTo(0);
  startAutoPlay();
}
