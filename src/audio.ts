import { BACKGROUND_MUSIC_START_SECONDS, BACKGROUND_MUSIC_VIDEO_ID } from './constants';

const MUSIC_VOLUME = 40;

function loadYouTubeIframeApi(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  return new Promise((resolve: () => void) => {
    const previousReady: (() => void) | undefined = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = (): void => {
      previousReady?.();
      resolve();
    };

    const script: HTMLScriptElement = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
  });
}

/**
 * Background music via hidden YouTube player + floating mute/unmute toggle.
 */
export function initAudio(): void {
  const mount: HTMLElement | null = document.getElementById('yt-player');
  const playBtn: HTMLButtonElement | null = document.querySelector('[data-audio-play]');
  const stopBtn: HTMLButtonElement | null = document.querySelector('[data-audio-stop]');

  if (!mount || !playBtn || !stopBtn) {
    return;
  }

  const playControl: HTMLButtonElement = playBtn;
  const stopControl: HTMLButtonElement = stopBtn;

  let player: YT.Player | null = null;
  let ready = false;
  let pendingPlay = false;

  function showPlay(): void {
    playControl.style.display = '';
    stopControl.style.display = 'none';
  }

  function showStop(): void {
    playControl.style.display = 'none';
    stopControl.style.display = '';
  }

  function playMusic(): void {
    if (!ready || !player) {
      pendingPlay = true;
      return;
    }
    player.playVideo();
    showStop();
  }

  function pauseMusic(): void {
    pendingPlay = false;
    player?.pauseVideo();
    showPlay();
  }

  showPlay();

  playControl.addEventListener('click', () => {
    playMusic();
  });

  stopControl.addEventListener('click', (e: MouseEvent) => {
    e.preventDefault();
    pauseMusic();
  });

  void loadYouTubeIframeApi().then(() => {
    player = new YT.Player(mount.id, {
      height: '0',
      width: '0',
      videoId: BACKGROUND_MUSIC_VIDEO_ID,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: 1,
        playlist: BACKGROUND_MUSIC_VIDEO_ID,
        start: BACKGROUND_MUSIC_START_SECONDS,
      },
      events: {
        onReady: () => {
          ready = true;
          player?.setVolume(MUSIC_VOLUME);
          if (pendingPlay) {
            player?.playVideo();
            showStop();
          }
        },
        onStateChange: (event: YT.OnStateChangeEvent) => {
          if (event.data === YT.PlayerState.ENDED) {
            player?.seekTo(BACKGROUND_MUSIC_START_SECONDS, true);
            player?.playVideo();
            return;
          }
          if (event.data === YT.PlayerState.PLAYING) {
            showStop();
          } else if (event.data === YT.PlayerState.PAUSED) {
            showPlay();
          }
        },
      },
    });
  });
}
