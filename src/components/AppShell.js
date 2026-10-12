const navItems = [
  ["dashboard", "⌂", "Tổng quan"],
  ["library", "▤", "Thư viện từ"],
  ["practice", "✦", "Luyện tập"],
  ["stats", "◒", "Thống kê"],
  ["settings", "⚙", "Cài đặt"]
];

export function renderAppShell({ view, state, screen, wordCount }) {
  return `<div class="app-shell ${state.theme === "light" ? "light-theme" : ""}">
    <main class="main-content">
      <header class="topbar"><div class="topbar-leading"><div class="topbar-brand"><div class="brand-mark">雲</div><div><strong>Kumo</strong><span>Japanese</span></div></div><nav class="top-nav" aria-label="Điều hướng chính">${navItems.map(([id, icon, label]) => `<button class="nav-item ${view === id ? "active" : ""}" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span>${id === "library" ? `<span class="nav-count">${wordCount}</span>` : ""}</button>`).join("")}</nav></div><div class="topbar-actions"><button class="icon-button" data-action="toggle-theme" title="Đổi nền">☼</button><button class="icon-button notification-button" title="Thông báo">♢<i></i></button><div class="top-avatar">B</div></div></header>
      <div class="content-wrap">${screen}<footer class="app-footer"><span>Kumo Japanese</span><span>Học nhỏ mỗi ngày · Nhớ lâu hơn</span><span>Phiên bản 1.0</span></footer></div>
    </main>
  </div>
  <div class="toast" id="toast" role="status"></div>`;
}

export function renderModal() {
  return `<div class="modal-backdrop" id="word-modal"><div class="modal panel"><button class="modal-close" data-action="close-modal">×</button><p class="eyebrow">THÊM TỪ MỚI</p><h2>Thêm vào kho từ vựng</h2><form id="word-form"><label>Từ tiếng Nhật<input name="japanese" required placeholder="例: 勉強します" /></label><label>Cách đọc<input name="kana" required placeholder="べんきょうします" /></label><label>Romaji<input name="romaji" required placeholder="benkyou shimasu" /></label><label>Nghĩa tiếng Việt<input name="meaning" required placeholder="Học bài" /></label><label>Bài học<select name="lesson"><option>Bài 1</option><option>Bài 2</option><option>Bài 3</option><option>Bài 4</option></select></label><button class="primary-button full-width" type="submit">Lưu từ mới</button></form></div></div>`;
}
