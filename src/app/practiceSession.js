import { renderFlashcard } from "../components/practice/FlashcardMode.js";
import { renderDailyComplete, renderQuiz } from "../components/practice/QuizMode.js";
import { renderTyping } from "../components/practice/TypingMode.js";
import { renderMatch } from "../components/practice/MatchMode.js";
import { renderPracticeComplete, renderPracticeEmpty } from "../components/practice/EmptyMode.js";
import { DAILY_QUIZ_SIZE } from "./store.js";
import { normalize } from "../utils/dom.js";

export class PracticeSession {
  constructor(store) {
    this.store = store;
    this.mode = "flashcards";
    this.index = 0;
    this.quiz = null;
    this.match = null;
    this.dailyWords = [];
    this.flashcardQueue = [];
    this.flashcardTotal = 0;
    this.flashcardCompleted = false;
    this.filters = { category: "all", lesson: "Tất cả", query: "" };
    this.resetFlashcardSession();
  }

  setFilters(filters) {
    this.filters = { ...this.filters, ...filters };
    this.index = 0;
    this.quiz = null;
    this.match = null;
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

  resetFlashcardSession() {
    const matchingWords = this.getFilteredWords();
    const state = this.store.getState();
    const unmasteredWords = matchingWords.filter(word => !state.mastered.includes(word.id));
    const sessionWords = unmasteredWords.length ? unmasteredWords : matchingWords;
    this.flashcardQueue = [...sessionWords];
    this.flashcardTotal = sessionWords.length;
    this.flashcardCompleted = false;
  }

  getWords() {
    const state = this.store.getState();
    const matchingWords = this.getFilteredWords();
    const availableWords = matchingWords.filter(word => !state.mastered.includes(word.id));
    return availableWords.length ? availableWords : matchingWords;
  }

  getFilteredWords() {
    const lessonNumber = this.filters.lesson === "Tất cả" ? null : Number(this.filters.lesson.replace("Bài ", ""));
    const query = normalize(this.filters.query);
    return this.store.getWords().filter(word => (this.filters.category === "all" || word.category === this.filters.category) && (lessonNumber === null || word.lesson === lessonNumber) && normalize(word.japanese + " " + word.kana + " " + word.romaji + " " + word.meaning).includes(query));
  }

  getFilteredCount() {
    return this.getFilteredWords().length;
  }

  getCurrentWord() {
    if (this.mode === "flashcards") return this.flashcardQueue[0];
    const words = this.mode === "dailyQuiz" ? this.dailyWords : this.getWords();
    return words[this.index % words.length];
  }

  getSessionWords() {
    return this.mode === "dailyQuiz" ? this.dailyWords : this.mode === "flashcards" ? this.flashcardQueue : this.getWords();
  }

  next() {
    this.index += 1;
    this.quiz = null;
  }

  render() {
    const state = this.store.getState();
    if (this.mode === "flashcards" && this.flashcardCompleted) return renderPracticeComplete({ total: this.flashcardTotal });
    if (!this.getSessionWords().length) return renderPracticeEmpty();
    if (this.mode === "flashcards") return renderFlashcard({ word: this.getCurrentWord(), index: this.flashcardTotal - this.flashcardQueue.length, total: this.flashcardTotal, showRomaji: state.showRomaji });
    if (this.mode === "quiz") return renderQuiz({ ...this.getQuizData(), total: 10, daily: false });
    if (this.mode === "dailyQuiz") return state.dailyChallenge?.completed ? renderDailyComplete({ streak: state.streak }) : renderQuiz({ ...this.getQuizData(), total: DAILY_QUIZ_SIZE, daily: true });
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
    return { ...this.quiz, index: this.index };
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
    this.flashcardQueue = this.flashcardQueue.slice(1);
    if (result === "again") this.flashcardQueue.push(word);
    this.flashcardCompleted = result === "know" && this.flashcardQueue.length === 0;
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
    setTimeout(() => { match.selected = []; }, correct ? 240 : 560);
    return result;
  }
}
