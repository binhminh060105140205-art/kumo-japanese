import { escapeHtml } from "../../utils/dom.js";
import { renderProgressDots } from "./ProgressDots.js";

export function renderQuiz({ question, index, options, answered, total, daily }) {
  const title = daily ? "BÀI KIỂM TRA HÔM NAY" : "TRẮC NGHIỆM";
  const hint = daily ? "5 từ ngẫu nhiên trong kho · có cả chữ Hán" : "Chọn đáp án đúng";
  const optionsMarkup = options.map((option, optionIndex) => '<button class="answer-option" data-answer="' + option.id + '" ' + (answered ? "disabled" : "") + '><span class="option-key">' + (optionIndex + 1) + '</span><span class="option-text"><strong>' + escapeHtml(option.meaning) + '</strong><small>' + escapeHtml(option.romaji || option.kana) + '</small></span></button>').join("");
  return '<article class="practice-card quiz-stage"><div class="practice-card-head"><span>' + title + '</span><strong>' + (index + 1) + ' / ' + total + '</strong></div>' + renderProgressDots(total, index % total) + '<div class="question-top"><span class="question-type">Nhật → Việt</span><span class="muted">' + hint + '</span></div><div class="question-prompt"><span class="prompt-label">Từ này có nghĩa là gì?</span><h3>' + escapeHtml(question.japanese) + '</h3><div class="prompt-kana">' + escapeHtml(question.kana) + '</div></div><div class="answer-grid">' + optionsMarkup + '</div><div class="quiz-footer" id="quiz-feedback">' + (answered ? "Đang chuyển câu tiếp theo..." : "Phím 1–4 để chọn · Enter để sang câu") + '</div></article>';
}

export function renderDailyComplete({ streak }) {
  return '<article class="practice-card quiz-stage"><div class="match-win"><div class="win-icon">🎉</div><h3>Đã hoàn thành bài hôm nay!</h3><p>Bạn đã làm đủ 5 câu ngẫu nhiên. Chuỗi hiện tại: <strong>' + streak + ' ngày</strong>.</p><button class="primary-button" data-view="dashboard">Về tổng quan</button></div></article>';
}
