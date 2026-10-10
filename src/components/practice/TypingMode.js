import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";

export function renderTyping({ word, index }) {
  return `<article class="practice-card typing-stage"><div class="practice-card-head"><span>GÕ CÁCH ĐỌC</span><strong>${index + 1} / 10</strong></div>${renderProgressDots(10, index % 10)}<div class="typing-center"><span class="question-type">Việt → Nhật</span><h3>${escapeHtml(word.meaning)}</h3><div class="typing-input-row"><input class="typing-input" id="typing-input" autocomplete="off" placeholder="Nhập romaji, kana hoặc chữ Nhật" /><button class="small-button" data-action="check-typing">Kiểm tra</button></div><div class="typing-tools"><button class="text-link" data-action="skip-typing">Bỏ qua</button></div><div id="typing-feedback"></div></div></article>`;
}
