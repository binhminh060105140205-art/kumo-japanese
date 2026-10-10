export function renderModeCard(mode, icon, title, description, action, color) {
  return `<button class="mode-card ${color}-mode" data-start="${mode}"><span class="mode-art">${icon}</span><span class="mode-content"><strong>${title}</strong><small>${description}</small><em>${action}</em></span></button>`;
}
