import importedVocabulary from "./jpd-vocabulary.json";
import { romanizeKana } from "../utils/romanize.js";

export const initialVocabulary = importedVocabulary.map(word => ({ ...word, romaji: word.romaji || romanizeKana(word.kana) }));

export const lessonFilters = ["Tất cả", ...Array.from(new Set(importedVocabulary.map(word => word.lesson))).sort((left, right) => left - right).map(lesson => `Bài ${lesson}`)];

export const categoryFilters = [
  { id: "all", label: "Tất cả" },
  { id: "verb", label: "Động từ" },
  { id: "adjective", label: "Tính từ" },
  { id: "noun", label: "Danh từ" },
  { id: "kanji", label: "Chữ Hán" },
  { id: "other", label: "Khác" }
];

export const categoryLabels = Object.fromEntries(categoryFilters.map(filter => [filter.id, filter.label]));
