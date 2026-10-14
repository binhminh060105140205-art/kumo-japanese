import test from "node:test";
import assert from "node:assert/strict";
import { FlashcardQueue } from "../src/app/flashcardQueue.js";

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