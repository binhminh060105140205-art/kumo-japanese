import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
import { FlashcardQueue } from "../src/app/flashcardQueue.js";
import { getKanjiCompoundWords } from "../src/app/kanjiStudy.js";

const initialVocabulary = JSON.parse(fs.readFileSync(new URL("../src/data/jpd-vocabulary.json", import.meta.url), "utf8"));

test("flashcards show every unseen word before retrying a missed word", () => {
  const words = [{ id: 1 }, { id: 2 }, { id: 3 }];
  const queue = new FlashcardQueue(words, () => 0);
  const firstRoundIds = [];

  for (let index = 0; index < words.length; index += 1) {
    const word = queue.current();
    assert.ok(word);
    assert.equal(firstRoundIds.includes(word.id), false);
    firstRoundIds.push(word.id);
    queue.review(index === 0 ? "again" : "know", word.id);
  }

  assert.equal(queue.current().id, firstRoundIds[0]);
  assert.equal(queue.completed, false);
});

test("flashcards finish after all words are remembered", () => {
  const queue = new FlashcardQueue([{ id: 1 }, { id: 2 }], () => 0);

  for (let index = 0; index < 2; index += 1) {
    queue.review("know", queue.current().id);
  }

  assert.equal(queue.completed, true);
  assert.equal(queue.current(), undefined);
});

test("kanji compound mode selects unique multi-kanji words with a limit per character", () => {
  const words = [
    { id: 1, category: "kanji", japanese: "日", kana: "ニチ", meaning: "Ngày", lesson: 1 },
    { id: 2, category: "kanji", japanese: "本", kana: "ホン", meaning: "Sách", lesson: 1 },
    { id: 10, category: "noun", japanese: "日本", kana: "にほん", meaning: "Nhật Bản", lesson: 1 },
    { id: 11, category: "noun", japanese: "毎日", kana: "まいにち", meaning: "Mỗi ngày", lesson: 1 },
    { id: 12, category: "noun", japanese: "日曜日", kana: "にちようび", meaning: "Chủ nhật", lesson: 1 },
    { id: 13, category: "noun", japanese: "日本語", kana: "にほんご", meaning: "Tiếng Nhật", lesson: 1 },
    { id: 14, category: "noun", japanese: "本当", kana: "ほんとう", meaning: "Thật", lesson: 1 },
    { id: 15, category: "noun", japanese: "本屋", kana: "ほんや", meaning: "Hiệu sách", lesson: 1 },
    { id: 16, category: "noun", japanese: "日", kana: "ひ", meaning: "Ngày", lesson: 1 }
  ];

  const result = getKanjiCompoundWords(words, { category: "kanji", kanjiMode: "compounds", lesson: [], query: "" });

  const groups = Map.groupBy(result, word => word.kanjiSource);
  assert.equal(groups.get("日").length, 3);
  assert.equal(groups.get("本").length, 3);
  assert.equal(new Set(result.map(word => word.id)).size, result.length);
  assert.equal(result.some(word => word.japanese === "日"), false);
});

test("kanji compound mode fills missing examples with curated compounds", () => {
  const result = getKanjiCompoundWords([
    { id: 10000, category: "kanji", japanese: "私", kana: "わたし", meaning: "Tôi", lesson: 1 }
  ], { category: "kanji", kanjiMode: "compounds", lesson: [], query: "" });

  assert.deepEqual(result.map(word => word.japanese), ["私立", "私生活"]);
  assert.ok(result.every(word => word.kana && word.meaning && word.romaji));
});

test("kanji compound mode ignores duplicate kanji rows", () => {
  const result = getKanjiCompoundWords([
    { id: 10000, category: "kanji", japanese: "高", kana: "たかい", meaning: "Cao", lesson: 1 },
    { id: 10001, category: "kanji", japanese: "高", kana: "こう", meaning: "Cao", lesson: 2 }
  ], { category: "kanji", kanjiMode: "compounds", lesson: [], query: "" });

  assert.equal(new Set(result.map(word => word.kanjiSource)).size, 1);
  assert.ok(result.length >= 2 && result.length <= 3);
});

test("kanji data includes the lesson 4 to 7 study sets", () => {
  const expected = {
    4: ["東", "京", "名", "前", "国", "男", "女", "区", "市"],
    5: ["先", "週", "毎", "午", "後", "見", "食", "飲", "買", "物", "行", "休"],
    6: ["今", "来", "帰", "会", "国", "社", "聞", "新", "読", "書", "話", "寺", "言", "貝", "田", "力", "水", "火", "門"],
    7: ["肉", "料", "理", "野", "半", "大", "小"]
  };

  const lessonKanji = initialVocabulary.filter(word => word.category === "kanji" && word.lesson >= 4 && word.lesson <= 7);
  assert.equal(lessonKanji.length, 47);
  assert.ok(lessonKanji.every(word => word.kana && word.meaning && word.example));

  for (const [lesson, characters] of Object.entries(expected)) {
    assert.deepEqual(
      initialVocabulary.filter(word => word.category === "kanji" && word.lesson === Number(lesson)).map(word => word.japanese),
      characters
    );
  }
});
