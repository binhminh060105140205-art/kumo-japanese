import test from "node:test";
import assert from "node:assert/strict";
import { renderFlashcard } from "../src/components/practice/FlashcardMode.js";

test("renderFlashcard puts complete study details on the back face", () => {
  const html = renderFlashcard({
    word: {
      id: 457,
      lesson: 7,
      japanese: "歌います",
      kana: "うたいます",
      romaji: "utaimasu",
      meaning: "Hát",
      baseForm: "歌う",
      example: "歌を歌います。"
    },
    index: 0,
    total: 1,
    showRomaji: true,
    direction: "jp-to-vi"
  });
  const back = html.match(/<div class="flashcard-face back">([\s\S]*?)<span class="card-hint">/)?.[1] || "";

  assert.match(back, /歌います/);
  assert.match(back, /うたいます/);
  assert.match(back, /utaimasu/);
  assert.match(back, /Hát/);
  assert.match(back, /歌を歌います。/);
});