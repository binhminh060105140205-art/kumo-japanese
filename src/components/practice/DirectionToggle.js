const directionOptions = {
  flashcard: [
    ["jp-to-vi", "Mặt trước: tiếng Nhật"],
    ["vi-to-jp", "Mặt trước: tiếng Việt"]
  ],
  quiz: [
    ["jp-to-vi", "Nhật → Việt"],
    ["vi-to-jp", "Việt → Nhật"],
    ["audio-to-vi", "Nghe → Việt"]
  ]
};

export function renderDirectionToggle(type, direction) {
  const options = directionOptions[type] || [];
  return `<div class="direction-toggle" role="group" aria-label="Chọn hướng học">${options.map(([id, label]) => `<button class="direction-option ${direction === id ? "active" : ""}" type="button" data-practice-direction="${type}" data-direction="${id}" aria-pressed="${direction === id}">${label}</button>`).join("")}</div>`;
}
