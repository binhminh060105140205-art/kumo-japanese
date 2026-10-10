export function createRouter(onNavigate) {
  let currentView = "dashboard";
  return { getCurrentView: () => currentView, navigate(view) { currentView = view; onNavigate(view); } };
}
