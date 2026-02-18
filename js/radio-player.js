// Radio Player Class
class RadioPlayer {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.isPlaying = false;
    this.radioStations = [];
    this.setupEventListeners();
    this.loadDefaultStations();
  }

  setupEventListeners() {
    const radioToggle = document.getElementById("radio-toggle");
    const radioClose = document.getElementById("radio-close");
    const radioSearchBtn = document.getElementById("radio-search-btn");
    const radioSearchInput = document.getElementById("radio-search-input");
    const playPauseBtn = document.getElementById("radio-play-pause");
    const stopBtn = document.getElementById("radio-stop");

    radioToggle.addEventListener("click", () => this.toggleSlider());
    radioClose.addEventListener("click", () => this.closeSlider());

    radioSearchBtn.addEventListener("click", () => this.searchRadioStations());
    radioSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchRadioStations();
    });

    playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    stopBtn.addEventListener("click", () => this.stop());
  }

  toggleSlider() {
    const slider = document.getElementById("radio-slider");
    slider.classList.toggle("open");
    // Update player controls position
    this.updatePlayerControls();
  }

  closeSlider() {
    const slider = document.getElementById("radio-slider");
    slider.classList.remove("open");
  }

  async loadDefaultStations() {
    try {
      // Search for specific default stations: Zaycev stations, fn, german 1 live, wdr
      const foundStations = [];

      // Search for Zaycev stations (Relax, Pop, NewRock)
      try {
        const zaycevResponse = await fetch(
          `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(
            "zaycev"
          )}&limit=20&order=votes&reverse=true`
        );
        const zaycevStations = await zaycevResponse.json();
        const zaycevTargets = [
          "Zaycev.FM Relax",
          "Zaycev.FM Pop",
          "Zaycev.FM NewRock",
        ];

        for (const targetName of zaycevTargets) {
          const station = zaycevStations.find(
            (s) => s.url_resolved && s.name && s.name === targetName
          );
          if (station) {
            foundStations.push(station);
          }
        }
      } catch (err) {
        console.warn("Error searching for Zaycev stations:", err);
      }

      // Search for other default stations: fn, german 1 live, wdr
      const otherStationSearches = [
        ["fn", "funkhaus"],
        ["1live", "1 live", "german 1 live"],
        ["wdr"],
      ];

      for (const searchTerms of otherStationSearches) {
        let stationFound = false;
        for (const searchTerm of searchTerms) {
          if (stationFound) break;
          try {
            const response = await fetch(
              `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(
                searchTerm
              )}&limit=5&order=votes&reverse=true`
            );
            const stations = await response.json();
            // Filter out Hindi stations
            const validStation = stations.find(
              (s) =>
                s.url_resolved &&
                s.name &&
                !s.name.toLowerCase().includes("hindi") &&
                !s.tags?.toLowerCase().includes("hindi") &&
                (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  searchTerm
                    .toLowerCase()
                    .includes(s.name.toLowerCase().substring(0, 3)))
            );
            if (
              validStation &&
              !foundStations.find((s) => s.name === validStation.name)
            ) {
              foundStations.push(validStation);
              stationFound = true;
            }
          } catch (err) {
            console.warn(`Error searching for ${searchTerm}:`, err);
          }
        }
      }

      // Filter out any Hindi stations that might have been added
      this.radioStations = foundStations.filter(
        (s) =>
          !s.name.toLowerCase().includes("hindi") &&
          !s.tags?.toLowerCase().includes("hindi")
      );

      // If we found the default stations, use them
      if (this.radioStations.length > 0) {
        this.displayRadioStations(this.radioStations);
      } else {
        // Fallback to hardcoded stations
        this.loadFallbackStations();
      }
    } catch (error) {
      console.error("Error loading default stations:", error);
      // Fallback to hardcoded popular stations
      this.loadFallbackStations();
    }
  }

  loadFallbackStations() {
    // Default radio stations: Zaycev stations, fn, german 1 live, wdr
    // Note: These URLs are placeholders and may need to be updated with actual working streams
    this.radioStations = [
      {
        name: "Zaycev.FM Relax",
        url_resolved: "https://zaycevfm.cdnvideo.ru/ZaycevFM_relax_128.mp3",
        tags: "chill, lounge, relax",
      },
      {
        name: "Zaycev.FM Pop",
        url_resolved: "https://zaycevfm.cdnvideo.ru/ZaycevFM_pop_128.mp3",
        tags: "hits, pop music",
      },
      {
        name: "Zaycev.FM NewRock",
        url_resolved: "https://zaycevfm.cdnvideo.ru/ZaycevFM_newrock_128.mp3",
        tags: "alternative rock, rock",
      },
      {
        name: "Funkhaus Europa",
        url_resolved:
          "https://funkhauseuropa.icecast.ndr.de/funkhauseuropa/live/mp3/128/stream.mp3",
        tags: "german, radio",
      },
      {
        name: "1LIVE",
        url_resolved:
          "https://wdr-1live-live.icecastssl.wdr.de/wdr/1live/live/mp3/128/stream.mp3",
        tags: "german, music, 1live",
      },
      {
        name: "WDR",
        url_resolved:
          "https://wdr-wdr2-rheinland.icecastssl.wdr.de/wdr/wdr2/rheinland/mp3/128/stream.mp3",
        tags: "german, wdr, radio",
      },
    ];
    this.displayRadioStations(this.radioStations);
  }

  async searchRadioStations() {
    const searchTerm = document.getElementById("radio-search-input").value;
    const stationsList = document.getElementById("radio-stations-list");

    if (!searchTerm.trim()) {
      this.loadDefaultStations();
      return;
    }

    stationsList.innerHTML = '<div class="radio-loading">Searching...</div>';

    try {
      const response = await fetch(
        `https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(
          searchTerm
        )}&limit=20&order=votes&reverse=true`
      );
      const stations = await response.json();
      this.radioStations = stations.filter((s) => s.url_resolved && s.name);
      this.displayRadioStations(this.radioStations);
    } catch (error) {
      console.error("Error searching stations:", error);
      stationsList.innerHTML =
        '<div class="radio-loading">Error loading stations. Please try again.</div>';
    }
  }

  displayRadioStations(stations) {
    const stationsList = document.getElementById("radio-stations-list");

    if (stations.length === 0) {
      stationsList.innerHTML =
        '<div class="radio-loading">No stations found.</div>';
      return;
    }

    stationsList.innerHTML = stations
      .map(
        (station, index) => `
      <div class="radio-station-item" data-index="${index}">
        <div class="radio-station-name">${this.escapeHtml(station.name)}</div>
        <div class="radio-station-info">${this.escapeHtml(
          station.tags || "Music"
        )}</div>
      </div>
    `
      )
      .join("");

    // Add click listeners
    stationsList
      .querySelectorAll(".radio-station-item")
      .forEach((item, index) => {
        item.addEventListener("click", () => this.playStation(stations[index]));
      });
  }

  playStation(station) {
    // Stop current audio if playing
    if (this.audio) {
      this.audio.pause();
      this.audio = null;
    }

    // Update UI
    document.querySelectorAll(".radio-station-item").forEach((item) => {
      item.classList.remove("playing");
    });
    const stationItems = document.querySelectorAll(".radio-station-item");
    const stationIndex = this.radioStations.findIndex(
      (s) => s.name === station.name
    );
    if (stationItems[stationIndex]) {
      stationItems[stationIndex].classList.add("playing");
    }

    // Create new audio element
    this.audio = new Audio(station.url_resolved);
    this.audio.crossOrigin = "anonymous";

    this.audio.addEventListener("loadeddata", () => {
      this.isPlaying = true;
      this.currentStation = station;
      this.updatePlayerControls();
      this.audio.play().catch((error) => {
        console.error("Error playing station:", error);
        alert("Unable to play this station. Please try another one.");
      });
    });

    this.audio.addEventListener("error", (e) => {
      console.error("Audio error:", e);
      alert("Error loading station. Please try another one.");
      this.isPlaying = false;
      this.updatePlayerControls();
    });

    this.audio.addEventListener("ended", () => {
      this.isPlaying = false;
      this.updatePlayerControls();
    });
  }

  togglePlayPause() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play();
      this.isPlaying = true;
    }
    this.updatePlayerControls();
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio = null;
    }
    this.isPlaying = false;
    this.currentStation = null;
    this.updatePlayerControls();

    // Remove playing class from stations
    document.querySelectorAll(".radio-station-item").forEach((item) => {
      item.classList.remove("playing");
    });
  }

  updatePlayerControls() {
    const controls = document.getElementById("radio-player-controls");
    const playPauseBtn = document.getElementById("radio-play-pause");
    const stationName = document.getElementById("current-station-name");
    const slider = document.getElementById("radio-slider");

    if (this.currentStation) {
      controls.style.display = "block";
      stationName.textContent = this.currentStation.name;
      playPauseBtn.textContent = this.isPlaying ? "⏸" : "▶";

      // If slider is closed, make controls float
      if (!slider.classList.contains("open")) {
        controls.classList.add("floating");
      } else {
        controls.classList.remove("floating");
      }
    } else {
      controls.style.display = "none";
      controls.classList.remove("floating");
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}
