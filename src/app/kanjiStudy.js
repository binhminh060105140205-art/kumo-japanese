import { normalize } from "../utils/dom.js";
import { romanizeKana } from "../utils/romanize.js";

const MAX_COMPOUNDS_PER_KANJI = 3;
const MIN_COMPOUNDS_PER_KANJI = 2;
const KANJI_CHARACTER = /[\u3400-\u9fff]/;
const CURATED_COMPOUNDS = {
  私: [["私立", "しりつ", "Trường tư"], ["私生活", "しせいかつ", "Đời sống riêng tư"]],
  名: [["名所", "めいしょ", "Danh lam thắng cảnh"], ["名物", "めいぶつ", "Đặc sản / vật nổi tiếng"]],
  仕: [["仕方", "しかた", "Cách thức"], ["仕組み", "しくみ", "Cơ chế / cấu trúc"]],
  前: [["前後", "ぜんご", "Trước sau"], ["前半", "ぜんはん", "Nửa đầu"]],
  誕: [["誕生", "たんじょう", "Sự ra đời"]],
  歳: [["歳月", "さいげつ", "Năm tháng"], ["歳末", "さいまつ", "Cuối năm"]],
  趣: [["趣向", "しゅこう", "Sở thích / ý hướng"], ["趣旨", "しゅし", "Mục đích / ý nghĩa chính"]],
  何: [["何時", "なんじ", "Mấy giờ"], ["何人", "なんにん", "Bao nhiêu người"]],
  階: [["階段", "かいだん", "Cầu thang"], ["階下", "かいか", "Tầng dưới"]],
  円: [["円形", "えんけい", "Hình tròn"], ["円高", "えんだか", "Đồng yên tăng giá"]],
  高: [["高級", "こうきゅう", "Cao cấp"], ["高温", "こうおん", "Nhiệt độ cao"]],
  魚: [["金魚", "きんぎょ", "Cá vàng"], ["魚市場", "うおいちば", "Chợ cá"]],
  菜: [["菜食", "さいしょく", "Ăn chay"], ["菜園", "さいえん", "Vườn rau"]],
  分: [["自分", "じぶん", "Bản thân"], ["十分", "じゅうぶん", "Đầy đủ"]],
  半: [["半分", "はんぶん", "Một nửa"], ["半日", "はんにち", "Nửa ngày"]],
  曜: [["曜日", "ようび", "Thứ / ngày trong tuần"], ["月曜日", "げつようび", "Thứ hai"]],
  家: [["家庭", "かてい", "Gia đình / hộ gia đình"], ["家計", "かけい", "Kinh tế gia đình"]],
  族: [["民族", "みんぞく", "Dân tộc"], ["族長", "ぞくちょう", "Tộc trưởng"]],
  父: [["父親", "ちちおや", "Cha"], ["父母", "ふぼ", "Cha mẹ"]],
  母: [["母親", "ははおや", "Mẹ"], ["父母", "ふぼ", "Cha mẹ"]],
  兄: [["兄弟", "きょうだい", "Anh em"], ["義兄", "ぎけい", "Anh/em rể"]],
  弟: [["兄弟", "きょうだい", "Anh em"], ["義弟", "ぎてい", "Em/anh rể"]],
  姉: [["姉妹", "しまい", "Chị em gái"], ["義姉", "ぎし", "Chị/em dâu"]],
  妹: [["姉妹", "しまい", "Chị em gái"], ["義妹", "ぎまい", "Em/chị dâu"]],
  犬: [["子犬", "こいぬ", "Chó con"], ["犬小屋", "いぬごや", "Chuồng chó"]],
  短: [["短期", "たんき", "Ngắn hạn"], ["短所", "たんしょ", "Khuyết điểm"]],
  長: [["校長", "こうちょう", "Hiệu trưởng"], ["長男", "ちょうなん", "Con trai cả"]],
  好: [["好物", "こうぶつ", "Món yêu thích"], ["好意", "こうい", "Thiện ý"]],
  歌: [["歌手", "かしゅ", "Ca sĩ"], ["歌詞", "かし", "Lời bài hát"]],
  音: [["音声", "おんせい", "Âm thanh / giọng nói"], ["発音", "はつおん", "Phát âm"]],
  楽: [["楽器", "がっき", "Nhạc cụ"], ["楽園", "らくえん", "Thiên đường"]],
  旅: [["旅館", "りょかん", "Nhà trọ kiểu Nhật"], ["旅費", "りょひ", "Chi phí đi lại"]],
  海: [["海外", "かいがい", "Nước ngoài"], ["海岸", "かいがん", "Bờ biển"]],
  駅: [["駅前", "えきまえ", "Trước nhà ga"], ["駅員", "えきいん", "Nhân viên nhà ga"]],
  右: [["右手", "みぎて", "Tay phải"], ["右側", "みぎがわ", "Bên phải"]],
  左: [["左手", "ひだりて", "Tay trái"], ["左側", "ひだりがわ", "Bên trái"]],
  道: [["書道", "しょどう", "Thư pháp"], ["道路", "どうろ", "Đường sá"]],
  上: [["上下", "じょうげ", "Trên dưới"], ["上司", "じょうし", "Cấp trên"]],
  起: [["起立", "きりつ", "Đứng dậy"], ["起床", "きしょう", "Thức dậy"]],
  歩: [["散歩", "さんぽ", "Đi dạo"], ["歩道", "ほどう", "Vỉa hè"]],
  乗: [["乗車", "じょうしゃ", "Lên xe"], ["乗客", "じょうきゃく", "Hành khách"]],
  始: [["始発", "しはつ", "Chuyến đầu"], ["開始", "かいし", "Bắt đầu"]],
  終: [["終了", "しゅうりょう", "Kết thúc"], ["終点", "しゅうてん", "Điểm cuối"]],
  勉: [["勉学", "べんがく", "Học tập"], ["勤勉", "きんべん", "Chăm chỉ"]],
  強: [["強力", "きょうりょく", "Mạnh mẽ / lực mạnh"]],
  昼: [["昼食", "ちゅうしょく", "Bữa trưa"], ["昼間", "ひるま", "Ban ngày"]],
  夜: [["夜間", "やかん", "Ban đêm"], ["夜中", "よなか", "Nửa đêm"]]
};

