import { renderModeCard } from "../components/ModeCard.js";
import { escapeHtml } from "../utils/dom.js";

export function renderDashboard({ state, words }) {
  const studyWords = words.filter(word => word.category !== "other" && !state.mastered.includes(word.id)).slice(0, 4);
  const dailyCompleted = Boolean(state.dailyChallenge?.completed);
  return `<section class="screen">
   <div class="welcome-row"><div><p class="eyebrow">${formatCurrentDate()}</p><h1>Hôm nay học gì, <span>Bình Minh?</span></h1><p class="muted lead">Mỗi ngày học một ít để giữ nhịp và nhớ lâu hơn.</p></div></div>
    <div class="stats-grid">
     ${statCard("♨", "Chuỗi ngày học", `${state.streak} ngày`, dailyCompleted ? "Đã hoàn thành hôm nay · Bấm để xem lại" : "Bấm để làm 5 câu hôm nay", "orange", "dailyQuiz")}
      ${statCard("◷", "Thời gian học", "24 phút", "Hôm nay", "blue")}
    </div>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">CHỌN CÁCH HỌC</p><h2>Luyện tập theo cách của bạn</h2></div><button class="text-button" data-view="practice">Xem tất cả <span>→</span></button></div><div class="mode-grid">${renderModeCard("flashcards", "▣", "Thẻ ghi nhớ", "Nhìn, lật và tự đánh giá", "12 từ cần ôn →", "orange")}${renderModeCard("typing", "⌨", "Gõ cách đọc", "Nhớ sâu hơn bằng cách tự viết romaji", "10 từ luyện viết →", "blue")}${renderModeCard("match", "⌘", "Ghép cặp", "Nối từ tiếng Nhật với nghĩa tương ứng", "Chơi một ván →", "green")}</div></section>
    <section class="panel recent-panel"><div class="section-heading"><div><p class="eyebrow">ÔN TẬP GẦN ĐÂY</p><h2>Từ vựng cần xem lại</h2></div><button class="text-button" data-view="library">Mở thư viện <span>→</span></button></div><div class="word-strip">${studyWords.map(word => `<article class="word-preview"><div><div class="word-preview-top"><span>Bài ${word.lesson}</span><span>Đang học</span></div><div class="word-preview-jp">${escapeHtml(word.japanese)}</div><div class="word-preview-kana">${escapeHtml(word.kana)}</div></div><div class="word-preview-bottom"><strong>${escapeHtml(word.meaning)}</strong><button class="sound-button" data-speak="${escapeHtml(word.kana || word.japanese)}" aria-label="Nghe phát âm">◖</button></div></article>`).join("")}</div></section>
  </section>`;
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date()).replace("ngày ", "").toUpperCase();
}

function statCard(icon, label, value, detail, color, action) {
  const tag = action ? "button" : "article";
  const actionAttributes = action ? ` type="button" data-start="${action}" aria-label="${escapeHtml(`${label}: ${value}`)}"` : "";
  return `<${tag}${actionAttributes} class="stat-card stat-${color}${action ? " actionable" : ""}"><div class="stat-icon">${icon}</div><div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div><div class="sparkline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></${tag}>`;
}
