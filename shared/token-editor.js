// Token editor — shared between Hugo and Astro.
// Provides a slide-out panel for live-editing CSS design tokens.
(function () {
  var TOKEN_GROUPS = [
    {
      label: 'Primary & Secondary',
      type: 'color',
      tokens: [
        '--color-primary',
        '--color-primary-hover',
        '--color-primary-light',
        '--color-secondary',
        '--color-secondary-hover',
        '--color-secondary-light',
      ],
    },
    {
      label: 'Grays',
      type: 'color',
      tokens: [
        '--color-gray-50',
        '--color-gray-100',
        '--color-gray-200',
        '--color-gray-300',
        '--color-gray-400',
        '--color-gray-500',
        '--color-gray-600',
        '--color-gray-700',
        '--color-gray-800',
        '--color-gray-900',
      ],
    },
    {
      label: 'Semantic Colors',
      type: 'color',
      tokens: [
        '--color-text',
        '--color-text-muted',
        '--color-bg',
        '--color-bg-subtle',
        '--color-border',
      ],
    },
    {
      label: 'Alert Colors',
      type: 'color',
      tokens: [
        '--color-info',
        '--color-info-bg',
        '--color-info-border',
        '--color-warning',
        '--color-warning-bg',
        '--color-warning-border',
        '--color-error',
        '--color-error-bg',
        '--color-error-border',
        '--color-success',
        '--color-success-bg',
        '--color-success-border',
      ],
    },
    {
      label: 'Code Syntax',
      type: 'color',
      tokens: [
        '--code-bg',
        '--code-border',
        '--code-keyword',
        '--code-string',
        '--code-comment',
        '--code-function',
        '--code-number',
        '--code-operator',
        '--code-variable',
        '--code-type',
        '--code-attr',
        '--code-tag',
        '--code-punctuation',
        '--code-plain',
      ],
    },
    {
      label: 'Typography',
      type: 'text',
      tokens: [
        '--font-family-base',
        '--font-family-mono',
        '--font-size-xs',
        '--font-size-sm',
        '--font-size-base',
        '--font-size-lg',
        '--font-size-xl',
        '--font-size-2xl',
        '--font-size-3xl',
        '--font-weight-normal',
        '--font-weight-medium',
        '--font-weight-semibold',
        '--font-weight-bold',
        '--line-height-tight',
        '--line-height-base',
        '--line-height-relaxed',
      ],
    },
    {
      label: 'Spacing',
      type: 'text',
      tokens: [
        '--space-xs',
        '--space-sm',
        '--space-md',
        '--space-lg',
        '--space-xl',
        '--space-2xl',
        '--space-3xl',
      ],
    },
    {
      label: 'Border Radius',
      type: 'text',
      tokens: ['--radius-sm', '--radius-md', '--radius-lg', '--radius-full'],
    },
    {
      label: 'Transitions',
      type: 'text',
      tokens: [
        '--transition-fast',
        '--transition-base',
        '--transition-slow',
      ],
    },
    {
      label: 'Shadows',
      type: 'text',
      tokens: ['--shadow-sm', '--shadow-md'],
    },
    {
      label: 'Layout',
      type: 'text',
      tokens: ['--sidebar-width', '--header-height'],
    },
  ];

  var panel = null;
  var inputMap = {}; // token name → input element
  var isOpen = false;

  function rgbToHex(rgb) {
    if (!rgb) return '#000000';
    // Handle hex values passed through directly
    if (rgb.charAt(0) === '#') return rgb;
    var match = rgb.match(
      /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/
    );
    if (!match) return '#000000';
    var r = parseInt(match[1], 10);
    var g = parseInt(match[2], 10);
    var b = parseInt(match[3], 10);
    return (
      '#' +
      ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)
    );
  }

  function getTokenValue(name) {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }

  function isTokenOverridden(name) {
    return document.documentElement.style.getPropertyValue(name) !== '';
  }

  function buildPanel() {
    var aside = document.createElement('aside');
    aside.className = 'token-editor';
    aside.setAttribute('role', 'dialog');
    aside.setAttribute('aria-label', 'Design token editor');
    aside.id = 'token-editor-panel';

    // Header
    var header = document.createElement('div');
    header.className = 'token-editor__header';

    var title = document.createElement('h2');
    title.className = 'token-editor__title';
    title.textContent = 'Design Tokens';

    var headerActions = document.createElement('div');
    headerActions.className = 'token-editor__header-actions';

    var resetAll = document.createElement('button');
    resetAll.className = 'token-editor__reset-all';
    resetAll.textContent = 'Reset All';
    resetAll.type = 'button';
    resetAll.addEventListener('click', handleResetAll);

    var closeBtn = document.createElement('button');
    closeBtn.className = 'token-editor__close';
    closeBtn.textContent = '\u00d7';
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close token editor');
    closeBtn.addEventListener('click', closePanel);

    headerActions.appendChild(resetAll);
    headerActions.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(headerActions);

    // Body
    var body = document.createElement('div');
    body.className = 'token-editor__body';

    for (var g = 0; g < TOKEN_GROUPS.length; g++) {
      var group = TOKEN_GROUPS[g];
      var details = document.createElement('details');
      details.className = 'token-editor__group';
      details.open = true;

      var summary = document.createElement('summary');
      summary.textContent = group.label;
      details.appendChild(summary);

      var fields = document.createElement('div');
      fields.className = 'token-editor__fields';

      for (var t = 0; t < group.tokens.length; t++) {
        var tokenName = group.tokens[t];
        var field = buildField(tokenName, group.type);
        fields.appendChild(field);
      }

      details.appendChild(fields);
      body.appendChild(details);
    }

    aside.appendChild(header);
    aside.appendChild(body);
    document.body.appendChild(aside);

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) {
        closePanel();
      }
    });

    return aside;
  }

  function buildField(tokenName, type) {
    var field = document.createElement('div');
    field.className = 'token-editor__field';
    field.setAttribute('data-token', tokenName);

    var label = document.createElement('label');
    label.className = 'token-editor__label';
    // Display a short version: strip the -- prefix
    label.textContent = tokenName.substring(2);
    label.title = tokenName;

    var input;
    if (type === 'color') {
      input = document.createElement('input');
      input.type = 'color';
      input.className = 'token-editor__input--color';
    } else {
      input = document.createElement('input');
      input.type = 'text';
      input.className = 'token-editor__input--text';
    }

    var inputId = 'te-' + tokenName.substring(2);
    input.id = inputId;
    label.setAttribute('for', inputId);
    input.setAttribute('data-token', tokenName);
    input.setAttribute('data-type', type);

    input.addEventListener('input', function () {
      var name = this.getAttribute('data-token');
      document.documentElement.style.setProperty(name, this.value);
      updateFieldModifiedState(field, name);
    });

    var resetBtn = document.createElement('button');
    resetBtn.className = 'token-editor__reset';
    resetBtn.textContent = '\u21ba';
    resetBtn.type = 'button';
    resetBtn.title = 'Reset to default';
    resetBtn.setAttribute('aria-label', 'Reset ' + tokenName);
    resetBtn.addEventListener('click', function () {
      var name = input.getAttribute('data-token');
      var inputType = input.getAttribute('data-type');
      document.documentElement.style.removeProperty(name);
      var val = getTokenValue(name);
      if (inputType === 'color') {
        input.value = rgbToHex(val);
      } else {
        input.value = val;
      }
      updateFieldModifiedState(field, name);
    });

    field.appendChild(label);
    field.appendChild(input);
    field.appendChild(resetBtn);

    inputMap[tokenName] = { input: input, field: field, type: type };

    return field;
  }

  function updateFieldModifiedState(field, tokenName) {
    if (isTokenOverridden(tokenName)) {
      field.classList.add('token-editor__field--modified');
    } else {
      field.classList.remove('token-editor__field--modified');
    }
  }

  function refreshAllValues() {
    var keys = Object.keys(inputMap);
    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      var entry = inputMap[name];
      // Skip tokens that the user has overridden — keep their chosen value
      if (isTokenOverridden(name)) continue;
      var val = getTokenValue(name);
      if (entry.type === 'color') {
        entry.input.value = rgbToHex(val);
      } else {
        entry.input.value = val;
      }
    }
  }

  function openPanel() {
    if (!panel) {
      panel = buildPanel();
    }
    refreshAllValues();
    panel.setAttribute('data-open', '');
    isOpen = true;

    var toggleBtn = document.getElementById('token-editor-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'true');
    }

    // Focus the close button
    var closeBtn = panel.querySelector('.token-editor__close');
    if (closeBtn) closeBtn.focus();
  }

  function closePanel() {
    if (!panel) return;
    panel.removeAttribute('data-open');
    isOpen = false;

    var toggleBtn = document.getElementById('token-editor-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.focus();
    }
  }

  function handleResetAll() {
    var keys = Object.keys(inputMap);
    for (var i = 0; i < keys.length; i++) {
      var name = keys[i];
      document.documentElement.style.removeProperty(name);
    }
    refreshAllValues();
    // Update modified states
    for (var j = 0; j < keys.length; j++) {
      updateFieldModifiedState(inputMap[keys[j]].field, keys[j]);
    }
  }

  // Watch for theme/density attribute changes to refresh values
  var observer = new MutationObserver(function (mutations) {
    if (!isOpen) return;
    for (var i = 0; i < mutations.length; i++) {
      var attr = mutations[i].attributeName;
      if (attr === 'data-theme' || attr === 'data-density') {
        // Delay slightly so the browser recomputes styles
        setTimeout(refreshAllValues, 50);
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme', 'data-density'],
  });

  document.addEventListener('DOMContentLoaded', function () {
    var toggleBtn = document.getElementById('token-editor-toggle');
    if (toggleBtn) {
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-controls', 'token-editor-panel');
      toggleBtn.addEventListener('click', function () {
        if (isOpen) {
          closePanel();
        } else {
          openPanel();
        }
      });
    }
  });
})();
