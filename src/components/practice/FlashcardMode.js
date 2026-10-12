import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";
import { renderDirectionToggle } from "./DirectionToggle.js";

export function renderFlashcard({ word, index, total, showRomaji, direction = "jp-to-vi" }) {
  const frontIsJapanese = direction === "jp-to-vi";
  const front = frontIsJapanese
    ? `<h3>${escapeHtml(word.japanese)}</h3><span class="kana">${showRomaji ? escapeHtml(word.kana) : ""}</span><button class="sound-button" data-speak="${escapeHtml(word.japanese)}" aria-label="Nghe phát âm">◖</button>`
    : `<span class="flashcard-label">Nghĩa tiếng Việt</span><div class="flashcard-meaning">${escapeHtml(word.meaning)}</div>`;
  const back = frontIsJapanese
    ? `<span class="romaji">${escapeHtml(word.romaji || word.kana)}</span><div class="meaning">${escapeHtml(word.meaning)}</div>`
    : `<h3>${escapeHtml(word.japanese)}</h3><span class="kana">${escapeHtml(word.kana)}</span><span class="romaji">${escapeHtml(word.romaji || word.kana)}</span><button class="sound-button" data-speak="${escapeHtml(word.japanese)}" aria-label="Nghe phát âm">◖</button>`;
  return `<article class="practice-card flashcard-stage"><div class="practice-card-head"><span>THẺ GHI NHỚ</span><strong>${Math.min(index + 1, total)} / ${total}</strong>${renderDirectionToggle("flashcard", direction)}</div>${renderProgressDots(10, index % 10)}<div class="flashcard-shell"><div class="flashcard" id="flashcard"><div class="flashcard-face front"><span class="lesson-tag">Bài ${word.lesson}</span>${front}<span class="card-hint">Bấm vào thẻ hoặc nhấn Space để lật</span></div><div class="flashcard-face back"><span class="lesson-tag">Bài ${word.lesson}</span>${back}<p class="muted">${escapeHtml(word.example || word.baseForm || "")}</p><span class="card-hint">Tự đánh giá kết quả của bạn</span></div></div></div><div class="flash-actions"><button class="review-button again" data-review="again">← Chưa nhớ</button><button class="review-button know" data-review="know">Đã nhớ →</button></div><p class="practice-instructions">Space: lật thẻ · ← Chưa nhớ · → Đã nhớ</p></article>`;
}
