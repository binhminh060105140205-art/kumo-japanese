import { categoryFilters, lessonFilters } from "../data/vocabulary.js";
import { escapeHtml } from "../utils/dom.js";

const wordLimitOptions = [0, 5, 10, 20, 30, 50];

function renderModeSelector(mode) {
  const modes = [
    ["flashcards", "▣", "Thẻ ghi nhớ", "orange-text"],
    ["quiz", "✦", "Trắc nghiệm", "purple-text"],
    ["typing", "⌨", "Gõ cách đọc", "blue-text"],
    ["match", "⌘", "Ghép cặp", "green-text"],
    ["summary", "☷", "Tổng hợp", "yellow-text"]
  ];
  return modes.map(([id, icon, title, color]) => `<button class="practice-mode ${mode === id ? "active" : ""}" data-mode="${id}"><span class="mode-symbol ${color}">${icon}</span><span><strong>${title}</strong></span><span>→</span></button>`).join("");
}

function renderLessonFilters(filters) {
  const selectedLessons = Array.isArray(filters.lesson) ? filters.lesson : filters.lesson && filters.lesson !== "Tất cả" ? [filters.lesson] : [];
  return lessonFilters.map(lesson => {
    const active = lesson === "Tất cả" ? selectedLessons.length === 0 : selectedLessons.includes(lesson);
    return `<button class="filter-chip ${active ? "active" : ""}" data-practice-filter="lesson" data-value="${lesson}">${lesson}</button>`;
  }).join("");
}

function renderWordLimitFilters(value) {
  const selected = Number(value) || 0;
  return wordLimitOptions.map(limit => `<button class="filter-chip ${selected === limit ? "active" : ""}" data-practice-filter="wordLimit" data-value="${limit}">${limit || "Tất cả"}</button>`).join("");
}

export function renderPractice({ mode, stage, filters, filteredCount, availableCount = filteredCount }) {
  const categoryMarkup = categoryFilters.map(item => `<button class="filter-chip ${filters.category === item.id ? "active" : ""}" data-practice-filter="category" data-value="${item.id}">${item.label}</button>`).join("");
  const modeMarkup = `<div class="practice-modes">${renderModeSelector(mode)}</div>`;
  const selectedCount = Number(filters.wordLimit) > 0 ? Math.min(Number(filters.wordLimit), availableCount) : availableCount;
  const pickerMarkup = `<div class="practice-picker panel"><div class="practice-picker-head"><h2>Chọn phần muốn luyện</h2><span class="practice-filter-count">${selectedCount} / ${filteredCount} từ</span></div><div class="practice-picker-search-row"><label class="practice-search"><span>⌕</span><input id="practice-search" type="search" value="${escapeHtml(filters.query || "")}" placeholder="Tìm từ muốn học..." /></label><div class="practice-filter-block practice-category-block"><small>LOẠI TỪ</small><div class="filter-group">${categoryMarkup}</div></div></div><div class="practice-picker-filters"><div class="practice-filter-block"><small>BÀI · CHỌN NHIỀU</small><div class="filter-group">${renderLessonFilters(filters)}</div></div><div class="practice-filter-block"><small>SỐ TỪ</small><div class="filter-group">${renderWordLimitFilters(filters.wordLimit)}</div></div></div>${modeMarkup}</div>`;
  return `<section class="screen"><div class="page-heading practice-heading"><div><h1>Chọn nội dung và cách học</h1></div><div class="session-score"><span>Phiên hôm nay</span><strong data-session-score>0 điểm</strong></div></div>${pickerMarkup}<div class="practice-layout"><div class="practice-stage" id="practice-stage">${stage}</div></div></section>`;
}
