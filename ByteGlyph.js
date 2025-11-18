window.fontFiles = [
'/fonts/bdffonts/6x10.flf',
'/fonts/bdffonts/clr5x6.flf',
'/fonts/bdffonts/clr6x6.flf',
];

const FIGLET_SCRIPT_URL = 'https://cdn.jsdelivr.net/npm/figlet@1.7.0/build/figlet.min.js';
const URLD = 'https://raw.githubusercontent.com/MartinxMax/ByteGlyph/main';

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '))
}

function clean_page() {
    document.documentElement.innerHTML = ''
}

function createContainer() {
    const root = document.createElement('div');
    root.id = 'url-parser-root';
    root.style.cssText = 'font-family:monospace';
    document.body.appendChild(root);
    const style = document.createElement('style');
    style.textContent = 'pre.ascii-art{white-space:pre;font-size:12px;line-height:1}';
    document.head.appendChild(style);
    return root
}

function loadScript(src) {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) return setTimeout(resolve, 0);
        const s = document.createElement('script');
        s.src = src;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => reject();
        document.head.appendChild(s)
    })
}

function findFontPathByStyle(style) {
    if (!style) return null;
    const styleLower = style.toLowerCase();
    for (const p of window.fontFiles) {
        const base = p.split('/').pop().toLowerCase();
        if (base === styleLower || base === `${styleLower}.flf`) return URLD + p
    }
    for (const p of window.fontFiles) {
        const base = p.split('/').pop().toLowerCase();
        if (base.includes(styleLower)) return URLD + p
    }
    return null
}
async function loadAndRegisterFont(filePath) {
    const fontName = filePath.split('/').pop().replace('.flf', '');
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error();
        const fontData = await response.text();
        figlet.parseFont(fontName, fontData);
        return {
            name: fontName,
            isValid: true
        }
    } catch {
        return {
            name: fontName,
            isValid: false
        }
    }
}

function renderAscii(root, text, fontName) {
    try {
        const asciiArt = fontName ? figlet.textSync(text, {
            font: fontName
        }) : figlet.textSync(text);
        const pre = document.createElement('pre');
        pre.className = 'ascii-art';
        pre.textContent = asciiArt;
        root.appendChild(pre)
    } catch {}
}

function renderPlainText(root, text) {
    const pre = document.createElement('pre');
    pre.textContent = text;
    root.appendChild(pre)
}
async function initParameterDisplay() {
    clean_page();
    const root = createContainer();
    const typeValue = getUrlParameter('type').toLowerCase();
    const styleValue = getUrlParameter('style');
    const dataValueRaw = getUrlParameter('data');
    if (typeValue !== 'str' && typeValue !== 'string' && typeValue !== 'text') return;
    const fontPath = findFontPathByStyle(styleValue);
    if (fontPath) {
        try {
            if (typeof figlet === 'undefined') await loadScript(FIGLET_SCRIPT_URL);
            const result = await loadAndRegisterFont(fontPath);
            if (result.isValid) {
                renderAscii(root, dataValueRaw, result.name);
                return
            }
        } catch {}
    }
    renderPlainText(root, dataValueRaw)
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => initParameterDisplay().catch(() => {}));
else initParameterDisplay().catch(() => {});