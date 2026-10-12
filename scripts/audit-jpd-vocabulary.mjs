import fs from "node:fs";

const entries = JSON.parse(fs.readFileSync("src/data/jpd-vocabulary.json", "utf8"));
const vocabulary = entries.filter((entry) => entry.category !== "kanji");
const failures = [];
const ids = new Set();

for (const entry of entries) {
  if (ids.has(entry.id)) failures.push(`Duplicate ID: ${entry.id}`);
  ids.add(entry.id);
  if (!entry.japanese || !entry.meaning) failures.push(`Missing content: ${entry.id}`);
  if (!entry.kana) failures.push(`Missing kana: ${entry.id} ${entry.japanese}`);
  if (entry.category === "verb" && !entry.baseForm) failures.push(`Verb missing dictionary form: ${entry.id} ${entry.japanese}`);
}

const forbiddenSourceLines = new Set([31, 34, 75, 125, 132, 149, 170, 207, 261, 280, 290, 322, 328, 331, 360, 370, 376, 404, 423, 425, 427, 432, 434, 438, 441, 443, 473, 485, 506, 510, 533, 543, 569, 640, 642, 697, 701, 713, 718, 731, 760, 786, 847, 858, 872]);
for (const entry of vocabulary) {
  if (forbiddenSourceLines.has(entry.sourceLine)) failures.push(`Example fragment remains: ${entry.id} sourceLine ${entry.sourceLine}`);
  if (/[。？！…]/u.test(entry.japanese)) failures.push(`Example sentence remains: ${entry.id} ${entry.japanese}`);
}

const expected = [
  [460, "弾きます", "ひきます", "弾く"],
  [699, "弾きます", "ひきます", "弾く"],
  [61, "携帯電話", "けいたいでんわ", ""],
  [53, "きつえんじょ", "きつえんじょ", ""],
  [422, "しょうゆ", "しょうゆ", ""]
];
for (const [id, japanese, kana, baseForm] of expected) {
  const entry = entries.find((item) => item.id === id);
  if (!entry || entry.japanese !== japanese || entry.kana !== kana || (baseForm && entry.baseForm !== baseForm)) failures.push(`Standard record mismatch: ${id}`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Audit OK: ${entries.length} entries (${vocabulary.length} vocabulary + ${entries.length - vocabulary.length} kanji)`);
console.log(`Kana complete: ${vocabulary.length}/${vocabulary.length}`);
console.log(`Verb dictionary forms: ${vocabulary.filter((entry) => entry.category === "verb").length}/${vocabulary.filter((entry) => entry.category === "verb").length}`);
