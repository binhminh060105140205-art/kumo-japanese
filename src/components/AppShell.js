import { escapeHtml } from "../utils/dom.js";

const navItems = [
  ["dashboard", "⌂", "Tổng quan"],
  ["library", "▤", "Thư viện từ"],
  ["practice", "✦", "Luyện tập"],
  ["stats", "◒", "Thống kê"]
];

export function renderAppShell({ view, state, screen, wordCount, sidebarCollapsed = false }) {
  const dailyAnswered = Math.min(5, state.dailyChallenge?.answered || 0);
  const dailyTotal = state.dailyChallenge?.wordIds?.length || 5;
  return `<div class="app-shell ${state.theme === "light" ? "light-theme" : ""} ${sidebarCollapsed ? "sidebar-collapsed" : ""}">
    <aside class="sidebar" id="sidebar">
      <div class="brand"><div class="brand-mark">雲</div><div><strong>Kumo</strong><span>Japanese</span></div></div>
      <div class="course-switcher"><span class="course-icon">日</span><div><small>Khóa học hiện tại</small><strong>Minna no Nihongo</strong></div><span class="chevron">⌄</span></div>
      <nav class="main-nav" aria-label="Điều hướng chính">${navItems.map(([id, icon, label]) => `<button class="nav-item ${view === id ? "active" : ""}" data-view="${id}"><span class="nav-icon">${icon}</span><span>${label}</span>${id === "library" ? `<span class="nav-count">${wordCount}</span>` : ""}</button>`).join("")}</nav>
      <div class="sidebar-footer">
        <div class="goal-mini"><div class="goal-mini-top"><span>Bài kiểm tra hôm nay</span><strong>${dailyAnswered}/${dailyTotal}</strong></div><div class="progress-track"><span style="width:${Math.min(100, dailyAnswered / dailyTotal * 100)}%"></span></div><small>${dailyAnswered === dailyTotal ? "Đã hoàn thành · chuỗi +1" : "Hoàn thành đủ 5 câu để tăng chuỗi"}</small></div>
        <button class="nav-item ${view === "settings" ? "active" : ""}" data-view="settings"><span class="nav-icon">⚙</span><span>Cài đặt</span></button>
        <div class="profile-mini"><div class="avatar">B</div><div><strong>Bình Minh</strong><span>Người học N5</span></div><span class="more">•••</span></div>
      </div>
    </aside>
    <main class="main-content">
      <header class="topbar"><div class="topbar-leading"><button class="sidebar-toggle icon-button" data-action="toggle-sidebar" aria-label="${sidebarCollapsed ? "Hiện sidebar" : "Ẩn sidebar"}" title="${sidebarCollapsed ? "Hiện sidebar" : "Ẩn sidebar"}">${sidebarCollapsed ? "☷" : "☰"}</button><button class="mobile-menu" data-action="toggle-menu" aria-label="Mở menu">☰</button><div class="breadcrumb"><span>Khóa học</span><b>/</b><strong>Minna no Nihongo N5</strong></div></div><div class="topbar-actions"><button class="icon-button" data-action="toggle-theme" title="Đổi nền">☼</button><button class="icon-button notification-button" title="Thông báo">♢<i></i></button><div class="top-avatar">B</div></div></header>
      <div class="content-wrap">${screen}<footer class="app-footer"><span>Kumo Japanese</span><span>Học nhỏ mỗi ngày · Nhớ lâu hơn</span><span>Phiên bản 1.0</span></footer></div>
    </main>
  </div>
  <div class="toast" id="toast" role="status"></div>`;
}

export function renderModal() {
  return `<div class="modal-backdrop" id="word-modal"><div class="modal panel"><button class="modal-close" data-action="close-modal">×</button><p class="eyebrow">THÊM TỪ MỚI</p><h2>Thêm vào kho từ vựng</h2><form id="word-form"><label>Từ tiếng Nhật<input name="japanese" required placeholder="例: 勉強します" /></label><label>Cách đọc<input name="kana" required placeholder="べんきょうします" /></label><label>Romaji<input name="romaji" required placeholder="benkyou shimasu" /></label><label>Nghĩa tiếng Việt<input name="meaning" required placeholder="Học bài" /></label><label>Bài học<select name="lesson"><option>Bài 1</option><option>Bài 2</option><option>Bài 3</option><option>Bài 4</option></select></label><button class="primary-button full-width" type="submit">Lưu từ mới</button></form></div></div>`;
}
