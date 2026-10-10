import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";

export function renderMatch({ state }) {
  if (state.won) return `<article class="practice-card match-stage"><div class="match-win"><div class="win-icon">🎉</div><h3>Ghép cặp hoàn tất!</h3><p>Bạn đã nối đúng toàn bộ ${state.words.length} cặp từ.</p><button class="primary-button" data-action="restart-match">Chơi lại</button></div></article>`;
  return `<article class="practice-card match-stage"><div class="practice-card-head"><span>GHÉP CẶP</span><strong>${state.matched.length} / ${state.words.length} cặp</strong></div>${renderProgressDots(state.words.length, Math.min(state.matched.length, state.words.length - 1))}<p class="match-instructions">Chọn một từ tiếng Nhật và nghĩa tiếng Việt tương ứng.</p><div class="match-grid">${state.tiles.map(tile => `<button class="match-tile ${state.selected.includes(tile.id) ? "selected" : ""} ${state.matched.includes(tile.wordId) ? "matched" : ""}" data-tile="${tile.id}">${tile.type === "jp" ? `<span class="match-jp">${escapeHtml(tile.text)}</span><small>${escapeHtml(tile.sub)}</small>` : `<span>${escapeHtml(tile.text)}</span>`}</button>`).join("")}</div></article>`;
}
