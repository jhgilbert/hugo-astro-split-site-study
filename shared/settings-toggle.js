// Settings toggle script — shared between Hugo and Astro.
// Restores user preferences from localStorage on page load
// and wires up toggle buttons.
(function () {
  // Restore persisted settings immediately (before paint)
  var theme = localStorage.getItem('theme');
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  var density = localStorage.getItem('density');
  if (density === 'compact') {
    document.documentElement.setAttribute('data-density', 'compact');
  }

  document.addEventListener('DOMContentLoaded', function () {
    var themeBtn = document.getElementById('theme-toggle');
    var densityBtn = document.getElementById('density-toggle');

    if (themeBtn) {
      updateThemeButton(themeBtn);
      themeBtn.addEventListener('click', function () {
        var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        if (isDark) {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        } else {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        }
        updateThemeButton(themeBtn);
      });
    }

    if (densityBtn) {
      updateDensityButton(densityBtn);
      densityBtn.addEventListener('click', function () {
        var isCompact = document.documentElement.getAttribute('data-density') === 'compact';
        if (isCompact) {
          document.documentElement.removeAttribute('data-density');
          localStorage.setItem('density', 'standard');
        } else {
          document.documentElement.setAttribute('data-density', 'compact');
          localStorage.setItem('density', 'compact');
        }
        updateDensityButton(densityBtn);
      });
    }
  });

  function updateThemeButton(btn) {
    var isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    btn.textContent = isDark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function updateDensityButton(btn) {
    var isCompact = document.documentElement.getAttribute('data-density') === 'compact';
    btn.textContent = isCompact ? '↕️' : '↔️';
    btn.setAttribute('aria-label', isCompact ? 'Switch to standard spacing' : 'Switch to compact spacing');
  }
})();
