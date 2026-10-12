import { renderAppShell, renderModal } from "../components/AppShell.js";
import { renderDashboard } from "../screens/DashboardScreen.js";
import { renderLibrary } from "../screens/LibraryScreen.js";
import { renderPractice } from "../screens/PracticeScreen.js";
import { renderStats } from "../screens/StatsScreen.js";
import { renderSettings } from "../screens/SettingsScreen.js";
import { createRouter } from "./router.js";
import { createStore } from "./store.js";
import { PracticeSession } from "./practiceSession.js";
import { $, $$, normalize } from "../utils/dom.js";
import { speakJapanese } from "../services/speech.js";

export function createApp(root) {
  const store = createStore();
  const router = createRouter(render);
  const practice = new PracticeSession(store);
  const ui = { libraryQuery: "", libraryFilter: "Tất cả", libraryCategory: "all", practice: { query: "", lesson: [], category: "all", wordLimit: Number(store.getState().practiceWordLimit) || 0 }, toastTimer: null };

  function getScreen() {
    const view = router.getCurrentView();
    const state = store.getState();
    const words = store.getWords();
    if (view === "dashboard") return renderDashboard({ state, words });
    if (view === "library") return renderLibrary({ words, state, query: ui.libraryQuery, filter: ui.libraryFilter, category: ui.libraryCategory });
    if (view === "practice") return renderPractice({ mode: practice.mode, stage: practice.render(), filters: ui.practice, filteredCount: practice.getFilteredCount(), availableCount: practice.getAvailableFilteredCount(), score: state.sessionScore });
    if (view === "stats") return renderStats({ state, words });
    return renderSettings({ state });
  }

  function render() {
    store.prepareDailyChallenge({ notifyChanges: false });
    const state = store.getState();
    root.innerHTML = renderAppShell({ view: router.getCurrentView(), state, screen: getScreen(), wordCount: store.getWords().length }) + renderModal();
    const score = $("[data-session-score]");
    if (score) score.textContent = `${state.sessionScore} điểm`;
    if (router.getCurrentView() === "practice" && practice.mode === "typing") setTimeout(() => $("#typing-input")?.focus(), 0);
  }

  function toast(message) {
    const element = $("#toast");
    if (!element) return;
    element.textContent = message;
    element.classList.add("visible");
    clearTimeout(ui.toastTimer);
    ui.toastTimer = setTimeout(() => element.classList.remove("visible"), 2500);
  }

  function startPractice(mode) {
    if (mode === "dailyQuiz") store.prepareDailyChallenge({ notifyChanges: false });
    practice.setFilters(ui.practice);
    practice.setMode(mode);
    router.navigate("practice");
  }

  function handleQuizAnswer(button) {
    const result = practice.answerQuiz(button.dataset.answer);
    if (!result) return;
    render();
    toast(result.completed ? "Hoàn thành bài hôm nay! Chuỗi " + store.getState().streak + " ngày" : result.correct ? "Chính xác! +10 điểm" : "Đáp án đúng: " + result.word.meaning);
    if (result.completed) return;
    setTimeout(() => { practice.next(); render(); }, 550);
  }

  function handleTypingCheck() {
    const input = $("#typing-input");
    if (!input || input.disabled) return;
    const word = practice.getTypingWord();
    const answer = normalize(input.value);
    const correct = [word.romaji, word.kana, word.japanese].some(value => normalize(value) === answer);
    practice.next();
    store.markWord(word.id, correct ? "mastered" : "reviewed");
    toast(correct ? `Chính xác! ${word.kana} · +10 điểm` : `Đáp án: ${word.kana} (${word.romaji})`);
  }

  function handleReview(review) {
    const flashcard = $("#flashcard");
    const flashcardShell = flashcard?.closest(".flashcard-shell");
    if (!flashcard || !flashcardShell || flashcardShell.classList.contains("is-exiting")) return;
    const result = review.dataset.review;
    const wordId = practice.getCurrentWord()?.id;
    flashcardShell.classList.add("is-exiting", result === "again" ? "slide-left" : "slide-right");
    $$(".review-button").forEach(button => {
      button.disabled = true;
      button.classList.add(button === review ? "review-choice" : "review-muted");
    });
    setTimeout(() => {
      practice.reviewFlashcard(result, wordId);
    }, 100);
  }

  function handleClick(event) {
    const nav = event.target.closest("[data-view]");
    if (nav) {
      if (nav.dataset.view === "practice") practice.setFilters(ui.practice);
      router.navigate(nav.dataset.view);
      return;
    }

    const start = event.target.closest("[data-start]");
    if (start) { startPractice(start.dataset.start); return; }

    const mode = event.target.closest("[data-mode]");
    if (mode) { startPractice(mode.dataset.mode); return; }

    const direction = event.target.closest("[data-practice-direction]");
    if (direction) {
      practice.setDirection(direction.dataset.practiceDirection, direction.dataset.direction);
      render();
      return;
    }

    const practiceFilter = event.target.closest("[data-practice-filter]");
    if (practiceFilter) {
      if (practiceFilter.dataset.practiceFilter === "category") {
        ui.practice.category = practiceFilter.dataset.value;
      } else if (practiceFilter.dataset.practiceFilter === "wordLimit") {
        ui.practice.wordLimit = Number(practiceFilter.dataset.value) || 0;
        practice.setFilters(ui.practice);
        store.updateSettings({ practiceWordLimit: ui.practice.wordLimit });
        return;
      } else {
        const selectedLessons = new Set(Array.isArray(ui.practice.lesson) ? ui.practice.lesson : ui.practice.lesson === "Tất cả" ? [] : [ui.practice.lesson]);
        if (practiceFilter.dataset.value === "Tất cả") selectedLessons.clear();
        else if (selectedLessons.has(practiceFilter.dataset.value)) selectedLessons.delete(practiceFilter.dataset.value);
        else selectedLessons.add(practiceFilter.dataset.value);
        ui.practice.lesson = [...selectedLessons];
      }
      practice.setFilters(ui.practice);
      render();
      return;
    }

    const filter = event.target.closest("[data-filter]");
    if (filter) { ui.libraryFilter = filter.dataset.filter; render(); return; }

    const category = event.target.closest("[data-category]");
    if (category) { ui.libraryCategory = category.dataset.category; render(); return; }

    const speaker = event.target.closest("[data-speak]");
    if (speaker) { speakJapanese(speaker.dataset.speak, store.getState().soundEnabled); return; }

    if (event.target.id === "word-modal") { $("#word-modal")?.classList.remove("visible"); return; }

    const action = event.target.closest("[data-action]");
    if (action) {
      const name = action.dataset.action;
      if (name === "toggle-theme") { store.updateSettings({ theme: store.getState().theme === "dark" ? "light" : "dark" }); return; }
      if (name === "open-modal") { $("#word-modal")?.classList.add("visible"); return; }
      if (name === "close-modal") { $("#word-modal")?.classList.remove("visible"); return; }
      if (name === "flip-card") { $("#flashcard")?.classList.toggle("flipped"); return; }
      if (name === "check-typing") { handleTypingCheck(); return; }
      if (name === "skip-typing") { practice.next(); render(); return; }
      if (name === "restart-match") { practice.match = null; render(); return; }
      if (name === "reset-progress") { if (window.confirm("Bạn có chắc muốn đặt lại tiến độ?")) { store.reset(); toast("Đã đặt lại tiến độ"); } return; }
    }

    if (event.target.closest("#flashcard") && !event.target.closest("[data-speak]")) { $("#flashcard")?.classList.toggle("flipped"); return; }

    const review = event.target.closest("[data-review]");
    if (review) { handleReview(review); return; }

    const answer = event.target.closest("[data-answer]");
    if (answer) { handleQuizAnswer(answer); return; }

    const tile = event.target.closest("[data-tile]");
    if (tile) { const result = practice.selectMatch(tile.dataset.tile); if (result.status === "correct") toast("Ghép đúng! +10 điểm"); if (result.status === "wrong") toast("Chưa đúng, thử lại nhé"); render(); return; }
  }

  function handleInput(event) {
    if (event.target.id === "word-search") { ui.libraryQuery = event.target.value; const caret = event.target.selectionStart; render(); const search = $("#word-search"); search?.focus(); search?.setSelectionRange(caret, caret); }
    if (event.target.id === "practice-search") { ui.practice.query = event.target.value; const caret = event.target.selectionStart; practice.setFilters(ui.practice); render(); const search = $("#practice-search"); search?.focus(); search?.setSelectionRange(caret, caret); }
  }

  function handleChange(event) {
    const filter = event.target.closest("[data-filter]");
    if (filter) { ui.libraryFilter = filter.dataset.filter; render(); return; }
    const setting = event.target.closest("[data-setting]");
    if (setting) { const value = setting.type === "checkbox" ? setting.checked : Number(setting.value); store.updateSettings({ [setting.dataset.setting]: value }); }
  }

  function handleSubmit(event) {
    if (event.target.id !== "word-form") return;
    event.preventDefault();
    const values = new FormData(event.target);
    const lesson = Number(String(values.get("lesson")).replace(/\D/g, ""));
    store.addWord({ id: Date.now(), category: "noun", japanese: values.get("japanese"), kana: values.get("kana"), romaji: values.get("romaji"), meaning: values.get("meaning"), lesson, lessonTitle: `Bài ${lesson}`, baseForm: "", example: "" });
    $("#word-modal")?.classList.remove("visible");
    toast("Đã thêm từ mới vào thư viện");
  }

  function handleKeydown(event) {
    if (router.getCurrentView() !== "practice") return;
    const isEditable = ["INPUT", "TEXTAREA", "SELECT"].includes(event.target?.tagName) || event.target?.isContentEditable;
    if (event.key.toLowerCase() === "m" && !isEditable) {
      const word = practice.getCurrentWord();
      if (word) speakJapanese(word.japanese, store.getState().soundEnabled);
      return;
    }
    if (practice.mode === "flashcards") {
      if (event.code === "Space") { event.preventDefault(); $("#flashcard")?.classList.toggle("flipped"); }
      if (event.key === "ArrowLeft") { event.preventDefault(); $("[data-review=\"again\"]")?.click(); }
      if (event.key === "ArrowRight") { event.preventDefault(); $("[data-review=\"know\"]")?.click(); }
    }
    if (practice.mode === "typing" && event.key === "Enter") handleTypingCheck();
    if (practice.mode === "quiz" && /^[1-4]$/.test(event.key)) $$(".answer-option")[Number(event.key) - 1]?.click();
  }

  root.addEventListener("click", handleClick);
  root.addEventListener("input", handleInput);
  root.addEventListener("change", handleChange);
  root.addEventListener("submit", handleSubmit);
  document.addEventListener("keydown", handleKeydown);
  store.subscribe(render);
  render();
}
