import { categoryFilters, categoryLabels, lessonFilters } from "../data/vocabulary.js";
import { escapeHtml, normalize } from "../utils/dom.js";

export function renderLibrary({ words, state, query = "", filter = "Tất cả", category = "all" }) {
  const lowerQuery = normalize(query);
  const lessonNumber = filter === "Tất cả" ? null : Number(filter.replace("Bài ", ""));
  const filtered = words.filter(word => (lessonNumber === null || word.lesson === lessonNumber) && (category === "all" || word.category === category) && normalize(`${word.japanese} ${word.kana} ${word.romaji} ${word.meaning}`).includes(lowerQuery));
  return `<section class="screen"><div class="page-heading"><div><p class="eyebrow">THƯ VIỆN</p><h1>Kho từ vựng</h1><p class="muted lead">Từ JPD kỳ 5, sắp xếp theo bài và loại từ.</p></div><button class="primary-button" data-action="open-modal">＋ Thêm từ mới</button></div><div class="library-toolbar panel"><label class="search-box"><span>⌕</span><input id="word-search" type="search" value="${escapeHtml(query)}" placeholder="Tìm kanji, hiragana, romaji hoặc nghĩa..." /></label><div class="filter-block"><small>LOẠI TỪ</small><div class="filter-group">${categoryFilters.map(item => `<button class="filter-chip ${category === item.id ? "active" : ""}" data-category="${item.id}">${item.label}</button>`).join("")}</div></div><div class="filter-block"><small>BÀI</small><div class="filter-group">${lessonFilters.map(item => `<button class="filter-chip ${filter === item ? "active" : ""}" data-filter="${item}">${item}</button>`).join("")}</div></div></div><div class="library-summary"><span><strong>${filtered.length}</strong> từ trong phạm vi</span><div class="legend"><span><i class="dot purple-dot"></i>Đã thuộc</span><span><i class="dot yellow-dot"></i>Đang học</span><span><i class="dot gray-dot"></i>Chưa học</span></div></div><div class="word-table panel"><div class="table-header"><span>TỪ VỰNG</span><span>CÁCH ĐỌC</span><span>NGHĨA</span><span>LOẠI TỪ</span><span>TIẾN ĐỘ</span><span></span></div><div>${filtered.length ? filtered.map(word => row(word, state)).join("") : "<div class=empty-state>Không tìm thấy từ phù hợp.</div>"}</div></div></section>`;
}

function row(word, state) {
  const mastered = state.mastered.includes(word.id);
  const learning = state.reviewed.includes(word.id);
  const status = mastered ? "Đã thuộc" : learning ? "Đang học" : "Chưa học";
  const percent = mastered ? 100 : learning ? 52 : 0;
  return `<div class="word-row"><div class="jp-cell"><strong>${escapeHtml(word.japanese)}</strong><small>${escapeHtml(word.kana)}</small><span class="lesson-tag">Bài ${word.lesson}</span></div><div class="reading-cell"><strong>${escapeHtml(word.romaji || word.kana)}</strong><small>${escapeHtml(word.example || word.baseForm || "")}</small></div><div class="meaning-cell"><strong>${escapeHtml(word.meaning)}</strong></div><div class="type-cell"><span class="type-tag type-${word.category}">${escapeHtml(categoryLabels[word.category] || "Khác")}</span></div><div class="row-status ${mastered ? "mastered" : ""}"><span class="status-line"><i style="width:${percent}%"></i></span>${status}</div><button class="sound-button" data-speak="${escapeHtml(word.kana || word.japanese)}" aria-label="Nghe ${escapeHtml(word.japanese)}">◖</button></div>`;
}