function selectedLessons(filters) {
  return new Set(Array.isArray(filters.lesson) ? filters.lesson : filters.lesson && filters.lesson !== "Tất cả" ? [filters.lesson] : []);
}

function matchesLesson(word, lessons) {
  return !lessons.size || lessons.has(`Bài ${word.lesson}`);
}

function searchableText(word) {
  return normalize([word.japanese, word.kana, word.romaji, word.meaning].join(" "));
}

function matchesQuery(word, query) {
  return !query || searchableText(word).includes(query);
}

function kanjiCount(text) {
  return [...String(text)].filter(character => KANJI_CHARACTER.test(character)).length;
}

function isCompoundWord(word, character) {
  return word.category !== "kanji" && word.japanese.includes(character) && kanjiCount(word.japanese) >= 2 && !/[～（(]/.test(word.japanese);
}

function createCuratedWord(source, japanese, kana, meaning, index) {
  return {
    id: 200000 + source.id * 10 + index,
    category: "noun",
    lesson: source.lesson,
    lessonTitle: source.lessonTitle,
    japanese,
    kana,
    romaji: romanizeKana(kana),
    baseForm: "",
    meaning,
    example: japanese,
    sourceLine: 0
  };
}

export function getKanjiCompoundWords(words, filters = {}) {
  const lessons = selectedLessons(filters);
  const query = normalize(filters.query || "");
  const vocabulary = words.filter(word => word.category !== "kanji" && kanjiCount(word.japanese) >= 2);
  const selectedKanji = words.filter(word => word.category === "kanji" && matchesLesson(word, lessons)).filter((word, index, list) => list.findIndex(item => item.japanese === word.japanese) === index);
  const selectedWords = [];
  const selectedKeys = new Set();

  for (const kanji of selectedKanji) {
    const curated = (CURATED_COMPOUNDS[kanji.japanese] || []).map(([japanese, kana, meaning], index) => createCuratedWord(kanji, japanese, kana, meaning, index));
    const allMatches = [...vocabulary.filter(word => isCompoundWord(word, kanji.japanese)), ...curated];
    const sameLesson = allMatches.filter(word => word.lesson === kanji.lesson);
    const orderedMatches = [...sameLesson, ...allMatches.filter(word => word.lesson !== kanji.lesson)];
    const candidates = orderedMatches.filter((word, index, list) => list.findIndex(item => item.japanese === word.japanese) === index);
    const relevantMatches = query && !matchesQuery(kanji, query) ? candidates.filter(word => matchesQuery(word, query)) : candidates;
    const preferredMatches = relevantMatches.filter(word => !selectedKeys.has(word.japanese));
    const chosenMatches = preferredMatches.slice(0, MAX_COMPOUNDS_PER_KANJI);
    if (chosenMatches.length < MIN_COMPOUNDS_PER_KANJI) {
      for (const word of relevantMatches) {
        if (chosenMatches.length >= MIN_COMPOUNDS_PER_KANJI) break;
        if (!chosenMatches.includes(word)) chosenMatches.push(word);
      }
    }

    for (const [index, word] of chosenMatches.entries()) {
      const key = word.japanese;
      const output = selectedKeys.has(key)
        ? { ...word, id: 300000 + kanji.id * 10 + index, sourceWordId: word.id }
        : { ...word, kanjiSource: kanji.japanese };
      output.kanjiSource = kanji.japanese;
      selectedKeys.add(key);
      selectedWords.push(output);
    }
  }

  return selectedWords;
}
