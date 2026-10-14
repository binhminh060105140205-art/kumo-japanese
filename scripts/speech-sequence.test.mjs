import test from "node:test";
import assert from "node:assert/strict";
import { buildSpeechSequence, speakJapanese, speakSequence } from "../src/services/speech.js";

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

test("buildSpeechSequence uses normalized kana for Japanese speech", () => {
  const sequence = buildSpeechSequence([
    { id: 1, japanese: "（お）名前", kana: "（お）なまえ／なまえ", meaning: "Tên" }
  ]);

  assert.equal(sequence[0].lang, "ja-JP");
  assert.equal(sequence[0].text, "おなまえ");
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

test("speakSequence prefers female voices for Japanese and Vietnamese", () => {
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
      this.pitch = 0;
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [
          { lang: "ja-JP", name: "Microsoft Ichiro Online" },
          { lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
          { lang: "vi-VN", name: "Microsoft An Online" },
          { lang: "vi-VN", name: "Google Tiếng Việt" }
        ];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, voice: utterance.voice?.name, pitch: utterance.pitch });
        utterance.onend();
      }
    }
  };

  speakSequence([
    { id: 1, japanese: "食べます", meaning: "Ăn" }
  ]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)", pitch: 1.12 },
    { lang: "vi-VN", voice: "Google Tiếng Việt", pitch: 1.12 }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence falls back to a Vietnamese voice instead of the browser default", () => {
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
      this.pitch = 0;
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [{ lang: "vi-VN", name: "Microsoft An Online" }];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", voice: null },
    { lang: "vi-VN", voice: "Microsoft An Online" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence falls back to a Japanese voice when no female voice is identified", () => {
  const spoken = [];
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
      this.pitch = 0;
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [{ lang: "ja-JP", name: "Microsoft Ayumi - Japanese (Japan)" }];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "アメリカ", kana: "アメリカ", meaning: "Mỹ" }]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", voice: "Microsoft Ayumi - Japanese (Japan)" },
    { lang: "vi-VN", voice: null }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence retries a failed Japanese voice once without the selected voice", () => {
  const spoken = [];
  let attempts = 0;
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
      this.pitch = 0;
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [{ lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }];
      },
      speak(utterance) {
        spoken.push({ text: utterance.text, voice: utterance.voice?.name ?? null });
        if (attempts++ === 0) utterance.onerror({ error: "synthesis-failed" });
        else utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);

  assert.deepEqual(spoken, [
    { text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { text: "たべます", voice: null },
    { text: "Ăn", voice: null }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakJapanese retries a failed selected voice", () => {
  const spoken = [];
  let attempts = 0;
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.rate = 0;
      this.pitch = 0;
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return [{ lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }];
      },
      speak(utterance) {
        spoken.push({ text: utterance.text, voice: utterance.voice?.name ?? null });
        if (attempts++ === 0) utterance.onerror({ error: "synthesis-failed" });
      }
    }
  };

  speakJapanese("（お）なまえ");

  assert.deepEqual(spoken, [
    { text: "おなまえ", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { text: "おなまえ", voice: null }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});
