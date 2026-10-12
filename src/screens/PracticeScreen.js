import { categoryFilters, lessonFilters } from "../data/vocabulary.js";
import { escapeHtml } from "../utils/dom.js";

function renderModeSelector(mode) {
  const modes = [
    ["flashcards", "▣", "Thẻ ghi nhớ", "Nhìn, lật và tự đánh giá", "orange-text"],
    ["quiz", "✦", "Trắc nghiệm", "Chọn đáp án đúng", "purple-text"],
    ["typing", "⌨", "Gõ cách đọc", "Viết romaji hoặc kana", "blue-text"],
    ["match", "⌘", "Ghép cặp", "Nối các thẻ tương ứng", "green-text"]
  ];
  return modes.map(([id, icon, title, text, color]) => `<button class="practice-mode ${mode === id ? "active" : ""}" data-mode="${id}"><span class="mode-symbol ${color}">${icon}</span><span><strong>${title}</strong><small>${text}</small></span><span>→</span></button>`).join("");
}

function renderLessonFilters(filters) {
  const selectedLessons = Array.isArray(filters.lesson) ? filters.lesson : filters.lesson && filters.lesson !== "Tất cả" ? [filters.lesson] : [];
  return lessonFilters.map(lesson => {
    const active = lesson === "Tất cả" ? selectedLessons.length === 0 : selectedLessons.includes(lesson);
    return `<button class="filter-chip ${active ? "active" : ""}" data-practice-filter="lesson" data-value="${lesson}">${lesson}</button>`;
  }).join("");
}

export function renderPractice({ mode, stage, filters, filteredCount }) {
  const categoryMarkup = categoryFilters.map(item => `<button class="filter-chip ${filters.category === item.id ? "active" : ""}" data-practice-filter="category" data-value="${item.id}">${item.label}</button>`).join("");
  const pickerMarkup = `<div class="practice-picker panel"><div class="practice-picker-head"><div><p class="eyebrow">CHỌN NỘI DUNG HỌC</p><h2>Chọn phần muốn luyện</h2><p class="muted">Có thể chọn nhiều bài cùng lúc rồi học ngay trong cùng một trang.</p></div><span class="practice-filter-count">${filteredCount} từ phù hợp</span></div><label class="practice-search"><span>⌕</span><input id="practice-search" type="search" value="${escapeHtml(filters.query || "")}" placeholder="Tìm từ muốn học..." /></label><div class="practice-picker-filters"><div class="practice-filter-block"><small>LOẠI TỪ</small><div class="filter-group">${categoryMarkup}</div></div><div class="practice-filter-block"><small>BÀI · CHỌN NHIỀU</small><div class="filter-group">${renderLessonFilters(filters)}</div></div></div><p class="practice-picker-note">Bấm “Tất cả” để bỏ chọn các bài. Bài học hằng ngày mở từ thẻ Chuỗi ngày học ở Tổng quan.</p></div>`;
  const modeMarkup = `<div class="practice-modes panel">${renderModeSelector(mode)}</div>`;
  return `<section class="screen"><div class="page-heading practice-heading"><div><p class="eyebrow">LUYỆN TẬP</p><h1>Chọn nội dung và cách học</h1><p class="muted lead">Lọc theo bài hoặc loại từ rồi học ngay trong cùng một trang.</p></div><div class="session-score"><span>Phiên hôm nay</span><strong data-session-score>0 điểm</strong></div></div>${pickerMarkup}<div class="practice-layout"><div class="practice-stage" id="practice-stage">${modeMarkup}${stage}</div></div></section>`;
}
