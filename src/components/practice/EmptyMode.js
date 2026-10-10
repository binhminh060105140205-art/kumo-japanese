export function renderPracticeEmpty() {
  return '<article class="practice-card practice-empty"><div class="win-icon">⌕</div><h3>Chưa có từ phù hợp</h3><p>Hãy đổi loại từ, bài học hoặc từ khóa để tiếp tục luyện tập.</p></article>';
}

export function renderPracticeComplete({ total }) {
  return `<article class="practice-card practice-empty practice-complete"><div class="win-icon">✓</div><h3>Hoàn thành phiên học</h3><p>Bạn đã nhớ hết ${total} thẻ trong phần đã chọn. Chọn bộ lọc khác để học tiếp.</p></article>`;
}
