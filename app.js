class LumiaDemo {
  constructor() {
    this.state = {
      unlocked: false,
      section: "home",
      currentApp: null,
      appHistory: [],
      notifications: ["Welcome to Lumia demo"],
      weatherIndex: 0,
      musicPlaying: false,
      progress: 0,
      chargeEnabled: true,
      calcExpr: "0",
      photoCount: 0,
    };

    this.weatherPool = [
      { t: "21°C", d: "Sunny" },
      { t: "18°C", d: "Cloudy" },
      { t: "16°C", d: "Rain showers" },
      { t: "23°C", d: "Clear sky" },
    ];

    this.appNames = ["phone", "messaging", "camera", "photos", "music", "calculator", "weather", "settings", "calendar", "browser"];
    this.el = {};
  }

  init() {
    this.cacheDom();
    this.buildStaticUIs();
    this.bindEvents();
    this.startBoot();
    this.startDynamicSystems();
  }

  cacheDom() {
    this.el.phone = document.querySelector(".phone");
    this.el.boot = document.getElementById("boot-screen");
    this.el.lock = document.getElementById("lock-screen");
    this.el.os = document.getElementById("os-screen");
    this.el.lockTime = document.getElementById("lock-time");
    this.el.lockDate = document.getElementById("lock-date");
    this.el.statusTime = document.getElementById("status-time");
    this.el.viewport = document.getElementById("section-viewport");
    this.el.homeSection = document.getElementById("home-section");
    this.el.tileGrid = document.getElementById("tile-grid");
    this.el.appHost = document.getElementById("app-host");
    this.el.multitask = document.getElementById("multitask-view");
    this.el.multitaskCards = document.getElementById("multitask-cards");
    this.el.notificationCenter = document.getElementById("notification-center");
    this.el.notificationList = document.getElementById("notification-list");
    this.el.toastContainer = document.getElementById("toast-container");
  }

  buildStaticUIs() {
    const dialPad = document.getElementById("dial-pad");
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].forEach((n) => {
      const b = document.createElement("button");
      b.textContent = n;
      b.type = "button";
      b.dataset.dial = n;
      dialPad.appendChild(b);
    });

    const calcGrid = document.getElementById("calc-grid");
    ["7", "8", "9", "/", "4", "5", "6", "*", "1", "2", "3", "-", "0", ".", "=", "+", "C"].forEach((k) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = k;
      b.dataset.calc = k;
      calcGrid.appendChild(b);
    });

    const photosGrid = document.getElementById("photos-grid");
    for (let i = 1; i <= 12; i += 1) {
      const p = document.createElement("button");
      p.type = "button";
      p.textContent = "";
      p.style.background = `linear-gradient(145deg, hsl(${180 + i * 8} 45% 48%), hsl(${210 + i * 4} 45% 25%))`;
      p.title = `Photo ${i}`;
      photosGrid.appendChild(p);
    }

    const now = new Date();
    this.renderCalendar(now.getFullYear(), now.getMonth(), now.getDate());
    this.renderNotifications();
    this.seedMessages();
  }

  bindEvents() {
    // Global navigation buttons.
    document.getElementById("btn-home").addEventListener("click", () => this.handleHome());
    document.getElementById("btn-back").addEventListener("click", () => this.handleBack());
    document.getElementById("btn-search").addEventListener("click", () => this.showToast("Search pressed"));

    // Lock-screen swipe gesture.
    this.bindLockUnlockGesture();

    // Horizontal section navigation.
    this.bindSectionSwipe();

    // Tile and app open interactions.
    document.querySelectorAll("[data-app]").forEach((node) => {
      node.addEventListener("click", () => this.openApp(node.dataset.app));
      node.addEventListener("pointerdown", () => this.addRipple(node));
    });

    // Long press visual effect + draggable tiles.
    this.bindTileLongPress();
    this.bindTileDragDrop();

    document.querySelectorAll(".app-back").forEach((b) => b.addEventListener("click", () => this.closeApp()));

    // Notification center and multitask panel gestures.
    document.querySelector(".status-bar").addEventListener("click", () => this.toggleNotifications());
    document.getElementById("show-multitask").addEventListener("click", () => this.toggleMultitask(true));

    // App feature bindings.
    this.bindDialer();
    this.bindMessaging();
    this.bindCamera();
    this.bindPhotos();
    this.bindMusic();
    this.bindCalculator();
    this.bindSettings();
    this.bindBrowser();

    // Parallax wallpaper effect while scrolling tiles.
    this.el.homeSection.addEventListener("scroll", () => {
      const y = this.el.homeSection.scrollTop;
      this.el.homeSection.style.backgroundPosition = `center ${-y * 0.2}px`;
    });
  }

  startBoot() {
    setTimeout(() => {
      this.activateLayer("lock");
      this.updateClock();
    }, 1700);
  }

  startDynamicSystems() {
    setInterval(() => this.updateClock(), 1000);
    setInterval(() => this.rotateWeather(), 9000);
    setInterval(() => this.simulateSignalBattery(), 4500);
    setInterval(() => this.tickMusic(), 1000);

    this.showToast("System ready");
  }

  activateLayer(name) {
    this.el.boot.classList.toggle("active", name === "boot");
    this.el.lock.classList.toggle("active", name === "lock");
    this.el.os.classList.toggle("active", name === "os");
  }

  updateClock() {
    const dt = new Date();
    const time = dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    this.el.lockTime.textContent = time;
    this.el.statusTime.textContent = time;
    this.el.lockDate.textContent = dt.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
  }

  bindLockUnlockGesture() {
    let startY = 0;
    let dragging = false;
    this.el.lock.addEventListener("pointerdown", (e) => {
      startY = e.clientY;
      dragging = true;
      this.el.lock.style.transition = "none";
    });

    window.addEventListener("pointermove", (e) => {
      if (!dragging || this.state.unlocked) return;
      const delta = Math.min(0, e.clientY - startY);
      this.el.lock.style.transform = `translateY(${delta}px)`;
    });

    window.addEventListener("pointerup", (e) => {
      if (!dragging || this.state.unlocked) return;
      dragging = false;
      const delta = e.clientY - startY;
      this.el.lock.style.transition = "transform .35s ease, opacity .35s ease";
      if (delta < -90) {
        this.state.unlocked = true;
        this.el.lock.style.transform = "translateY(-100%)";
        this.el.lock.style.opacity = "0";
        setTimeout(() => {
          this.activateLayer("os");
          this.el.lock.style.transform = "";
          this.el.lock.style.opacity = "";
        }, 350);
        this.showToast("Unlocked");
      } else {
        this.el.lock.style.transform = "";
      }
    });
  }

  bindSectionSwipe() {
    let x0 = 0;
    let dragging = false;
    this.el.viewport.addEventListener("pointerdown", (e) => {
      x0 = e.clientX;
      dragging = true;
    });

    this.el.viewport.addEventListener("pointerup", (e) => {
      if (!dragging || this.state.currentApp) return;
      dragging = false;
      const dx = e.clientX - x0;
      if (dx < -55) this.showSection("apps");
      if (dx > 55) this.showSection("home");
    });
  }

  showSection(name) {
    this.state.section = name;
    this.el.viewport.classList.toggle("show-apps", name === "apps");
  }

  openApp(app) {
    if (!this.appNames.includes(app)) return;
    this.state.currentApp = app;
    if (!this.state.appHistory.includes(app)) this.state.appHistory.unshift(app);

    this.el.appHost.classList.add("active");
    document.querySelectorAll(".app-screen").forEach((screen) => {
      screen.classList.toggle("active", screen.dataset.app === app);
    });

    this.updateMultitaskCards();
    this.showToast(`${app} opened`);
    this.soundHook("open");
    this.vibrate(18);
  }

  closeApp() {
    this.state.currentApp = null;
    this.el.appHost.classList.remove("active");
    document.querySelectorAll(".app-screen").forEach((s) => s.classList.remove("active"));
    this.soundHook("close");
  }

  handleBack() {
    if (this.el.multitask.classList.contains("open")) {
      this.toggleMultitask(false);
      return;
    }

    if (this.state.currentApp) {
      this.closeApp();
      return;
    }

    if (this.state.section === "apps") {
      this.showSection("home");
      return;
    }

    this.toggleNotifications(false);
    this.vibrate(10);
  }

  handleHome() {
    this.closeApp();
    this.toggleMultitask(false);
    this.toggleNotifications(false);
    this.showSection("home");
  }

  bindTileLongPress() {
    let pressTimer;
    document.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("pointerdown", () => {
        pressTimer = setTimeout(() => tile.classList.add("long-press"), 500);
      });
      ["pointerup", "pointerleave"].forEach((evt) => {
        tile.addEventListener(evt, () => {
          clearTimeout(pressTimer);
          setTimeout(() => tile.classList.remove("long-press"), 180);
        });
      });
    });
  }

  bindTileDragDrop() {
    let dragged;
    this.el.tileGrid.querySelectorAll(".tile").forEach((tile) => {
      tile.addEventListener("dragstart", (e) => {
        dragged = tile;
        tile.classList.add("pressed");
        e.dataTransfer.effectAllowed = "move";
      });
      tile.addEventListener("dragend", () => tile.classList.remove("pressed"));
      tile.addEventListener("dragover", (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      });
      tile.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!dragged || dragged === tile) return;
        const children = [...this.el.tileGrid.children];
        const src = children.indexOf(dragged);
        const dst = children.indexOf(tile);
        if (src < dst) this.el.tileGrid.insertBefore(dragged, tile.nextSibling);
        else this.el.tileGrid.insertBefore(dragged, tile);
        this.showToast("Tile moved");
      });
    });
  }

  bindDialer() {
    const display = document.getElementById("dialer-display");
    document.getElementById("dial-pad").addEventListener("click", (e) => {
      const digit = e.target.dataset.dial;
      if (!digit) return;
      display.textContent = (display.textContent.trim() + digit).slice(0, 20);
    });

    document.getElementById("dial-call").addEventListener("click", () => {
      const number = display.textContent.trim() || "unknown";
      this.notify(`Calling ${number}`);
      display.textContent = "";
    });
  }

  seedMessages() {
    const thread = document.getElementById("message-thread");
    ["Hey, are you coming tonight?", "Yep, see you at 8!"].forEach((msg) => {
      const li = document.createElement("li");
      li.textContent = msg;
      thread.appendChild(li);
    });
  }

  bindMessaging() {
    document.getElementById("message-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("message-input");
      const text = input.value.trim();
      if (!text) return;
      const li = document.createElement("li");
      li.textContent = text;
      document.getElementById("message-thread").appendChild(li);
      document.getElementById("message-preview").textContent = `New: ${text.slice(0, 18)}`;
      input.value = "";
      this.notify("Message sent");
    });
  }

  bindCamera() {
    const finder = document.getElementById("camera-viewfinder");
    const count = document.getElementById("camera-counter");
    document.getElementById("camera-shutter").addEventListener("click", () => {
      this.state.photoCount += 1;
      finder.classList.add("flash");
      count.textContent = `Photos taken: ${this.state.photoCount}`;
      setTimeout(() => finder.classList.remove("flash"), 220);
      this.notify("Photo captured");
    });
  }

  bindPhotos() {
    document.getElementById("photos-grid").addEventListener("click", (e) => {
      if (e.target.tagName !== "BUTTON") return;
      this.showToast(e.target.title);
    });
  }

  bindMusic() {
    const trackLabel = document.getElementById("track-name");
    const tracks = ["Lumia Groove", "Night Metro", "Skyline Beats"];
    let i = 0;

    document.getElementById("music-toggle").addEventListener("click", (e) => {
      this.state.musicPlaying = !this.state.musicPlaying;
      e.target.textContent = this.state.musicPlaying ? "Pause" : "Play";
      this.showToast(this.state.musicPlaying ? "Playback started" : "Playback paused");
    });

    document.getElementById("music-next").addEventListener("click", () => {
      i = (i + 1) % tracks.length;
      this.state.progress = 0;
      trackLabel.textContent = tracks[i];
      document.getElementById("music-now").textContent = `Now: ${tracks[i]}`;
      this.notify(`Now playing ${tracks[i]}`);
    });
  }

  tickMusic() {
    if (!this.state.musicPlaying) return;
    this.state.progress = (this.state.progress + 4) % 101;
    document.getElementById("track-progress").style.width = `${this.state.progress}%`;
  }

  bindCalculator() {
    const display = document.getElementById("calc-display");
    document.getElementById("calc-grid").addEventListener("click", (e) => {
      const key = e.target.dataset.calc;
      if (!key) return;

      if (key === "C") {
        this.state.calcExpr = "0";
      } else if (key === "=") {
        this.state.calcExpr = this.safeEval(this.state.calcExpr);
      } else {
        this.state.calcExpr = this.state.calcExpr === "0" ? key : `${this.state.calcExpr}${key}`;
      }

      display.textContent = this.state.calcExpr;
    });
  }

  safeEval(expr) {
    if (!/^[0-9+\-*/.()\s]+$/.test(expr)) return "0";
    const tokens = expr.match(/\d*\.?\d+|[()+\-*/]/g);
    if (!tokens) return "0";

    const output = [];
    const operators = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2 };

    for (const token of tokens) {
      if (/^\d*\.?\d+$/.test(token)) {
        output.push(Number(token));
      } else if (token in precedence) {
        while (
          operators.length &&
          operators[operators.length - 1] in precedence &&
          precedence[operators[operators.length - 1]] >= precedence[token]
        ) {
          output.push(operators.pop());
        }
        operators.push(token);
      } else if (token === "(") {
        operators.push(token);
      } else if (token === ")") {
        while (operators.length && operators[operators.length - 1] !== "(") {
          output.push(operators.pop());
        }
        if (!operators.length) return "0";
        operators.pop();
      }
    }

    while (operators.length) {
      const op = operators.pop();
      if (op === "(" || op === ")") return "0";
      output.push(op);
    }

    const stack = [];
    for (const item of output) {
      if (typeof item === "number") {
        stack.push(item);
        continue;
      }
      const b = stack.pop();
      const a = stack.pop();
      if (typeof a !== "number" || typeof b !== "number") return "0";
      if (item === "+") stack.push(a + b);
      if (item === "-") stack.push(a - b);
      if (item === "*") stack.push(a * b);
      if (item === "/") stack.push(b === 0 ? 0 : a / b);
    }

    const result = stack.pop();
    return Number.isFinite(result) ? String(result) : "0";
  }

  bindSettings() {
    document.getElementById("accent-select").addEventListener("change", (e) => {
      document.documentElement.style.setProperty("--accent", e.target.value);
      this.showToast("Accent updated");
    });

    document.getElementById("theme-toggle").addEventListener("change", (e) => {
      this.el.phone.classList.toggle("light-theme", e.target.checked);
      this.showToast(e.target.checked ? "Light mode" : "Dark mode");
    });

    document.getElementById("charge-toggle").addEventListener("change", (e) => {
      this.state.chargeEnabled = e.target.checked;
      this.el.phone.classList.toggle("charging", this.state.chargeEnabled);
    });
  }

  bindBrowser() {
    document.getElementById("browser-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const url = document.getElementById("browser-url").value.trim() || "bing.com";
      const host = url.replace(/^https?:\/\//, "").split("/")[0];
      const page = document.getElementById("browser-page");
      page.replaceChildren();
      const h4 = document.createElement("h4");
      h4.textContent = host;
      const p = document.createElement("p");
      p.textContent = `This is a local Lumia browser mockup rendering ${host}.`;
      page.append(h4, p);
      this.showToast(`Loaded ${host}`);
    });
  }

  renderCalendar(year, month, today) {
    const title = document.getElementById("calendar-title");
    title.textContent = new Date(year, month).toLocaleDateString([], { month: "long", year: "numeric" });

    const grid = document.getElementById("calendar-grid");
    grid.innerHTML = "";
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i += 1) {
      grid.appendChild(document.createElement("span"));
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      const cell = document.createElement("span");
      cell.textContent = d;
      if (d === today) cell.classList.add("today");
      grid.appendChild(cell);
    }
  }

  rotateWeather() {
    this.state.weatherIndex = (this.state.weatherIndex + 1) % this.weatherPool.length;
    const w = this.weatherPool[this.state.weatherIndex];
    document.getElementById("weather-main").textContent = w.t;
    document.getElementById("weather-desc").textContent = w.d;
    document.getElementById("weather-updated").textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    document.getElementById("weather-tile").textContent = `${w.t} · ${w.d}`;
  }

  simulateSignalBattery() {
    const levels = ["▰▰▱▱", "▰▰▰▱", "▰▰▰▰"];
    const signals = ["▂▄", "▂▄▆", "▂▄▆█"];
    document.getElementById("battery-icon").textContent = levels[Math.floor(Math.random() * levels.length)];
    document.getElementById("signal-icon").textContent = signals[Math.floor(Math.random() * signals.length)];
    this.el.phone.classList.toggle("charging", this.state.chargeEnabled && Math.random() > 0.62);
  }

  toggleNotifications(force) {
    const shouldOpen = typeof force === "boolean" ? force : !this.el.notificationCenter.classList.contains("open");
    this.el.notificationCenter.classList.toggle("open", shouldOpen);
  }

  notify(message) {
    this.state.notifications.unshift(message);
    this.state.notifications = this.state.notifications.slice(0, 8);
    this.renderNotifications();
    this.showToast(message);
  }

  renderNotifications() {
    this.el.notificationList.innerHTML = "";
    this.state.notifications.forEach((n) => {
      const li = document.createElement("li");
      li.textContent = n;
      this.el.notificationList.appendChild(li);
    });
  }

  toggleMultitask(force) {
    const open = typeof force === "boolean" ? force : !this.el.multitask.classList.contains("open");
    this.el.multitask.classList.toggle("open", open);
    this.updateMultitaskCards();
  }

  updateMultitaskCards() {
    this.el.multitaskCards.innerHTML = "";
    if (!this.state.appHistory.length) {
      const empty = document.createElement("button");
      empty.type = "button";
      empty.textContent = "No recent apps";
      this.el.multitaskCards.appendChild(empty);
      return;
    }

    this.state.appHistory.forEach((app) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = app;
      btn.addEventListener("click", () => {
        this.toggleMultitask(false);
        this.openApp(app);
      });
      this.el.multitaskCards.appendChild(btn);
    });
  }

  addRipple(node) {
    node.classList.add("ripple");
    setTimeout(() => node.classList.remove("ripple"), 360);
  }

  vibrate(duration = 10) {
    if (navigator.vibrate) navigator.vibrate(duration);
  }

  soundHook(type) {
    // Hook point for sound effects; currently logs for local demo use.
    console.debug("sound-hook", type);
  }

  showToast(text) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    this.el.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const demo = new LumiaDemo();
  demo.init();
});
