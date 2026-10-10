import { renderModeCard } from "../components/ModeCard.js";
import { escapeHtml } from "../utils/dom.js";

export function renderDashboard({ state, words }) {
  const mastered = state.mastered.length;
  const studyWords = words.filter(word => word.category !== "other" && !state.mastered.includes(word.id)).slice(0, 4);
  const dailyAnswered = Math.min(5, state.dailyChallenge?.answered || 0);
  const dailyCompleted = Boolean(state.dailyChallenge?.completed);
  const dailyRemaining = Math.max(0, 5 - dailyAnswered);
  return `<section class="screen">
   <div class="welcome-row"><div><p class="eyebrow">${formatCurrentDate()}</p><h1>Hôm nay học gì, <span>Bình Minh?</span></h1><p class="muted lead">Mỗi ngày một bài kiểm tra 5 từ ngẫu nhiên để giữ chuỗi học.</p></div><button class="primary-button" data-start="dailyQuiz"><span>▶</span> ${dailyCompleted ? "Xem kết quả hôm nay" : "Làm bài hôm nay"}</button></div>
    <div class="stats-grid">
     ${statCard("♨", "Chuỗi ngày học", `${state.streak} ngày`, "Hoàn thành đủ 5 câu để cộng 1", "orange")}
      ${statCard("◒", "Từ đã thuộc", mastered, `trên tổng số ${words.length} từ`, "purple", `${Math.round(mastered / words.length * 100)}%`)}
      ${statCard("◷", "Thời gian học", "24 phút", "Hôm nay", "blue")}
    </div>
    <div class="dashboard-grid">
      <article class="panel goal-panel"><div class="section-heading"><div><p class="eyebrow">BÀI KIỂM TRA HÔM NAY</p><h2>Giữ nhịp học đều</h2></div><span class="target-badge">${dailyAnswered} / 5 câu</span></div><div class="donut-wrap"><div class="donut" style="--goal:${dailyAnswered / 5 * 100}%"><div><strong>${Math.round(dailyAnswered / 5 * 100)}%</strong><span>hoàn thành</span></div></div></div><p class="goal-message">${dailyCompleted ? "Bạn đã hoàn thành bài hôm nay và được cộng 1 ngày vào chuỗi." : `Bạn còn <strong>${dailyRemaining} câu</strong> để hoàn thành bài hôm nay.`}</p><button class="secondary-button full-width" data-start="dailyQuiz">${dailyCompleted ? "Xem kết quả" : "Làm bài ngay"} <span>→</span></button></article>
    </div>
    <section class="section-block"><div class="section-heading"><div><p class="eyebrow">CHỌN CÁCH HỌC</p><h2>Luyện tập theo cách của bạn</h2></div><button class="text-button" data-view="practice">Xem tất cả <span>→</span></button></div><div class="mode-grid">${renderModeCard("flashcards", "▣", "Thẻ ghi nhớ", "Nhìn, lật và tự đánh giá", "12 từ cần ôn →", "orange")}${renderModeCard("dailyQuiz", "✦", "Bài kiểm tra hôm nay", "5 từ ngẫu nhiên, gồm cả chữ Hán", "5 câu hôm nay →", "purple")}${renderModeCard("typing", "⌨", "Gõ cách đọc", "Nhớ sâu hơn bằng cách tự viết romaji", "10 từ luyện viết →", "blue")}${renderModeCard("match", "⌘", "Ghép cặp", "Nối từ tiếng Nhật với nghĩa tương ứng", "Chơi một ván →", "green")}</div></section>
    <section class="panel recent-panel"><div class="section-heading"><div><p class="eyebrow">ÔN TẬP GẦN ĐÂY</p><h2>Từ vựng cần xem lại</h2></div><button class="text-button" data-view="library">Mở thư viện <span>→</span></button></div><div class="word-strip">${studyWords.map(word => `<article class="word-preview"><div><div class="word-preview-top"><span>Bài ${word.lesson}</span><span>Đang học</span></div><div class="word-preview-jp">${escapeHtml(word.japanese)}</div><div class="word-preview-kana">${escapeHtml(word.kana)}</div></div><div class="word-preview-bottom"><strong>${escapeHtml(word.meaning)}</strong><button class="sound-button" data-speak="${escapeHtml(word.japanese)}" aria-label="Nghe phát âm">◖</button></div></article>`).join("")}</div></section>
  </section>`;
}

function formatCurrentDate() {
  return new Intl.DateTimeFormat("vi-VN", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }).format(new Date()).replace("ngày ", "").toUpperCase();
}


function statCard(icon, label, value, detail, color, ring) {
  return `<article class="stat-card stat-${color}"><div class="stat-icon">${icon}</div><div><span>${label}</span><strong>${value}</strong><small>${detail}</small></div>${ring ? `<div class="ring-chart" style="--percent:${ring}"><b>${ring}</b></div>` : `<div class="sparkline"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`}</article>`;
}

function lessonRow(number, title, detail, status, icon) {
  return `<button class="lesson-card ${status}" data-start="flashcards"><span class="lesson-number">${number}</span><span><strong>${title}</strong><small>${detail}</small></span><span class="${status === "done" ? "status-check" : status === "current" ? "play-small" : "lock"}">${icon}</span></button>`;
}
