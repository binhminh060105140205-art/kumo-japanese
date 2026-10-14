import test from "node:test";
import assert from "node:assert/strict";
import { buildSpeechSequence, speakJapanese, speakSequence } from "../src/services/speech.js";

test("buildSpeechSequence keeps each Japanese word before its Vietnamese meaning", () => {
  const sequence = buildSpeechSequence([
    { id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" },
    { id: 2, japanese: "飲みます", kana: "のみます", meaning: "Uống" }
  ]);

  assert.deepEqual(sequence.map(item => [item.wordId, item.lang, item.text]), [
    [1, "ja-JP", "たべます"],
    [1, "vi-VN", "Ăn"],
    [2, "ja-JP", "のみます"],
    [2, "vi-VN", "Uống"]
  ]);
});

test("buildSpeechSequence ignores missing speech text", () => {
  const sequence = buildSpeechSequence([
    { id: 1, japanese: "見る", kana: "みる", meaning: "" },
    { id: 2, japanese: "", kana: "", meaning: "Nghe" }
  ]);

  assert.deepEqual(sequence.map(item => [item.wordId, item.lang, item.text]), [
    [1, "ja-JP", "みる"],
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
    { id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" },
    { id: 2, japanese: "飲みます", kana: "のみます", meaning: "Uống" }
  ], true, () => completed.push(true));

  assert.deepEqual(spoken, [
    ["ja-JP", "たべます"],
    ["vi-VN", "Ăn"],
    ["ja-JP", "のみます"],
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
    { id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }
  ]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)", pitch: 1.12 },
    { lang: "vi-VN", voice: "Google Tiếng Việt", pitch: 1.12 }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence waits for voiceschanged before speaking", () => {
  const spoken = [];
  let voices = [];
  let voicesChanged;
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
        return voices;
      },
      addEventListener(event, listener) {
        if (event === "voiceschanged") voicesChanged = listener;
      },
      removeEventListener() {},
      speak(utterance) {
        spoken.push({ lang: utterance.lang, text: utterance.text, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);
  assert.deepEqual(spoken, []);

  voices = [
    { lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", name: "Microsoft An - Vietnamese (Vietnam)" }
  ];
  voicesChanged();

  assert.deepEqual(spoken, [
    { lang: "ja-JP", text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", text: "Ăn", voice: "Microsoft An - Vietnamese (Vietnam)" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence waits for a Vietnamese voice when Japanese is already available", () => {
  const spoken = [];
  let voices = [{ lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }];
  let voicesChanged;
  globalThis.SpeechSynthesisUtterance = class {
    constructor(text) {
      this.text = text;
      this.lang = "";
      this.voice = null;
    }
  };
  globalThis.window = {
    speechSynthesis: {
      cancel() {},
      getVoices() {
        return voices;
      },
      addEventListener(event, listener) {
        if (event === "voiceschanged") voicesChanged = listener;
      },
      removeEventListener() {},
      speak(utterance) {
        spoken.push({ lang: utterance.lang, text: utterance.text, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);
  assert.deepEqual(spoken, [
    { lang: "ja-JP", text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }
  ]);

  voices = [
    { lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", name: "Microsoft An - Vietnamese (Vietnam)" }
  ];
  voicesChanged();

  assert.deepEqual(spoken, [
    { lang: "ja-JP", text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", text: "Ăn", voice: "Microsoft An - Vietnamese (Vietnam)" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence uses a Vietnamese language fallback when no voice matches", () => {
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
        return [{ lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, text: utterance.text, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "An" }]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", text: "An", voice: null }
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
    { lang: "vi-VN", voice: "Microsoft An Online" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence identifies a Vietnamese voice by name when its lang metadata is wrong", () => {
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
        return [{ lang: "en-US", name: "Microsoft An - Vietnamese (Vietnam)" }];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);

  assert.deepEqual(spoken, [
    { lang: "vi-VN", voice: "Microsoft An - Vietnamese (Vietnam)" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("speakSequence uses a language-tagged fallback when no matching voice is available", () => {
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
        return [{ lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }];
      },
      speak(utterance) {
        spoken.push({ lang: utterance.lang, text: utterance.text, voice: utterance.voice?.name ?? null });
        utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);

  assert.deepEqual(spoken, [
    { lang: "ja-JP", text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { lang: "vi-VN", text: "Ăn", voice: null }
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

test("speakSequence retries another matching Vietnamese voice before the browser default", () => {
  const spoken = [];
  let failedVietnamese = false;
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
          { lang: "ja-JP", name: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
          { lang: "vi-VN", name: "Google Tiếng Việt" },
          { lang: "vi-VN", name: "Microsoft An - Vietnamese (Vietnam)" }
        ];
      },
      speak(utterance) {
        spoken.push({ text: utterance.text, voice: utterance.voice?.name ?? null });
        if (utterance.lang === "vi-VN" && !failedVietnamese) {
          failedVietnamese = true;
          utterance.onerror({ error: "synthesis-failed" });
        } else utterance.onend();
      }
    }
  };

  speakSequence([{ id: 1, japanese: "食べます", kana: "たべます", meaning: "Ăn" }]);

  assert.deepEqual(spoken, [
    { text: "たべます", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" },
    { text: "Ăn", voice: "Google Tiếng Việt" },
    { text: "Ăn", voice: "Microsoft An - Vietnamese (Vietnam)" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});

test("buildSpeechSequence never sends kanji when a word has no kana", () => {
  assert.deepEqual(buildSpeechSequence([
    { id: 1, japanese: "名前", meaning: "Tên" }
  ]), [
    { wordId: 1, lang: "vi-VN", text: "Tên" }
  ]);
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
    { text: "おなまえ", voice: "Microsoft Nanami Online (Natural) - Japanese (Japan)" }
  ]);
  delete globalThis.window;
  delete globalThis.SpeechSynthesisUtterance;
});
