import fs from "node:fs";
import path from "node:path";

const sourceRoot = process.env.JPD_ROOT || "D:/KY5/JPD";
const vocabSource = path.join(sourceRoot, "99_LUU_TRU_FILE_CU/03_FILE_TRUNG_GIAN_KY_THUAT/mizu_vocab_text.txt");
const handbookSource = path.join(sourceRoot, "99_LUU_TRU_FILE_CU/03_FILE_TRUNG_GIAN_KY_THUAT/tmp/handbook_data.json");
const outputFile = path.resolve("src/data/jpd-vocabulary.json");

const lessonTitles = JSON.parse(fs.readFileSync(handbookSource, "utf8")).lessons.reduce((result, lesson) => {
  result[lesson.num] = lesson.title;
  return result;
}, {});

const adjectiveWords = new Set([
  "新しい", "古い", "いい", "（～が）多い", "（～が）少ない", "大きい", "小さい", "高い", "低い", "暖かい", "涼しい", "暑い", "寒い", "天気がいい", "天気がわるい", "温かい", "熱い", "冷たい", "おいしい", "甘い", "辛い", "苦い", "すっぱい", "忙しい", "おもしろい", "気持ちがいい", "安い", "楽しい", "難しい", "ほしい", "近い", "遠い", "早い", "広い", "頭がいい", "かっこいい", "かわいい", "背が高い", "長い", "短い", "優しい", "黒い", "白い", "茶色い", "すごい", "危ない", "痛い", "暗い", "厳しい", "眠い", "怖い", "強い", "新鮮(な)"
]);

const otherWords = new Set([
  "～さん", "～人", "～語", "～月", "～日", "～歳", "～つ", "～階", "～屋", "～枚", "～円", "～たち", "～つ目", "～パーセント", "～引き", "～について", "どのくらい", "いつ", "いつでも", "どう", "よく", "あまり", "とても", "少し", "一人で", "どこか（へ）", "ここ／こちら", "そこ／そちら", "あそこ／あちら", "これ", "それ", "あれ", "どれ", "この～", "その～", "あの～", "どの～", "だれ", "いくら", "いくらですか", "こちらこそ", "あのう", "すみません", "そうですか。", "はじめまして", "（どうぞ）よろしくお願いします。", "いらっしゃいませ", "じゃ", "あ（っ）", "どうぞ", "それから", "いいですね", "ああ", "また今度", "わあ", "残念（な）", "そろそろ", "本当だ", "たいてい", "なかなか", "ええ", "うん", "ううん", "ごめん", "そっか", "また", "あれ？", "いただきます。", "ごちそうさまでした。", "そうなんですか。", "ほら", "きっと", "たぶん", "もし", "きちんと", "まっすぐ", "ちょっと", "ええと"
]);

const kanji113Lessons = {
  私: 1, 名: 1, 前: 1, 国: 1, 日: 1, 本: 1, 人: 1, 学: 1, 生: 1, 先: 1, 仕: 1, 事: 1, 高: 1, 大: 1, 語: 1, 誕: 1, 月: 1, 歳: 1, 趣: 1,
  何: 2, 階: 2, 店: 2, 員: 2, 円: 2, 魚: 2, 肉: 2, 野: 2, 菜: 2,
  今: 3, 午: 3, 時: 3, 分: 3, 半: 3, 曜: 3, 行: 3
};

const kanjiMeanings = {
  私: "Tôi", 名: "Tên", 前: "Trước", 国: "Đất nước", 日: "Ngày / Nhật", 本: "Sách / gốc", 人: "Người", 学: "Học", 生: "Sinh / sống", 先: "Trước / giáo viên", 仕: "Làm", 事: "Việc", 高: "Cao", 大: "To / lớn", 語: "Ngôn ngữ", 誕: "Sinh (ra)", 月: "Tháng", 歳: "Tuổi", 趣: "Sở thích", 何: "Gì / nào", 階: "Tầng", 店: "Cửa hàng", 員: "Nhân viên", 円: "Yên", 魚: "Cá", 肉: "Thịt", 野: "Cánh đồng", 菜: "Rau", 今: "Bây giờ / nay", 午: "Buổi trưa", 時: "Giờ", 分: "Phút / phần", 半: "Một nửa", 曜: "Thứ trong tuần", 行: "Đi",
  家: "Nhà / gia đình", 族: "Gia tộc / gia đình", 父: "Cha / bố", 母: "Mẹ", 兄: "Anh trai", 弟: "Em trai", 姉: "Chị gái", 妹: "Em gái", 犬: "Chó", 短: "Ngắn", 長: "Dài / người đứng đầu", 好: "Thích", 歌: "Bài hát", 音: "Âm thanh", 楽: "Vui / âm nhạc", 車: "Xe", 映: "Chiếu / phim", 画: "Tranh / hình ảnh", 旅: "Chuyến đi", 海: "Biển", 外: "Bên ngoài / nước ngoài", 駅: "Nhà ga", 上: "Trên", 下: "Dưới", 地: "Đất / địa điểm", 図: "Bản đồ / hình vẽ", 館: "Tòa nhà", 右: "Bên phải", 左: "Bên trái", 道: "Đường", 起: "Thức dậy", 歩: "Đi bộ", 乗: "Lên xe", 始: "Bắt đầu", 終: "Kết thúc", 勉: "Siêng học", 強: "Mạnh", 朝: "Buổi sáng", 昼: "Buổi trưa", 夜: "Ban đêm"
};

