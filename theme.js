// Light/dark theme toggle for the page chrome (not the Phaser canvas).
// The initial theme (read from localStorage) is applied by the inline
// script in <head> before the page renders; this file just wires up the
// toggle button and keeps localStorage in sync going forward.
(function () {
  var STORAGE_KEY = 'coin-dash-theme';
  var button = document.getElementById('theme-toggle');
  if (!button) return;

  function isLight() {
    return document.documentElement.classList.contains('light-theme');
  }

  function render() {
    if (isLight()) {
      button.textContent = '☀ Light mode';
      button.setAttribute('aria-label', 'Switch to dark mode');
    } else {
      button.textContent = '🌙 Dark mode';
      button.setAttribute('aria-label', 'Switch to light mode');
    }
  }

  function setTheme(light) {
    document.documentElement.classList.toggle('light-theme', light);
    try {
      localStorage.setItem(STORAGE_KEY, light ? 'light' : 'dark');
    } catch (e) {
      // localStorage unavailable (e.g. private browsing) — theme just
      // won't persist across reloads.
    }
    render();
  }

  button.addEventListener('click', function () {
    setTheme(!isLight());
  });

  render();
})();
