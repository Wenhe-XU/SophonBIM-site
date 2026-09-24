// Set this to "owner/repository" after the public GitHub repository is chosen.
// Keep release assets on GitHub Releases, outside this static website.
const githubRepository = '';
const releaseTag = '';
const installerName = '';
const armReleaseTag = '';
const armInstallerName = '';
const installNotice = document.getElementById('install-notice');
const armNotice = document.getElementById('install-notice-arm');
const pendingNotice = document.getElementById('install-notice-pending');
const confirmedDownload = document.getElementById('confirmed-download');
const releases = {
  x64: {
    label: 'x64', tag: releaseTag, installerName,
    button: document.getElementById('release-download'),
    status: document.getElementById('download-status'),
    version: document.getElementById('release-version'),
  },
  arm64: {
    label: 'ARM64', tag: armReleaseTag, installerName: armInstallerName,
    button: document.getElementById('release-download-arm'),
    status: document.getElementById('download-status-arm'),
    version: document.getElementById('release-version-arm'),
  },
};

for (const release of Object.values(releases)) {
  if (!githubRepository || !release.tag || !release.installerName) continue;
  const base = `https://github.com/${githubRepository}`;
  release.href = `${base}/releases/download/${encodeURIComponent(release.tag)}/${encodeURIComponent(release.installerName)}`;
  release.button.innerHTML = `Download Windows ${release.label} installer <span aria-hidden="true">↗</span>`;
  release.button.removeAttribute('data-pending');
  release.version.textContent = release.tag.replace(/^v/i, '');
  release.status.textContent = 'Download provided by GitHub Releases.';
}

const availableReleases = Object.values(releases).filter(release => release.href);
if (availableReleases.length) {
  const allReleases = document.getElementById('all-releases');
  const base = `https://github.com/${githubRepository}`;
  allReleases.href = `${base}/releases`;
  allReleases.removeAttribute('aria-disabled');
  document.getElementById('release-chip').textContent = availableReleases.length === 2
    ? 'DOWNLOADS AVAILABLE' : `${availableReleases[0].label.toUpperCase()} AVAILABLE`;
}

function showInstallNotice(architecture = 'x64') {
  const release = releases[architecture];
  const available = Boolean(release.href);
  document.querySelector('.install-notice-label').textContent = `WINDOWS ${release.label.toUpperCase()} INSTALLATION`;
  armNotice.hidden = architecture !== 'arm64';
  pendingNotice.hidden = available;
  pendingNotice.textContent = `The Windows ${release.label} installer is not available for public download yet.`;
  confirmedDownload.hidden = !available;
  if (available) {
    confirmedDownload.href = release.href;
    confirmedDownload.innerHTML = `Continue to ${release.label} download <span aria-hidden="true">↗</span>`;
  } else {
    confirmedDownload.removeAttribute('href');
  }
  if (!installNotice.open) installNotice.showModal();
}

for (const [architecture, release] of Object.entries(releases)) {
  release.button.addEventListener('click', () => showInstallNotice(architecture));
}
document.querySelector('[data-install-notice]').addEventListener('click', () => {
  document.getElementById('download').scrollIntoView();
  showInstallNotice('x64');
});
for (const button of document.querySelectorAll('[data-close-install-notice]')) {
  button.addEventListener('click', () => installNotice.close());
}
installNotice.addEventListener('click', event => {
  if (event.target === installNotice) installNotice.close();
});

for (const link of document.querySelectorAll('a[aria-disabled="true"]')) {
  link.addEventListener('click', event => event.preventDefault());
}

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const demoStates = new Map();
let focusedDemo = null;

function loadDemo(video) {
  const source = video.querySelector('source[data-src]');
  if (!source) return;
  source.src = source.dataset.src;
  source.removeAttribute('data-src');
  video.load();
}

function syncDemo(video, isPrimary) {
  const state = demoStates.get(video);
  const explicitlyPlaying = focusedDemo === video && state.manualPlay;
  const shouldPlay = isPrimary && (state.inView || explicitlyPlaying) && !document.hidden && !state.userPaused && (!motionPreference.matches || state.manualPlay);
  if (shouldPlay) {
    loadDemo(video);
    if (video.paused) video.play().catch(() => {
      video.pause();
      state.userPaused = true;
      state.manualPlay = false;
      if (focusedDemo === video) focusedDemo = null;
      syncAllDemos();
    });
  } else if (!video.paused) {
    video.pause();
  }
}

function syncAllDemos() {
  const mostVisible = [...demoStates.entries()]
    .filter(([, state]) => state.inView)
    .sort((a, b) => b[1].ratio - a[1].ratio)[0]?.[0];
  const primary = focusedDemo || mostVisible;
  for (const video of demoStates.keys()) syncDemo(video, video === primary);
}

for (const video of document.querySelectorAll('video[data-demo]')) {
  const buttons = document.querySelectorAll(`[data-demo-toggle="${video.id}"]`);
  demoStates.set(video, { inView: false, intersecting: false, ratio: 0, userPaused: false, manualPlay: false });
  const updateButtons = () => {
    const paused = video.paused;
    for (const button of buttons) {
      if (button.hasAttribute('data-demo-overlay')) {
        button.hidden = !paused;
      } else {
        button.textContent = paused ? 'Play' : 'Pause';
      }
      button.setAttribute('aria-label', `${paused ? 'Play' : 'Pause'} ${video.dataset.demoLabel || 'IFC Query'} demo`);
    }
  };
  video.addEventListener('play', updateButtons);
  video.addEventListener('pause', updateButtons);
  for (const button of buttons) button.addEventListener('click', () => {
    const state = demoStates.get(video);
    if (video.paused) {
      state.userPaused = false;
      state.manualPlay = true;
      focusedDemo = video;
    } else {
      state.userPaused = true;
      if (focusedDemo === video) focusedDemo = null;
    }
    syncAllDemos();
  });
  updateButtons();
}

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const state = demoStates.get(entry.target);
      const wasIntersecting = state.intersecting;
      state.intersecting = entry.isIntersecting;
      state.ratio = entry.intersectionRatio;
      state.inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
      if (wasIntersecting && !entry.isIntersecting && focusedDemo === entry.target) {
        state.manualPlay = false;
        focusedDemo = null;
      }
    }
    syncAllDemos();
  }, { threshold: [0, 0.15, 0.3, 0.5, 0.75, 1] });
  for (const video of demoStates.keys()) observer.observe(video);
} else {
  for (const [video, state] of demoStates) {
    state.inView = true;
    state.ratio = 1;
  }
  syncAllDemos();
}

document.addEventListener('visibilitychange', syncAllDemos);
const onMotionChange = syncAllDemos;
if (motionPreference.addEventListener) motionPreference.addEventListener('change', onMotionChange);
else motionPreference.addListener(onMotionChange);
