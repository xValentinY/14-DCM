const body = document.body;
const openBook = document.getElementById("openBook");
const intro = document.getElementById("intro");
const album = document.getElementById("album");
const navButtons = Array.from(document.querySelectorAll(".shell-jump"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const bgMusic = document.getElementById("bgMusic");
const songPicker = document.getElementById("songPicker");
const currentSongLabel = document.getElementById("currentSongLabel");

const playlist = Array.from(songPicker.options).map((option) => ({
  label: option.textContent.trim(),
  src: option.value,
}));

let currentTrackIndex = Math.max(
  0,
  playlist.findIndex((track) => track.src === songPicker.value)
);

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
    // iPhone normalmente bloquea autoplay con sonido hasta la primera interaccion.
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

const setActiveNav = (targetId) => {
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === targetId);
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

applyTrack(currentTrackIndex);
bgMusic.volume = 0.9;

songPicker.addEventListener("change", () => {
  playSelectedTrack();
});

bgMusic.addEventListener("ended", () => {
  playRandomNext();
});

openBook.addEventListener("click", async () => {
  body.classList.remove("is-locked");
  body.classList.add("is-unlocked");
  album.setAttribute("aria-hidden", "false");
  await playSelectedTrack();
  intro.scrollIntoView({ behavior: "smooth", block: "start" });

  requestAnimationFrame(() => {
    setTimeout(() => {
      album.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  });
});

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const target = document.getElementById(button.dataset.target);
    if (!target) return;
    setActiveNav(button.dataset.target);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    const visibleEntry = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visibleEntry) {
      setActiveNav(visibleEntry.target.id);
    }
  },
  {
    threshold: [0.35, 0.6, 0.8],
    rootMargin: "-15% 0px -30% 0px",
  }
);

document
  .querySelectorAll("#editorial, #mensajes, #google")
  .forEach((section) => sectionObserver.observe(section));

playCurrentTrack();
