const CAROUSEL_INTERVAL_MS: number = 4500;
const SWIPE_MIN_DISTANCE_PX: number = 48;

interface SwipeStart {
  x: number;
  y: number;
  pointerId: number | null;
}

function initCarouselSwipe(
  viewport: HTMLElement,
  onSwipeLeft: () => void,
  onSwipeRight: () => void,
  onSwipeCancel: () => void,
): void {
  let start: SwipeStart | null = null;

  const reset = (): void => {
    start = null;
    onSwipeCancel();
  };

  const onPointerDown = (ev: PointerEvent): void => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) {
      return;
    }
    start = { x: ev.clientX, y: ev.clientY, pointerId: ev.pointerId };
    viewport.setPointerCapture(ev.pointerId);
  };

  const onPointerUp = (ev: PointerEvent): void => {
    if (!start || (start.pointerId !== null && ev.pointerId !== start.pointerId)) {
      return;
    }

    const dx: number = ev.clientX - start.x;
    const dy: number = ev.clientY - start.y;
    start = null;

    if (Math.abs(dx) < SWIPE_MIN_DISTANCE_PX || Math.abs(dx) < Math.abs(dy)) {
      onSwipeCancel();
      return;
    }

    if (dx < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  };

  viewport.addEventListener('pointerdown', onPointerDown);
  viewport.addEventListener('pointerup', onPointerUp);
  viewport.addEventListener('pointercancel', reset);
  viewport.addEventListener('lostpointercapture', reset);
}

export function initPhotoCarousel(): void {
  const root: HTMLElement | null = document.querySelector('[data-photo-carousel]');
  if (!root) {
    return;
  }

  const viewport: HTMLElement | null = root.querySelector('.photo-carousel__viewport');
  const slides: HTMLElement[] = Array.from(
    root.querySelectorAll<HTMLElement>('.photo-carousel__slide'),
  );
  const dots: HTMLButtonElement[] = Array.from(
    root.querySelectorAll<HTMLButtonElement>('.photo-carousel__dot'),
  );

  if (!viewport || slides.length < 2) {
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

  initCarouselSwipe(
    viewport,
    () => {
      stopAutoPlay();
      goTo(activeIndex + 1);
      startAutoPlay();
    },
    () => {
      stopAutoPlay();
      goTo(activeIndex - 1);
      startAutoPlay();
    },
    startAutoPlay,
  );

  goTo(0);
  startAutoPlay();
}
