import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";
import { renderDirectionToggle } from "./DirectionToggle.js";

function renderSpeakerButton(word) {
  return `<button class="sound-button flashcard-sound" type="button" data-speak="${escapeHtml(word.kana || "")}" aria-label="Nghe phát âm"><svg class="speaker-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z"></path><path d="M16 9.5c.75.7 1.2 1.54 1.2 2.5s-.45 1.8-1.2 2.5M18.6 7c1.4 1.35 2.2 3.04 2.2 5s-.8 3.65-2.2 5"></path></svg></button>`;
}

function renderJapaneseWord(word) {
  const characterCount = [...word.japanese].length;
  const fontSize = Math.min(112, Math.max(48, Math.round(590 / Math.max(characterCount, 1))));
  return `<h3 class="flashcard-word" style="--flashcard-word-size: ${fontSize}px">${escapeHtml(word.japanese)}</h3>`;
}

export function renderFlashcard({ word, index, total, showRomaji, direction = "jp-to-vi" }) {
  const frontIsJapanese = direction === "jp-to-vi";
  const front = frontIsJapanese
    ? `${renderJapaneseWord(word)}<span class="kana">${showRomaji ? escapeHtml(word.kana) : ""}</span>${renderSpeakerButton(word)}`
    : `<span class="flashcard-label">Nghĩa tiếng Việt</span><div class="flashcard-meaning">${escapeHtml(word.meaning)}</div>`;
  const back = frontIsJapanese
    ? `<span class="romaji">${escapeHtml(word.romaji || word.kana)}</span><div class="meaning">${escapeHtml(word.meaning)}</div>`
    : `${renderJapaneseWord(word)}<span class="kana">${escapeHtml(word.kana)}</span><span class="romaji">${escapeHtml(word.romaji || word.kana)}</span>${renderSpeakerButton(word)}`;
  return `<article class="practice-card flashcard-stage"><div class="practice-card-head"><span>THẺ GHI NHỚ</span><strong>${Math.min(index + 1, total)} / ${total}</strong>${renderDirectionToggle("flashcard", direction)}</div>${renderProgressDots(10, index % 10)}<div class="flashcard-shell"><div class="flashcard" id="flashcard"><div class="flashcard-face front"><span class="lesson-tag">Bài ${word.lesson}</span>${front}<span class="card-hint">Bấm vào thẻ hoặc nhấn Space để lật</span></div><div class="flashcard-face back"><span class="lesson-tag">Bài ${word.lesson}</span>${back}<p class="muted">${escapeHtml(word.example || word.baseForm || "")}</p><span class="card-hint">Tự đánh giá kết quả của bạn</span></div></div></div><div class="flash-actions"><button class="review-button again" data-review="again">← Chưa nhớ</button><button class="review-button know" data-review="know">Đã nhớ →</button></div><p class="practice-instructions">Space: lật thẻ · ← Chưa nhớ · → Đã nhớ</p></article>`;
}
