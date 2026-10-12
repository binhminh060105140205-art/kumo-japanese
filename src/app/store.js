import { initialVocabulary } from "../data/vocabulary.js";

const STORAGE_KEY = "kumo-japanese-state-v2";
export const DAILY_QUIZ_SIZE = 5;
const DAILY_STATE_VERSION = 2;
const defaultState = { mastered: [], reviewed: [], customWords: [], goalCompleted: 0, dailyGoal: DAILY_QUIZ_SIZE, streak: 0, sessionScore: 0, soundEnabled: true, showRomaji: true, theme: "dark", dailyChallenge: null, dailyResetVersion: DAILY_STATE_VERSION, lastDailyCompletionDate: null };

function getDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function isYesterday(previousDate, currentDate) {
  const previous = new Date(previousDate + "T00:00:00");
  const current = new Date(currentDate + "T00:00:00");
  return current.getTime() - previous.getTime() === 86400000;
}

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultState);
    const state = { ...defaultState, ...saved };
    return {
      ...state,
      goalCompleted: Math.min(DAILY_QUIZ_SIZE, Math.max(0, Number(state.goalCompleted) || 0)),
      dailyGoal: DAILY_QUIZ_SIZE,
      streak: Math.max(0, Number(state.streak) || 0),
      dailyResetVersion: DAILY_STATE_VERSION
    };
  } catch { return structuredClone(defaultState); }
}

export function createStore() {
  let state = readState();
  const listeners = new Set();
  const persist = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const notify = () => { listeners.forEach(listener => listener(state)); persist(); };
  const allWords = () => [...initialVocabulary, ...state.customWords];
  return {
    getState: () => state,
    getWords: allWords,
    subscribe: listener => { listeners.add(listener); return () => listeners.delete(listener); },
    prepareDailyChallenge({ notifyChanges = true } = {}) {
      const words = allWords();
      const today = getDateKey();
      const current = state.dailyChallenge;
      const expectedSize = Math.min(DAILY_QUIZ_SIZE, words.length);
      const availableIds = new Set(words.map(word => word.id));
      const isValid = current && current.date === today && Array.isArray(current.wordIds) && current.wordIds.length === expectedSize && current.wordIds.every(id => availableIds.has(id));
      if (isValid) return current;
      state = { ...state, goalCompleted: 0, dailyChallenge: { date: today, wordIds: shuffle(words).slice(0, DAILY_QUIZ_SIZE).map(word => word.id), answered: 0, completed: false } };
      if (notifyChanges) notify(); else persist();
      return state.dailyChallenge;
    },
    getDailyChallengeWords() {
      const challenge = state.dailyChallenge;
      if (!challenge) return [];
      const wordsById = new Map(allWords().map(word => [word.id, word]));
      return challenge.wordIds.map(id => wordsById.get(id)).filter(Boolean);
    },
    markWord(wordId, result) {
      const mastered = new Set(state.mastered); const reviewed = new Set(state.reviewed);
      if (result === "mastered") { mastered.add(wordId); reviewed.delete(wordId); } else reviewed.add(wordId);
      state = { ...state, mastered: [...mastered], reviewed: [...reviewed], sessionScore: state.sessionScore + (result === "mastered" ? 10 : 4) };
      notify();
    },
    recordDailyAnswer() {
      const challenge = this.prepareDailyChallenge({ notifyChanges: false });
      if (!challenge || challenge.completed) return { answered: challenge?.answered || 0, completed: true, alreadyCompleted: true };
      const answered = Math.min(DAILY_QUIZ_SIZE, challenge.answered + 1);
      const completed = answered === DAILY_QUIZ_SIZE;
      const nextStreak = completed ? (isYesterday(state.lastDailyCompletionDate, challenge.date) ? state.streak + 1 : 1) : state.streak;
      state = { ...state, goalCompleted: answered, dailyChallenge: { ...challenge, answered, completed }, streak: nextStreak, lastDailyCompletionDate: completed ? challenge.date : state.lastDailyCompletionDate };
      notify();
      return { answered, completed, alreadyCompleted: false };
    },
    addWord(word) { state = { ...state, customWords: [...state.customWords, word] }; notify(); },
    updateSettings(settings) { state = { ...state, ...settings, dailyGoal: DAILY_QUIZ_SIZE }; notify(); },
    reset() { state = structuredClone(defaultState); notify(); }
  };
}
