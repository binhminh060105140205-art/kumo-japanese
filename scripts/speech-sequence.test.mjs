import test from "node:test";
import assert from "node:assert/strict";
import { buildSpeechSequence, speakSequence } from "../src/services/speech.js";

test("buildSpeechSequence keeps each Japanese word before its Vietnamese meaning", () => {
  const sequence = buildSpeechSequence([
    { id: 1, japanese: "食べます", meaning: "Ăn" },
    { id: 2, japanese: "飲みます", meaning: "Uống" }
  ]);

  assert.deepEqual(sequence.map(item => [item.wordId, item.lang, item.text]), [
    [1, "ja-JP", "食べます"],
    [1, "vi-VN", "Ăn"],
    [2, "ja-JP", "飲みます"],
    [2, "vi-VN", "Uống"]
  ]);
});

test("buildSpeechSequence ignores missing speech text", () => {
  const sequence = buildSpeechSequence([
    { id: 1, japanese: "見る", meaning: "" },
    { id: 2, japanese: "", meaning: "Nghe" }
  ]);

  assert.deepEqual(sequence.map(item => [item.wordId, item.lang, item.text]), [
    [1, "ja-JP", "見る"],
    [2, "vi-VN", "Nghe"]
  ]);
});

test("speakSequence speaks Japanese then Vietnamese for every word", () => {
  const spoken = [];
  const completed = [];
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      speak(utterance) {
        spoken.push([utterance.lang, utterance.text]);
        utterance.onend();
      }
    }
  };

  speakSequence([
    { id: 1, japanese: "食べます", meaning: "Ăn" },
    { id: 2, japanese: "飲みます", meaning: "Uống" }
  ], true, () => completed.push(true));

  assert.deepEqual(spoken, [
    ["ja-JP", "食べます"],
    ["vi-VN", "Ăn"],
    ["ja-JP", "飲みます"],
    ["vi-VN", "Uống"]
  ]);
  assert.deepEqual(completed, [true]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});
