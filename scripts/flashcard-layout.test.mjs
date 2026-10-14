import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("flashcard faces share the same absolute 3D layer", async () => {
  const css = await readFile(new URL("../src/styles/practice.css", import.meta.url), "utf8");
  const faceRule = css.match(/\.flashcard-face\s*\{([^}]*)\}/)?.[1] || "";

  assert.match(faceRule, /position:\s*absolute/);
  assert.match(faceRule, /inset:\s*0/);
});