function toNumber(value) {
  return Number([...value].map(character => {
    const index = "０１２３４５６７８９".indexOf(character);
    return index >= 0 ? index : character;
  }).join(""));
}

function isKana(value) {
  return /^[ぁ-ゖァ-ヿー・（）()]+$/u.test(value);
}

function categoryFor(japanese) {
  if (adjectiveWords.has(japanese) || /（な）|\(な\)/.test(japanese)) return "adjective";
  if (otherWords.has(japanese) || /[～／]/.test(japanese) || /です|ません|ましょう/.test(japanese)) return "other";
  return "noun";
}

function parseVocabulary() {
  const lines = fs.readFileSync(vocabSource, "utf8").split(/\r?\n/);
  const entries = [];
  let lesson = null;
  let nextId = 1;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const raw = lines[lineIndex].trim();
    const lessonMatch = raw.match(/^第\s*([０-９0-9]+)\s*課/);
    if (lessonMatch) {
      lesson = toNumber(lessonMatch[1]);
      continue;
    }
    if (!lesson || lesson > 11 || !raw || /^\d+$/.test(raw)) continue;
    if (/^(新出語|NEW WORD|LIST|ことば|言葉確認)/i.test(raw)) continue;
    if (/[。？！]|^[ＡＢA-BＣD]:|^例[:：]/.test(raw)) continue;

    let japanese = "";
    let kana = "";
    let meaning = "";
    let baseForm = "";
    let category = "noun";
    const marker = raw.match(/^(.*?)［([^］]+)］\s*(.*)$/) || raw.match(/^(.*?)「([^」]+)」\s*(.*)$/);

    if (marker) {
      category = "verb";
      japanese = marker[1].trim();
      baseForm = marker[2].trim();
      const tail = marker[3].trim().replace(/^[123]\s*/, "");
      const readingMatch = tail.match(/^([ぁ-ゖァ-ヿー・]+)\s*(.*)$/u);
      if (readingMatch) {
        kana = readingMatch[1];
        meaning = readingMatch[2].trim();
      } else {
        meaning = tail;
      }
    } else {
      const parts = raw.split(/\s+/).filter(Boolean);
      if (parts.length < 2) continue;
      japanese = parts[0];
      if (parts[1] && isKana(parts[1])) {
        kana = parts[1];
        meaning = parts.slice(2).join(" ");
      } else {
        meaning = parts.slice(1).join(" ");
      }
      category = categoryFor(japanese);
    }

    if (!japanese || !meaning) continue;
    entries.push({ id: nextId, category, lesson, lessonTitle: lessonTitles[lesson] || `Bài ${lesson}`, japanese, kana, romaji: "", baseForm, meaning, example: "", sourceLine: lineIndex + 1 });
    nextId += 1;
  }
  return entries;
}

function parseKanji() {
  const handbook = JSON.parse(fs.readFileSync(handbookSource, "utf8"));
  const entries = [];
  let nextId = 10000;
  const add = (lesson, character, reading, exampleWord) => {
    entries.push({ id: nextId, category: "kanji", lesson, lessonTitle: lessonTitles[lesson] || `Bài ${lesson}`, japanese: character, kana: reading, romaji: "", baseForm: "", meaning: kanjiMeanings[character] || exampleWord, example: exampleWord, sourceLine: 0 });
    nextId += 1;
  };
  handbook.kanji113.forEach(([character, reading, exampleWord]) => add(kanji113Lessons[character] || 1, character, reading, exampleWord));
  handbook.kanji133.forEach(([lesson, character, reading, exampleWord]) => add(Number(lesson), character, reading, exampleWord));
  return entries;
}

const entries = [...parseVocabulary(), ...parseKanji()];
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${JSON.stringify(entries, null, 2)}\n`, "utf8");
console.log(`Imported ${entries.length} entries into ${outputFile}`);
console.log(JSON.stringify(entries.reduce((result, entry) => { result[entry.category] = (result[entry.category] || 0) + 1; return result; }, {}), null, 2));
