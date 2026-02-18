// Radio Player Class
class RadioPlayer {
  constructor() {
    this.audio = null;
    this.currentStation = null;
    this.isPlaying = false;
    this.radioStations = [];
    this.danceInterval = null;
    this.katrineDanceInterval = null;
    this.lianaDanceInterval = null;
    this.ruslanDanceInterval = null;
    this.melodyInterval = null;
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
    const danceBtn = document.getElementById("radio-dance");

    radioToggle.addEventListener("click", () => this.toggleSlider());
    radioClose.addEventListener("click", () => this.closeSlider());

    radioSearchBtn.addEventListener("click", () => this.searchRadioStations());
    radioSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.searchRadioStations();
    });

    playPauseBtn.addEventListener("click", () => this.togglePlayPause());
    stopBtn.addEventListener("click", () => this.stop());
    danceBtn.addEventListener("click", () => this.toggleDance());
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

  toggleDance() {
    const danceSlider = document.getElementById("dance-slider");
    const isVisible = danceSlider.style.display !== "none";

    if (isVisible) {
      this.closeDance();
    } else {
      this.showDance();
    }
  }

  showDance() {
    const danceSlider = document.getElementById("dance-slider");
    
    // Stop any existing animations first to prevent conflicts
    this.stopDancingAnimation();
    this.stopKatrineDancingAnimation();
    this.stopLianaDancingAnimation();
    this.stopRuslanDancingAnimation();
    this.stopMelodies();
    
    danceSlider.style.display = "flex";
    
    // Force a reflow to ensure display change is applied
    danceSlider.offsetHeight;
    
    // Small delay to ensure slider is fully rendered before starting animations
    setTimeout(() => {
      // Start dancing animation (position changes) for all dancers
      this.startDancingAnimation();
      this.startKatrineDancingAnimation();
      this.startLianaDancingAnimation();
      this.startRuslanDancingAnimation();
    }, 50);
    
    // Start moving melodies
    this.startMelodies();
    
    // Add click listener to close on click
    danceSlider.addEventListener("click", () => this.closeDance(), { once: true });
  }

  closeDance() {
    const danceSlider = document.getElementById("dance-slider");
    
    // Stop all animations first
    this.stopDancingAnimation();
    this.stopKatrineDancingAnimation();
    this.stopLianaDancingAnimation();
    this.stopRuslanDancingAnimation();
    this.stopMelodies();
    
    // Hide the slider
    danceSlider.style.display = "none";
    
    // Reset dancer positions to prevent animation glitches
    const dancingPerson = document.getElementById("dancing-person");
    const dancingKatrine = document.getElementById("dancing-katrine");
    const dancingLiana = document.getElementById("dancing-liana");
    const dancingRuslan = document.getElementById("dancing-ruslan");
    
    if (dancingPerson) {
      dancingPerson.style.left = "";
      dancingPerson.style.top = "";
    }
    
    if (dancingKatrine) {
      dancingKatrine.style.left = "";
      dancingKatrine.style.top = "";
    }
    
    if (dancingLiana) {
      dancingLiana.style.left = "";
      dancingLiana.style.top = "";
    }
    
    if (dancingRuslan) {
      dancingRuslan.style.left = "";
      dancingRuslan.style.top = "";
    }
  }

  startDancingAnimation() {
    // Clear any existing interval first
    if (this.danceInterval) {
      clearInterval(this.danceInterval);
      this.danceInterval = null;
    }
    
    const dancingPerson = document.getElementById("dancing-person");
    const dancingKatrine = document.getElementById("dancing-katrine");
    const dancingLiana = document.getElementById("dancing-liana");
    const dancingRuslan = document.getElementById("dancing-ruslan");
    const danceSlider = document.getElementById("dance-slider");
    
    if (!dancingPerson || !danceSlider) return;
    
    // Person dimensions (reduced by 20%, further reduced on mobile)
    const isMobile = window.innerWidth <= 768;
    const personWidth = isMobile ? 120 : 160;
    const personHeight = isMobile ? 180 : 240;
    
    // Helper function to check overlap with all other dancers
    const checkOverlap = (x, y, otherDancers) => {
      // Ensure otherDancers is an array
      const dancersArray = Array.isArray(otherDancers) ? otherDancers : [otherDancers].filter(d => d);
      
      for (const otherPerson of dancersArray) {
        if (!otherPerson) continue;
        const otherRect = otherPerson.getBoundingClientRect();
        const sliderRect = danceSlider.getBoundingClientRect();
        const otherX = otherRect.left - sliderRect.left;
        const otherY = otherRect.top - sliderRect.top;
        
        // Check if rectangles overlap
        if (!(x + personWidth < otherX || 
              otherX + personWidth < x || 
              y + personHeight < otherY || 
              otherY + personHeight < y)) {
          return true;
        }
      }
      return false;
    };
    
    // Random position movement - ensure person stays within screen bounds and doesn't overlap
    this.danceInterval = setInterval(() => {
      const sliderRect = danceSlider.getBoundingClientRect();
      const maxX = sliderRect.width - personWidth;
      const maxY = sliderRect.height - personHeight;
      
      let attempts = 0;
      let randomX, randomY;
      const otherDancers = [dancingKatrine, dancingLiana, dancingRuslan];
      do {
        randomX = Math.max(0, Math.min(maxX, Math.random() * maxX));
        randomY = Math.max(0, Math.min(maxY, Math.random() * maxY));
        attempts++;
      } while (checkOverlap(randomX, randomY, otherDancers) && attempts < 50);
      
      dancingPerson.style.left = `${randomX}px`;
      dancingPerson.style.top = `${randomY}px`;
    }, 3500); // Different timing from Katrine (not synchronized)
    
    // Set initial position
    const sliderRect = danceSlider.getBoundingClientRect();
    const maxX = sliderRect.width - personWidth;
    const maxY = sliderRect.height - personHeight;
    let initialX, initialY;
    let attempts = 0;
    const otherDancers = [dancingKatrine, dancingLiana, dancingRuslan];
    do {
      initialX = Math.max(0, Math.min(maxX, Math.random() * maxX));
      initialY = Math.max(0, Math.min(maxY, Math.random() * maxY));
      attempts++;
    } while (checkOverlap(initialX, initialY, otherDancers) && attempts < 50);
    dancingPerson.style.left = `${initialX}px`;
    dancingPerson.style.top = `${initialY}px`;
  }

  stopDancingAnimation() {
    if (this.danceInterval) {
      clearInterval(this.danceInterval);
      this.danceInterval = null;
    }
  }

  startKatrineDancingAnimation() {
    // Clear any existing interval first
    if (this.katrineDanceInterval) {
      clearInterval(this.katrineDanceInterval);
      this.katrineDanceInterval = null;
    }
    
    const dancingKatrine = document.getElementById("dancing-katrine");
    const dancingPerson = document.getElementById("dancing-person");
    const dancingLiana = document.getElementById("dancing-liana");
    const dancingRuslan = document.getElementById("dancing-ruslan");
    const danceSlider = document.getElementById("dance-slider");
    
    if (!dancingKatrine || !danceSlider) return;
    
    // Person dimensions (reduced by 20%, further reduced on mobile)
    const isMobile = window.innerWidth <= 768;
    const personWidth = isMobile ? 120 : 160;
    const personHeight = isMobile ? 180 : 240;
    
    // Helper function to check overlap with all other dancers
    const checkOverlap = (x, y, otherDancers) => {
      // Ensure otherDancers is an array
      const dancersArray = Array.isArray(otherDancers) ? otherDancers : [otherDancers].filter(d => d);
      
      for (const otherPerson of dancersArray) {
        if (!otherPerson) continue;
        const otherRect = otherPerson.getBoundingClientRect();
        const sliderRect = danceSlider.getBoundingClientRect();
        const otherX = otherRect.left - sliderRect.left;
        const otherY = otherRect.top - sliderRect.top;
        
        // Check if rectangles overlap
        if (!(x + personWidth < otherX || 
              otherX + personWidth < x || 
              y + personHeight < otherY || 
              otherY + personHeight < y)) {
          return true;
        }
      }
      return false;
    };
    
    // Random position movement - ensure person stays within screen bounds and doesn't overlap
    this.katrineDanceInterval = setInterval(() => {
      const sliderRect = danceSlider.getBoundingClientRect();
      const maxX = sliderRect.width - personWidth;
      const maxY = sliderRect.height - personHeight;
      
      let attempts = 0;
      let randomX, randomY;
      const otherDancers = [dancingPerson, dancingLiana, dancingRuslan];
      do {
        randomX = Math.max(0, Math.min(maxX, Math.random() * maxX));
        randomY = Math.max(0, Math.min(maxY, Math.random() * maxY));
        attempts++;
      } while (checkOverlap(randomX, randomY, otherDancers) && attempts < 50);
      
      dancingKatrine.style.left = `${randomX}px`;
      dancingKatrine.style.top = `${randomY}px`;
    }, 4500); // Different timing from Roman (not synchronized)
    
    // Set initial position (different from others and no overlap)
    const sliderRect = danceSlider.getBoundingClientRect();
    const maxX = sliderRect.width - personWidth;
    const maxY = sliderRect.height - personHeight;
    let initialX, initialY;
    let attempts = 0;
    const otherDancers = [dancingPerson, dancingLiana, dancingRuslan].filter(d => d);
    do {
      initialX = Math.max(0, Math.min(maxX, Math.random() * maxX));
      initialY = Math.max(0, Math.min(maxY, Math.random() * maxY));
      attempts++;
    } while (checkOverlap(initialX, initialY, otherDancers) && attempts < 50);
    dancingKatrine.style.left = `${initialX}px`;
    dancingKatrine.style.top = `${initialY}px`;
  }

  stopKatrineDancingAnimation() {
    if (this.katrineDanceInterval) {
      clearInterval(this.katrineDanceInterval);
      this.katrineDanceInterval = null;
    }
  }

  startLianaDancingAnimation() {
    // Clear any existing interval first
    if (this.lianaDanceInterval) {
      clearInterval(this.lianaDanceInterval);
      this.lianaDanceInterval = null;
    }
    
    const dancingLiana = document.getElementById("dancing-liana");
    const dancingPerson = document.getElementById("dancing-person");
    const dancingKatrine = document.getElementById("dancing-katrine");
    const dancingRuslan = document.getElementById("dancing-ruslan");
    const danceSlider = document.getElementById("dance-slider");
    
    if (!dancingLiana || !danceSlider) {
      return;
    }
    
    // Ensure Liana is visible immediately
    dancingLiana.style.display = "block";
    dancingLiana.style.visibility = "visible";
    dancingLiana.style.opacity = "0.85";
    
    // Person dimensions (reduced by 20%, further reduced on mobile)
    const isMobile = window.innerWidth <= 768;
    const personWidth = isMobile ? 120 : 160;
    const personHeight = isMobile ? 180 : 240;
    
    // Helper function to check overlap with all other dancers
    const checkOverlap = (x, y, otherDancers) => {
      // Ensure otherDancers is an array
      const dancersArray = Array.isArray(otherDancers) ? otherDancers : [otherDancers].filter(d => d);
      
      for (const otherPerson of dancersArray) {
        if (!otherPerson) continue;
        const otherRect = otherPerson.getBoundingClientRect();
        const sliderRect = danceSlider.getBoundingClientRect();
        const otherX = otherRect.left - sliderRect.left;
        const otherY = otherRect.top - sliderRect.top;
        
        // Check if rectangles overlap
        if (!(x + personWidth < otherX || 
              otherX + personWidth < x || 
              y + personHeight < otherY || 
              otherY + personHeight < y)) {
          return true;
        }
      }
      return false;
    };
    
    // Random position movement - ensure person stays within screen bounds and doesn't overlap
    this.lianaDanceInterval = setInterval(() => {
      const sliderRect = danceSlider.getBoundingClientRect();
      const maxX = sliderRect.width - personWidth;
      const maxY = sliderRect.height - personHeight;
      
      let attempts = 0;
      let randomX, randomY;
      const otherDancers = [dancingPerson, dancingKatrine, dancingRuslan];
      do {
        randomX = Math.max(0, Math.min(maxX, Math.random() * maxX));
        randomY = Math.max(0, Math.min(maxY, Math.random() * maxY));
        attempts++;
      } while (checkOverlap(randomX, randomY, otherDancers) && attempts < 50);
      
      dancingLiana.style.left = `${randomX}px`;
      dancingLiana.style.top = `${randomY}px`;
    }, 5000); // Different timing (not synchronized)
    
    // Set initial position immediately - set a default first, then improve it
    const setInitialPosition = () => {
      const sliderRect = danceSlider.getBoundingClientRect();
      if (sliderRect.width === 0 || sliderRect.height === 0) {
        // Slider not fully rendered yet, set a temporary position and retry
        dancingLiana.style.left = "100px";
        dancingLiana.style.top = "100px";
        setTimeout(setInitialPosition, 50);
        return;
      }
      
      const maxX = Math.max(0, sliderRect.width - personWidth);
      const maxY = Math.max(0, sliderRect.height - personHeight);
      
      // Set a default position first to ensure visibility
      let initialX = Math.max(0, maxX * 0.6);
      let initialY = Math.max(0, maxY * 0.4);
      
      // Try to find a non-overlapping position
      let attempts = 0;
      const otherDancers = [dancingPerson, dancingKatrine, dancingRuslan].filter(d => d);
      
      // Try to find a better position that doesn't overlap
      while (attempts < 100) {
        const testX = Math.max(0, Math.min(maxX, Math.random() * maxX));
        const testY = Math.max(0, Math.min(maxY, Math.random() * maxY));
        
        if (!checkOverlap(testX, testY, otherDancers)) {
          initialX = testX;
          initialY = testY;
          break;
        }
        attempts++;
      }
      
      // Ensure valid pixel values
      initialX = Math.max(0, Math.round(initialX));
      initialY = Math.max(0, Math.round(initialY));
      
      dancingLiana.style.left = `${initialX}px`;
      dancingLiana.style.top = `${initialY}px`;
      dancingLiana.style.display = "block";
      dancingLiana.style.visibility = "visible";
      dancingLiana.style.opacity = "0.85";
    };
    
    // Set initial position immediately
    setInitialPosition();
    
    // Also set a position after a short delay as backup to ensure it's set
    setTimeout(() => {
      const currentLeft = dancingLiana.style.left;
      const currentTop = dancingLiana.style.top;
      if (!currentLeft || currentLeft === "" || currentTop === "" || !currentTop) {
        setInitialPosition();
      }
    }, 200);
  }

  stopLianaDancingAnimation() {
    if (this.lianaDanceInterval) {
      clearInterval(this.lianaDanceInterval);
      this.lianaDanceInterval = null;
    }
  }

  startRuslanDancingAnimation() {
    // Clear any existing interval first
    if (this.ruslanDanceInterval) {
      clearInterval(this.ruslanDanceInterval);
      this.ruslanDanceInterval = null;
    }
    
    const dancingRuslan = document.getElementById("dancing-ruslan");
    const dancingPerson = document.getElementById("dancing-person");
    const dancingKatrine = document.getElementById("dancing-katrine");
    const dancingLiana = document.getElementById("dancing-liana");
    const danceSlider = document.getElementById("dance-slider");
    
    if (!dancingRuslan || !danceSlider) return;
    
    // Person dimensions (reduced by 20%, further reduced on mobile)
    const isMobile = window.innerWidth <= 768;
    const personWidth = isMobile ? 120 : 160;
    const personHeight = isMobile ? 180 : 240;
    
    // Helper function to check overlap with all other dancers
    const checkOverlap = (x, y, otherDancers) => {
      // Ensure otherDancers is an array
      const dancersArray = Array.isArray(otherDancers) ? otherDancers : [otherDancers].filter(d => d);
      
      for (const otherPerson of dancersArray) {
        if (!otherPerson) continue;
        const otherRect = otherPerson.getBoundingClientRect();
        const sliderRect = danceSlider.getBoundingClientRect();
        const otherX = otherRect.left - sliderRect.left;
        const otherY = otherRect.top - sliderRect.top;
        
        // Check if rectangles overlap
        if (!(x + personWidth < otherX || 
              otherX + personWidth < x || 
              y + personHeight < otherY || 
              otherY + personHeight < y)) {
          return true;
        }
      }
      return false;
    };
    
    // Random position movement - ensure person stays within screen bounds and doesn't overlap
    this.ruslanDanceInterval = setInterval(() => {
      const sliderRect = danceSlider.getBoundingClientRect();
      const maxX = sliderRect.width - personWidth;
      const maxY = sliderRect.height - personHeight;
      
      let attempts = 0;
      let randomX, randomY;
      const otherDancers = [dancingPerson, dancingKatrine, dancingLiana];
      do {
        randomX = Math.max(0, Math.min(maxX, Math.random() * maxX));
        randomY = Math.max(0, Math.min(maxY, Math.random() * maxY));
        attempts++;
      } while (checkOverlap(randomX, randomY, otherDancers) && attempts < 50);
      
      dancingRuslan.style.left = `${randomX}px`;
      dancingRuslan.style.top = `${randomY}px`;
    }, 5500); // Different timing (not synchronized)
    
    // Set initial position
    const sliderRect = danceSlider.getBoundingClientRect();
    const maxX = sliderRect.width - personWidth;
    const maxY = sliderRect.height - personHeight;
    let initialX, initialY;
    let attempts = 0;
    const otherDancers = [dancingPerson, dancingKatrine, dancingLiana];
    do {
      initialX = Math.max(0, Math.min(maxX, Math.random() * maxX));
      initialY = Math.max(0, Math.min(maxY, Math.random() * maxY));
      attempts++;
    } while (checkOverlap(initialX, initialY, otherDancers) && attempts < 50);
    dancingRuslan.style.left = `${initialX}px`;
    dancingRuslan.style.top = `${initialY}px`;
  }

  stopRuslanDancingAnimation() {
    if (this.ruslanDanceInterval) {
      clearInterval(this.ruslanDanceInterval);
      this.ruslanDanceInterval = null;
    }
  }

  startMelodies() {
    // Clear any existing interval first
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    
    const melodiesContainer = document.getElementById("dance-melodies");
    if (!melodiesContainer) return;
    
    const musicalNotes = ["♪", "♫", "♬", "♩", "♭", "♮", "♯", "𝄞", "𝄢", "🎵", "🎶"];
    
    // Create melodies periodically
    this.melodyInterval = setInterval(() => {
      const melody = document.createElement("div");
      melody.className = "dance-melody";
      melody.textContent = musicalNotes[Math.floor(Math.random() * musicalNotes.length)];
      
      // Random starting position
      const startX = Math.random() * 100;
      melody.style.left = `${startX}%`;
      
      // Random delay for variety
      melody.style.animationDelay = `${Math.random() * 2}s`;
      
      // Random size
      const size = Math.random() * 2 + 1.5; // 1.5rem to 3.5rem
      melody.style.fontSize = `${size}rem`;
      
      melodiesContainer.appendChild(melody);
      
      // Remove after animation completes
      setTimeout(() => {
        if (melody.parentNode) {
          melody.parentNode.removeChild(melody);
        }
      }, 20000);
    }, 800); // Create a new melody every 800ms
  }

  stopMelodies() {
    if (this.melodyInterval) {
      clearInterval(this.melodyInterval);
      this.melodyInterval = null;
    }
    
    // Clear all existing melodies
    const melodiesContainer = document.getElementById("dance-melodies");
    if (melodiesContainer) {
      melodiesContainer.innerHTML = "";
    }
  }
}
