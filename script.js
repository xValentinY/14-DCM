const body = document.body;
const openBook = document.getElementById("openBook");
const album = document.getElementById("album");
const bgMusic = document.getElementById("bgMusic");
const songPicker = document.getElementById("songPicker");
const currentSongLabel = document.getElementById("currentSongLabel");
const musicToggleBtn = document.getElementById("musicToggleBtn");
const bookTrack = document.getElementById("bookTrack");
const pageTabs = Array.from(document.querySelectorAll(".page-tab"));
const pageDots = Array.from(document.querySelectorAll(".page-dot"));
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

const playlist = Array.from(songPicker.options).map((option) => ({
  label: option.textContent.trim(),
  src: option.value,
}));

let currentTrackIndex = Math.max(
  0,
  playlist.findIndex((track) => track.src === songPicker.value)
);
let currentPage = 0;

const applyTrack = (index) => {
  currentTrackIndex = index;
  const track = playlist[currentTrackIndex];
  bgMusic.src = track.src;
  songPicker.value = track.src;
  currentSongLabel.textContent = track.label;
};

const playCurrentTrack = async () => {
  try {
    await bgMusic.play();
  } catch (_error) {
    // Safari en iPhone puede bloquear autoplay hasta la interaccion del usuario.
  }
};

const playSelectedTrack = async () => {
  const nextIndex = playlist.findIndex((track) => track.src === songPicker.value);
  applyTrack(nextIndex === -1 ? 0 : nextIndex);
  bgMusic.currentTime = 0;
  await playCurrentTrack();
};

const playRandomNext = async () => {
  if (!playlist.length) return;
  let nextIndex = Math.floor(Math.random() * playlist.length);
  if (playlist.length > 1 && nextIndex === currentTrackIndex) {
    nextIndex = (nextIndex + 1) % playlist.length;
  }
  applyTrack(nextIndex);
  bgMusic.currentTime = 0;
  await playCurrentTrack();
};

const renderPage = () => {
  bookTrack.style.transform = `translateX(-${currentPage * 25}%)`;

  pageTabs.forEach((tab, index) => {
    tab.classList.toggle("is-active", index === currentPage);
  });

  pageDots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === currentPage);
  });

  prevPage.disabled = currentPage === 0;
  nextPage.disabled = currentPage === pageTabs.length - 1;
};

const goToPage = (index) => {
  currentPage = Math.max(0, Math.min(index, pageTabs.length - 1));
  renderPage();
};

const updateMusicToggle = () => {
  musicToggleBtn.textContent = bgMusic.paused ? "Reproducir" : "Pausar";
};

bgMusic.volume = 0.9;
currentSongLabel.textContent = playlist[currentTrackIndex].label;
updateMusicToggle();

songPicker.addEventListener("change", () => {
  playSelectedTrack();
});

bgMusic.addEventListener("ended", () => {
  playRandomNext();
});

bgMusic.addEventListener("play", updateMusicToggle);
bgMusic.addEventListener("pause", updateMusicToggle);

musicToggleBtn.addEventListener("click", async () => {
  if (bgMusic.paused) {
    await playCurrentTrack();
  } else {
    bgMusic.pause();
  }
  updateMusicToggle();
});

openBook.addEventListener("click", async () => {
  body.classList.remove("is-locked");
  body.classList.add("is-unlocked");
  album.setAttribute("aria-hidden", "false");
  goToPage(0);
  await playSelectedTrack();
  album.scrollIntoView({ behavior: "smooth", block: "start" });
});

pageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    goToPage(index);
  });
});

prevPage.addEventListener("click", () => {
  goToPage(currentPage - 1);
});

nextPage.addEventListener("click", () => {
  goToPage(currentPage + 1);
});

let touchStartX = 0;
let touchEndX = 0;

bookTrack.addEventListener(
  "touchstart",
  (event) => {
    touchStartX = event.changedTouches[0].screenX;
  },
  { passive: true }
);

bookTrack.addEventListener(
  "touchend",
  (event) => {
    touchEndX = event.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 40) return;
    if (diff > 0) {
      goToPage(currentPage + 1);
    } else {
      goToPage(currentPage - 1);
    }
  },
  { passive: true }
);

applyTrack(currentTrackIndex);
renderPage();
