// 1. 全域 <head> 自動注入 CSS 與 Favicon
(function injectGlobalHead() {
  const head = document.head;
  if (!head.querySelector('link[rel="stylesheet"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'style.css';
    head.appendChild(css);
  }
  if (!head.querySelector('link[rel="icon"]')) {
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🛡️</text></svg>';
    head.appendChild(favicon);
  }
})();

// 2. 通用 Web Component 類別
class RemoteComponent extends HTMLElement {
  constructor(file) {
    super();
    this.file = file;
  }

  connectedCallback() {
    fetch(this.file)
      .then(res => {
        if (!res.ok) throw new Error(`${this.file} 載入失敗`);
        return res.text();
      })
      .then(html => {
        this.innerHTML = html;
        this.highlightActiveLinks();
      })
      .catch(err => console.error(err));
  }

  // 自動處理 aria-current="page" 無障礙高亮
  highlightActiveLinks() {
    let currentPath = window.location.pathname.split('/').pop().split('?')[0].split('#')[0];
    if (!currentPath || currentPath === '') {
      currentPath = 'index.html';
    }

    this.querySelectorAll('a').forEach(link => {
      let href = link.getAttribute('href');
      if (!href) return;
      
      // 清除 ./ 前綴進行精確比對
      href = href.replace(/^\.\//, '');

      // 判斷邏輯：網址吻合，或者新聞詳細頁 (news-detail-XX.html) 歸類在 news.html 下
      if (href === currentPath || (currentPath.startsWith('news-detail') && href === 'news.html')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }
}

// 3. 註冊全站自訂標籤 (Web Components)
customElements.define('site-header', class extends RemoteComponent { constructor() { super('header.html'); } });
customElements.define('site-nav', class extends RemoteComponent { constructor() { super('nav.html'); } });
customElements.define('site-aside', class extends RemoteComponent { constructor() { super('aside.html'); } });
customElements.define('site-footer', class extends RemoteComponent { constructor() { super('footer.html'); } });