export function renderProgressDots(count, activeIndex) {
  return `<div class="practice-progress">${Array.from({ length: count }, (_, index) => `<i class="${index <= activeIndex ? "active" : ""}"></i>`).join("")}</div>`;
}
