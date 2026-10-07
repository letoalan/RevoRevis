/**
 * RevoRevis - Audio Station Controller
 * Custom accessible audio player with playback rate and collapsible transcription
 */

export function setupAudioPlayer(options = {}) {
  const container = document.querySelector('.audio-station');
  if (!container) return;

  const audio = container.querySelector('audio');
  if (!audio) return;

  const playBtn = container.querySelector('.play-toggle-btn');
  const speedBtn = container.querySelector('.speed-toggle-btn');
  const progressBar = container.querySelector('.progress-bar-fill');
  const progressContainer = container.querySelector('.progress-bar-container');
  const currentTimeEl = container.querySelector('.current-time');
  const durationTimeEl = container.querySelector('.duration-time');
  const transcriptToggle = container.querySelector('.transcription-toggle');
  const transcriptBody = container.querySelector('.transcription-body');

  // Resolve audio path using Vite BASE_URL if data-audio-file is set
  if (audio.dataset.audioFile) {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const cleanPath = audio.dataset.audioFile.startsWith('/') ? audio.dataset.audioFile.slice(1) : audio.dataset.audioFile;
    audio.src = cleanBase + cleanPath;
  }

  // Format seconds to mm:ss or hh:mm:ss
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Update duration when metadata is loaded
  audio.addEventListener('loadedmetadata', () => {
    if (durationTimeEl) durationTimeEl.textContent = formatTime(audio.duration);
  });

  // Time update
  audio.addEventListener('timeupdate', () => {
    if (currentTimeEl) currentTimeEl.textContent = formatTime(audio.currentTime);
    if (progressBar && audio.duration) {
      const pct = (audio.currentTime / audio.duration) * 100;
      progressBar.style.width = `${pct}%`;
    }
  });

  // Play / Pause toggle
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          playBtn.innerHTML = '⏸';
          playBtn.setAttribute('aria-label', 'Mettre en pause le podcast');
        }).catch(err => console.log('Audio play interrupted:', err));
      } else {
        audio.pause();
        playBtn.innerHTML = '▶';
        playBtn.setAttribute('aria-label', 'Écouter le podcast');
      }
    });
  }

  audio.addEventListener('ended', () => {
    if (playBtn) {
      playBtn.innerHTML = '▶';
      playBtn.setAttribute('aria-label', 'Écouter le podcast');
    }
    if (progressBar) progressBar.style.width = '0%';
  });

  // Speed toggle: 1x -> 1.25x -> 1.5x -> 1x
  if (speedBtn) {
    const speeds = [1, 1.25, 1.5];
    let currentSpeedIndex = 0;
    speedBtn.addEventListener('click', () => {
      currentSpeedIndex = (currentSpeedIndex + 1) % speeds.length;
      const speed = speeds[currentSpeedIndex];
      audio.playbackRate = speed;
      speedBtn.textContent = `${speed}×`;
      speedBtn.setAttribute('aria-label', `Vitesse de lecture ${speed} fois`);
    });
  }

  // Seeking on progress container click and touch/pointer drag
  if (progressContainer) {
    let isDragging = false;

    function seek(e) {
      const rect = progressContainer.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const clickX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const width = rect.width;
      if (audio.duration && width > 0) {
        audio.currentTime = (clickX / width) * audio.duration;
      }
    }

    progressContainer.addEventListener('pointerdown', (e) => {
      isDragging = true;
      seek(e);
      progressContainer.setPointerCapture(e.pointerId);
    });

    progressContainer.addEventListener('pointermove', (e) => {
      if (isDragging) {
        seek(e);
      }
    });

    progressContainer.addEventListener('pointerup', (e) => {
      if (isDragging) {
        seek(e);
        isDragging = false;
        try { progressContainer.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    });

    progressContainer.addEventListener('pointercancel', () => {
      isDragging = false;
    });
  }

  // Transcription toggle
  if (transcriptToggle && transcriptBody) {
    transcriptToggle.addEventListener('click', () => {
      const isOpen = transcriptBody.classList.toggle('open');
      transcriptToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      transcriptToggle.querySelector('.toggle-icon').textContent = isOpen ? '▲' : '▼';
    });
  }
}
