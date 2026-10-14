import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";
import { renderDirectionToggle } from "./DirectionToggle.js";

export function renderQuiz({ question, index, options, answered, total, daily, direction = "jp-to-vi" }) {
  const title = daily ? "BÀI KIỂM TRA HÔM NAY" : "TRẮC NGHIỆM";
  const hint = daily ? "5 từ ngẫu nhiên trong kho · có cả chữ Hán" : "Chọn đáp án đúng";
  const answerIsJapanese = direction === "vi-to-jp";
  const prompt = direction === "audio-to-vi"
    ? `<span class="prompt-label">Nghe và chọn nghĩa đúng</span><button class="quiz-audio-button" data-speak="${escapeHtml(question.kana || "")}" aria-label="Nghe từ tiếng Nhật">▶ Nghe từ</button>`
    : answerIsJapanese
      ? `<span class="prompt-label">Từ tiếng Việt này là gì?</span><h3>${escapeHtml(question.meaning)}</h3>`
      : `<span class="prompt-label">Từ này có nghĩa là gì?</span><h3 class="prompt-japanese">${escapeHtml(question.japanese)}</h3><div class="prompt-kana">${escapeHtml(question.kana)}</div>`;
  const optionsMarkup = options.map((option, optionIndex) => {
    const primary = answerIsJapanese ? option.japanese : option.meaning;
    const secondary = answerIsJapanese ? option.kana : option.romaji || option.kana;
    return '<button class="answer-option" data-answer="' + option.id + '" ' + (answered ? "disabled" : "") + '><span class="option-key">' + (optionIndex + 1) + '</span><span class="option-text"><strong class="' + (answerIsJapanese ? "option-japanese" : "") + '">' + escapeHtml(primary) + '</strong><small>' + escapeHtml(secondary) + '</small></span></button>';
  }).join("");
  const directionLabel = direction === "audio-to-vi" ? "Nghe → Việt" : direction === "vi-to-jp" ? "Việt → Nhật" : "Nhật → Việt";
  return '<article class="practice-card quiz-stage"><div class="practice-card-head"><span>' + title + '</span><strong>' + (index + 1) + ' / ' + total + '</strong>' + renderDirectionToggle("quiz", direction) + '</div>' + renderProgressDots(total, index % total) + '<div class="question-top"><span class="question-type">' + directionLabel + '</span><span class="muted">' + hint + '</span></div><div class="question-prompt">' + prompt + '</div><div class="answer-grid">' + optionsMarkup + '</div><div class="quiz-footer" id="quiz-feedback">' + (answered ? "Đang chuyển câu tiếp theo..." : "Phím 1–4 để chọn · Enter để sang câu") + '</div></article>';
}

export function renderDailyComplete({ streak }) {
  return '<article class="practice-card quiz-stage"><div class="match-win"><div class="win-icon">🎉</div><h3>Đã hoàn thành bài hôm nay!</h3><p>Bạn đã làm đủ 5 câu ngẫu nhiên. Chuỗi hiện tại: <strong>' + streak + ' ngày</strong>.</p><button class="primary-button" data-view="dashboard">Về tổng quan</button></div></article>';
}
