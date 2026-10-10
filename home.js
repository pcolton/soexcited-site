(() => {
  const video = document.querySelector('.celebration video');
  if (!video) return;

  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let inView = !('IntersectionObserver' in window);
  let attemptedPlayback = false;
  let observer;

  function startPlayback() {
    if (!inView || motionPreference.matches || attemptedPlayback) return;
    // Try only once so scrolling never overrides a visitor's pause.
    attemptedPlayback = true;
    observer?.disconnect();
    video.muted = true;
    video.play().then(() => {
      if (motionPreference.matches) video.pause();
    }).catch(() => {
      // Browser autoplay restrictions leave the native play control available.
    });
  }

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
      startPlayback();
    }, { threshold: [0, 0.2] });
    observer.observe(video);
  } else {
    startPlayback();
  }

  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) video.pause();
    else startPlayback();
  });
})();

(() => {
  const scenes = {
    kinds: {
      image: 'media/iphone-kinds.webp',
      alt: 'Choose from event kinds including flights, celebrations, concerts, and friends.',
      title: 'A big day is whatever you make it.',
      description: 'Choose a kind, add the date, and make it yours with an emoji, icon, or photo. From a once-in-a-lifetime trip to dinner with the gang.',
      label: 'YOUR DAY. YOUR TICKET.'
    },
    themes: {
      image: 'media/iphone-themes.webp',
      alt: 'The So Excited theme picker offers different color palettes for the wallet and tickets.',
      title: 'Wear your favorite colors.',
      description: 'Choose a theme that feels like you. So Excited Plus unlocks every theme, including a Custom theme in your own colors.',
      label: 'A LITTLE MORE YOU.'
    },
    memories: {
      image: 'media/iphone-memories.webp',
      alt: 'Past events appear as torn ticket stubs in the Memories collection.',
      title: 'The day ends. The good feeling stays.',
      description: 'Past countdowns become torn stubs in Memories. A little collection of the days you loved, with room for everything still to come.',
      label: 'BEEN THERE. LOVED THAT.'
    }
  };

  const explorer = document.querySelector('.product-explorer');
  if (!explorer) return;

  const buttons = [...explorer.querySelectorAll('[data-scene]')];
  const rotationButton = explorer.querySelector('[data-rotation-toggle]');
  const rotationLabel = explorer.querySelector('[data-rotation-label]');
  const rotationIcon = explorer.querySelector('[data-rotation-icon]');
  const rotationStatus = explorer.querySelector('[data-rotation-status]');
  const caption = document.getElementById('scene-caption');
  const preview = document.getElementById('scene-image');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const interval = 7000;
  let selectedIndex = 0;
  let rotationEnabled = !motionPreference.matches;
  let inView = false;
  let hovering = false;
  let timer;
  let pointerRotationIntent = null;

  // Cache the small screenshot set so automatic changes do not flash blank.
  Object.values(scenes).forEach(scene => {
    const image = new Image();
    image.src = scene.image;
  });

  function selectScene(index) {
    selectedIndex = index;
    const scene = scenes[buttons[index].dataset.scene];
    buttons.forEach((button, buttonIndex) => {
      const selected = buttonIndex === index;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('selected', selected);
    });
    preview.src = scene.image;
    preview.alt = scene.alt;
    document.getElementById('scene-title').textContent = scene.title;
    document.getElementById('scene-description').textContent = scene.description;
    document.getElementById('scene-label').textContent = scene.label;
  }

  function syncRotation() {
    window.clearTimeout(timer);
    const running = rotationEnabled && inView && !hovering && !document.hidden;
    rotationLabel.textContent = rotationEnabled ? 'Pause tour' : 'Play tour';
    rotationIcon.textContent = rotationEnabled ? 'Ⅱ' : '▷';
    rotationStatus.textContent = !rotationEnabled
      ? 'Choose a feature to explore'
      : hovering
        ? 'Paused while you explore'
        : 'Auto-preview · every 7 seconds';
    // Automatic updates stay quiet for screen readers; manual changes announce.
    caption.setAttribute('aria-live', running ? 'off' : 'polite');
    explorer.dataset.rotating = String(running);
    if (running) {
      timer = window.setTimeout(() => {
        selectScene((selectedIndex + 1) % buttons.length);
        syncRotation();
      }, interval);
    }
  }

  buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
      rotationEnabled = false;
      syncRotation();
      selectScene(index);
    });
  });

  // Preserve a pointer user's intent if focusing the button stops the tour first.
  rotationButton.addEventListener('pointerdown', () => {
    pointerRotationIntent = !rotationEnabled;
  });
  rotationButton.addEventListener('pointercancel', () => {
    pointerRotationIntent = null;
  });
  rotationButton.addEventListener('click', event => {
    rotationEnabled = event.detail > 0 && pointerRotationIntent !== null
      ? pointerRotationIntent
      : !rotationEnabled;
    pointerRotationIntent = null;
    syncRotation();
  });

  explorer.addEventListener('focusin', () => {
    rotationEnabled = false;
    syncRotation();
  });
  explorer.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      hovering = true;
      syncRotation();
    }
  });
  explorer.addEventListener('pointerleave', event => {
    if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
      hovering = false;
      syncRotation();
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
      syncRotation();
    }, { threshold: [0, 0.2] });
    observer.observe(explorer);
  } else {
    // Keep the manual feature picker usable in browsers without visibility APIs.
    rotationEnabled = false;
    inView = true;
  }

  document.addEventListener('visibilitychange', syncRotation);
  window.addEventListener('pagehide', () => window.clearTimeout(timer));
  window.addEventListener('pageshow', syncRotation);
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) rotationEnabled = false;
    syncRotation();
  });
  rotationButton.hidden = false;
  syncRotation();
})();
