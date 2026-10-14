import { escapeHtml } from "../../utils/dom.js";

function renderSummaryRow(word, index) {
  return `<div class="summary-row" data-summary-word="${escapeHtml(word.id)}"><span class="summary-index">${index + 1}</span><div class="summary-japanese"><strong>${escapeHtml(word.japanese)}</strong><span>${escapeHtml(word.kana || "")}</span></div><div class="summary-meaning"><strong>${escapeHtml(word.meaning)}</strong><span>${escapeHtml(word.romaji || "")}</span></div><span class="lesson-tag">Bài ${word.lesson}</span><button class="sound-button summary-sound" type="button" data-speak="${escapeHtml(word.japanese)}" aria-label="Nghe ${escapeHtml(word.japanese)}">◖</button></div>`;
}

export function renderSummary({ words, isPlaying = false }) {
  const rows = words.map((word, index) => renderSummaryRow(word, index)).join("");
  const status = isPlaying ? "Đang đọc lần lượt từ Nhật rồi đến nghĩa..." : "Bấm Nghe hết để đọc theo thứ tự";
  const playLabel = isPlaying ? "↻ Đọc lại" : "▶ Nghe hết";
  return `<article class="practice-card summary-stage"><div class="practice-card-head"><span>TỔNG HỢP TỪ ĐÃ CHỌN</span><strong>${words.length} từ</strong></div><div class="summary-toolbar"><div><h3>Danh sách học</h3><p data-summary-status>${status}</p></div><div class="summary-actions"><button class="primary-button" data-action="play-summary">${playLabel}</button><button class="small-button" data-action="stop-summary">■ Dừng</button></div></div><div class="summary-list" role="list">${rows}</div></article>`;
}