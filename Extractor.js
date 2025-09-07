(function () {
  'use strict';

  // --- Fonts & Styles ---
  const fontLink = document.createElement('link');
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap';
  fontLink.rel = 'stylesheet';
  document.head.appendChild(fontLink);

  const style = document.createElement('style');
  style.textContent = `
    #voe-m3u8-panel {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 480px;
      height: 500px;
      background: rgba(25, 35, 45, 0.35);
      border-radius: 24px;
      backdrop-filter: blur(18px);
      -webkit-backdrop-filter: blur(18px);
      border: 1.8px solid rgba(0, 255, 255, 0.25);
      box-shadow: 0 8px 32px 0 rgba(0, 255, 255, 0.2), inset 0 0 12px rgba(0, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      font-family: 'Montserrat', sans-serif;
      color: #a0f0ff;
      user-select: none;
      z-index: 9999999;
    }
    #voe-m3u8-panel header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 22px 28px;
      border-bottom: 1px solid rgba(0, 255, 255, 0.15);
      font-weight: 600;
      font-size: 22px;
      color: #00ffffcc;
      text-shadow: 0 0 14px #00ffffaa;
      user-select: text;
    }
    #voe-m3u8-panel header #close-btn {
      cursor: pointer;
      font-weight: 700;
      font-size: 26px;
      color: #00ffffcc;
      transition: color 0.3s ease;
      user-select: none;
    }
    #voe-m3u8-panel header #close-btn:hover {
      color: #00ffff;
      text-shadow: 0 0 20px #00ffff;
    }
    #voe-m3u8-list {
      flex-grow: 1;
      overflow-y: auto;
      padding: 20px 28px;
      scrollbar-width: thin;
      scrollbar-color: #00ffff44 transparent;
      user-select: text;
    }
    #voe-m3u8-list::-webkit-scrollbar {
      width: 10px;
    }
    #voe-m3u8-list::-webkit-scrollbar-track {
      background: transparent;
      border-radius: 6px;
    }
    #voe-m3u8-list::-webkit-scrollbar-thumb {
      background-color: #00ffff44;
      border-radius: 6px;
    }
    .voe-url-entry {
      background: rgba(0, 255, 255, 0.08);
      border-radius: 14px;
      padding: 14px 20px;
      margin-bottom: 16px;
      box-shadow: 0 0 12px 1px rgba(0, 255, 255, 0.2);
      cursor: pointer;
      transition: background 0.3s ease, box-shadow 0.3s ease;
      display: flex;
      flex-direction: column;
      user-select: text;
      position: relative;
    }
    .voe-url-entry:hover {
      background: rgba(0, 255, 255, 0.15);
      box-shadow: 0 0 20px 3px rgba(0, 255, 255, 0.6);
    }
    .voe-url-text {
      font-size: 14px;
      color: #a0f0ffcc;
      word-break: break-all;
      user-select: text;
    }
    .voe-copy-btn {
      position: absolute;
      top: 14px;
      right: 20px;
      background: rgba(0, 255, 255, 0.12);
      border-radius: 50%;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #00ffffcc;
      cursor: pointer;
      transition: background 0.3s ease, color 0.3s ease;
      user-select: none;
      box-shadow: 0 0 8px rgba(0, 255, 255, 0.25);
    }
    .voe-copy-btn:hover {
      background: rgba(0, 255, 255, 0.3);
      color: #00ffff;
      box-shadow: 0 0 12px 3px #00ffffcc, 0 0 18px 6px #00ffff88;
    }
    .voe-tooltip {
      position: fixed;
      background: #00ffffdd;
      color: #003333;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 700;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
      user-select: none;
      white-space: nowrap;
      z-index: 10000001;
      box-shadow: 0 0 10px #00ffffbb;
    }
    .voe-tooltip.visible { opacity: 1; }
  `;
  document.head.appendChild(style);

  // --- Panel ---
  const panel = document.createElement('div');
  panel.id = 'voe-m3u8-panel';
  panel.innerHTML = `
    <header>
      <div>🎬 VOE .m3u8 URLs</div>
      <div id="close-btn" title="Close panel">&times;</div>
    </header>
    <div id="voe-m3u8-list" aria-live="polite" aria-relevant="additions"></div>
  `;
  document.body.appendChild(panel);

  const closeBtn = panel.querySelector('#close-btn');
  const urlsList = panel.querySelector('#voe-m3u8-list');

  closeBtn.onclick = () => panel.remove();

  let tooltip;
  function showTooltip(text, x, y) {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'voe-tooltip';
      document.body.appendChild(tooltip);
    }
    tooltip.textContent = text;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    tooltip.classList.add('visible');
    setTimeout(() => tooltip.classList.remove('visible'), 1200);
  }

  // --- URL Management ---
  const seenUrls = new Set();
  function addUrl(url) {
    if (!url || !/^https?:\/\/.+\.m3u8/.test(url)) return;
    if (seenUrls.has(url)) return;
    seenUrls.add(url);

    const entry = document.createElement('div');
    entry.className = 'voe-url-entry';

    const linkDiv = document.createElement('div');
    linkDiv.className = 'voe-url-text';
    linkDiv.textContent = url;

    const copyBtn = document.createElement('div');
    copyBtn.className = 'voe-copy-btn';
    copyBtn.title = 'Copy to clipboard';
    copyBtn.innerHTML = '📋';

    copyBtn.onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(url).then(() => {
        const rect = copyBtn.getBoundingClientRect();
        showTooltip('Copied!', rect.left + rect.width / 2, rect.top - 28);
      }).catch(() => alert('Failed to copy URL!'));
    };

    entry.appendChild(linkDiv);
    entry.appendChild(copyBtn);

    entry.onclick = () => {
      navigator.clipboard.writeText(url).then(() => {
        const rect = entry.getBoundingClientRect();
        showTooltip('Copied!', rect.left + rect.width / 2, rect.top - 28);
      }).catch(() => alert('Failed to copy URL!'));
    };

    urlsList.appendChild(entry);

    console.log(`✅ .m3u8 URL captured: ${url}`);
    navigator.clipboard.writeText(url).catch(() => {});
  }

  // --- Hooks for VOE ---
  function scanScripts() {
    document.querySelectorAll('script').forEach(script => {
      const content = script.textContent || script.innerHTML;
      const matches = content.match(/https?:\/\/[^\s"'<>]+\.m3u8/gi);
      if (matches) matches.forEach(addUrl);
    });
  }

  function scanGlobals() {
    Object.getOwnPropertyNames(window).forEach(prop => {
      try {
        const val = window[prop];
        if (typeof val === 'string' && val.includes('.m3u8')) addUrl(val);
        else if (typeof val === 'object' && val !== null) {
          Object.values(val).forEach(v => {
            if (typeof v === 'string' && v.includes('.m3u8')) addUrl(v);
          });
        }
      } catch (e) {}
    });
  }

  function hookNetwork() {
    if (!window._voeM3u8FetchHooked) {
      window._voeM3u8FetchHooked = true;
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
        if (url && url.includes('.m3u8')) addUrl(url);
        return originalFetch.apply(this, args);
      };
    }

    if (!window._voeM3u8XHRHooked) {
      window._voeM3u8XHRHooked = true;
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        if (url && url.includes('.m3u8')) addUrl(url);
        return originalOpen.call(this, method, url, ...rest);
      };
    }
  }

  // --- Autoplay Simulation ---
  function tryAutoplay() {
    const vids = document.getElementsByTagName('video');
    if (!vids.length) return;
    const video = vids[0];
    ['pointerdown','mousedown','mouseup','click','focus'].forEach(evtName => {
      const evt = new Event(evtName, { bubbles:true, cancelable:true });
      video.dispatchEvent(evt);
      document.body.dispatchEvent(evt);
    });
    video.play().catch(() => {});
  }

  // --- Init ---
  scanScripts();
  scanGlobals();
  hookNetwork();
  tryAutoplay();

  // Periodic rescans
  setInterval(() => {
    scanScripts();
    scanGlobals();
  }, 5000);

  console.log('🎬 VOE .m3u8 Extractor läuft! URLs erscheinen im Panel.');
})();
