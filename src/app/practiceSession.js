import { renderFlashcard } from "../components/practice/FlashcardMode.js";
import { renderDailyComplete, renderQuiz } from "../components/practice/QuizMode.js";
import { renderTyping } from "../components/practice/TypingMode.js";
import { renderMatch } from "../components/practice/MatchMode.js";
import { renderPracticeComplete, renderPracticeEmpty } from "../components/practice/EmptyMode.js";
import { DAILY_QUIZ_SIZE } from "./store.js";
import { FlashcardQueue } from "./flashcardQueue.js";
import { getKanjiCompoundWords } from "./kanjiStudy.js";
import { normalize } from "../utils/dom.js";

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export class PracticeSession {
  constructor(store) {
    this.store = store;
    this.mode = "flashcards";
    this.flashcardDirection = "jp-to-vi";
    this.quizDirection = "jp-to-vi";
    this.index = 0;
    this.quiz = null;
    this.match = null;
    this.dailyWords = [];
    this.wordPool = [];
    this.flashcardQueue = new FlashcardQueue([]);
    this.flashcardTotal = 0;
    this.flashcardCompleted = false;
    this.filters = { category: "all", kanjiMode: "single", lesson: "Tất cả", query: "", wordLimit: Number(store.getState().practiceWordLimit) || 0 };
    this.refreshWordPool();
    this.resetFlashcardSession();
  }

  setFilters(filters) {
    this.filters = { ...this.filters, ...filters, wordLimit: Number(filters.wordLimit) || 0 };
    this.index = 0;
    this.quiz = null;
    this.match = null;
    this.refreshWordPool();
    this.resetFlashcardSession();
  }

  setMode(mode) {
    this.mode = mode;
    this.index = mode === "dailyQuiz" ? (this.store.getState().dailyChallenge?.answered || 0) : 0;
    this.quiz = null;
    this.match = null;
    this.dailyWords = mode === "dailyQuiz" ? this.store.getDailyChallengeWords() : [];
    this.resetFlashcardSession();
  }

  setDirection(type, direction) {
    if (type === "flashcard" && ["jp-to-vi", "vi-to-jp"].includes(direction)) this.flashcardDirection = direction;
    if (type === "quiz" && ["jp-to-vi", "vi-to-jp", "audio-to-vi"].includes(direction)) {
      this.quizDirection = direction;
      this.quiz = null;
    }
  }

  refreshWordPool() {
    const matchingWords = this.getFilteredWords();
    const limit = Number(this.filters.wordLimit) || 0;
    this.wordPool = limit > 0 ? shuffle(matchingWords).slice(0, limit) : [...matchingWords];
  }

  resetFlashcardSession() {
    const selectedWords = this.wordPool;
    this.flashcardQueue = new FlashcardQueue(selectedWords);
    this.flashcardTotal = selectedWords.length;
    this.flashcardCompleted = this.flashcardQueue.completed;
  }

  getWords() {
    return this.wordPool;
  }

  getFilteredWords() {
    if (this.filters.category === "kanji" && this.filters.kanjiMode === "compounds") return getKanjiCompoundWords(this.store.getWords(), this.filters);
    const selectedLessons = new Set(Array.isArray(this.filters.lesson) ? this.filters.lesson : this.filters.lesson && this.filters.lesson !== "Tất cả" ? [this.filters.lesson] : []);
    const query = normalize(this.filters.query);
    return this.store.getWords().filter(word => (this.filters.category === "all" || word.category === this.filters.category) && (!selectedLessons.size || selectedLessons.has(`Bài ${word.lesson}`)) && normalize(word.japanese + " " + word.kana + " " + word.romaji + " " + word.meaning).includes(query));
  }

  getFilteredCount() {
    return this.getFilteredWords().length;
  }

  getAvailableFilteredCount() {
    return this.getFilteredCount();
  }

  getCurrentWord() {
    if (this.mode === "flashcards") return this.flashcardQueue.current();
    const words = this.mode === "dailyQuiz" ? this.dailyWords : this.getWords();
    return words[this.index % words.length];
  }

  getSessionWords() {
    return this.mode === "dailyQuiz" ? this.dailyWords : this.mode === "flashcards" ? this.flashcardQueue.items : this.getWords();
  }

  next() {
    this.index += 1;
    this.quiz = null;
  }

  render() {
    const state = this.store.getState();
    if (this.mode === "flashcards" && this.flashcardCompleted) return renderPracticeComplete({ total: this.flashcardTotal });
    if (!this.getSessionWords().length) return renderPracticeEmpty();
    if (this.mode === "flashcards") return renderFlashcard({ word: this.getCurrentWord(), index: this.flashcardQueue.roundIndex, total: this.flashcardQueue.roundTotal, showRomaji: state.showRomaji, direction: this.flashcardDirection });
    if (this.mode === "quiz") return renderQuiz({ ...this.getQuizData(), total: 10, daily: false, direction: this.quizDirection });
    if (this.mode === "dailyQuiz") return state.dailyChallenge?.completed ? renderDailyComplete({ streak: state.streak }) : renderQuiz({ ...this.getQuizData(), total: DAILY_QUIZ_SIZE, daily: true, direction: this.quizDirection });
    if (this.mode === "typing") return renderTyping({ word: this.getCurrentWord(), index: this.index });
    return renderMatch({ state: this.getMatchState() });
  }

  getQuizData() {
    if (!this.quiz) {
      const words = this.getSessionWords();
      const question = words[this.index % words.length];
      const distractors = this.store.getWords().filter(word => word.id !== question.id).sort(() => Math.random() - 0.5).slice(0, 3);
      this.quiz = { question, options: [question, ...distractors].sort(() => Math.random() - 0.5), answered: false };
    }
    return { ...this.quiz, index: this.index, direction: this.quizDirection };
  }

  answerQuiz(id) {
    if (!this.quiz || this.quiz.answered) return null;
    const correct = Number(id) === this.quiz.question.id;
    this.quiz.answered = true;
    this.store.markWord(this.quiz.question.id, correct ? "mastered" : "reviewed");
    const dailyProgress = this.mode === "dailyQuiz" ? this.store.recordDailyAnswer() : null;
    return { correct, word: this.quiz.question, completed: Boolean(dailyProgress?.completed && !dailyProgress.alreadyCompleted) };
  }

  getTypingWord() { return this.getCurrentWord(); }

  reviewFlashcard(result, expectedWordId) {
    if (this.mode !== "flashcards" || this.flashcardCompleted) return null;
    const word = this.getCurrentWord();
    if (!word || (expectedWordId !== undefined && word.id !== expectedWordId)) return null;
    const review = this.flashcardQueue.review(result, expectedWordId);
    if (!review) return null;
    this.flashcardCompleted = review.completed;
    this.store.markWord(word.id, result === "know" ? "mastered" : "reviewed");
    return { word, completed: this.flashcardCompleted };
  }

  createMatch() {
    const words = this.getWords().slice(0, 8);
    const tiles = words.flatMap(word => [{ id: `${word.id}-jp`, wordId: word.id, type: "jp", text: word.japanese, sub: word.kana }, { id: `${word.id}-meaning`, wordId: word.id, type: "meaning", text: word.meaning, sub: word.romaji }]).sort(() => Math.random() - 0.5);
    this.match = { words, tiles, selected: [], matched: [], won: false };
  }

  getMatchState() {
    if (!this.match) this.createMatch();
    return this.match;
  }

  selectMatch(tileId) {
    const match = this.getMatchState();
    if (match.selected.includes(tileId)) return { status: "ignored" };
    const tile = match.tiles.find(item => item.id === tileId);
    if (!tile || match.matched.includes(tile.wordId)) return { status: "ignored" };
    match.selected.push(tileId);
    if (match.selected.length < 2) return { status: "selected" };
    const selectedTiles = match.selected.map(id => match.tiles.find(item => item.id === id));
    const correct = selectedTiles[0].wordId === selectedTiles[1].wordId && selectedTiles[0].type !== selectedTiles[1].type;
    if (correct) {
      match.matched.push(tile.wordId);
      this.store.markWord(tile.wordId, "mastered");
      if (match.matched.length === match.words.length) match.won = true;
    }
    const result = { status: correct ? "correct" : "wrong", won: match.won };
    setTimeout(() => { match.selected = []; }, correct ? 120 : 280);
    return result;
  }
}
