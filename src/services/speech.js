const femaleVoiceHintsByLanguage = {
  ja: /female|woman|girl|kyoko|haruka|nanami|sayaka|aoi|yuna|google.*(日本語|japanese)|microsoft.*(nanami|haruka|kyoko|sayaka|aoi|yuna)/i,
  vi: /female|woman|girl|hoai ?my|hoài ?my|linh|mai|google.*(tiếng việt|vietnamese)|microsoft.*(hoai ?my|linh|mai)/i
};
const maleVoiceHints = /\bmale\b|\bman\b|\bichiro\b|\botoya\b|\bnam[\s_-]*minh\b/i;

export function buildSpeechSequence(words) {
  return words.flatMap(word => {
    const japaneseText = normalizeJapaneseSpeech(word.kana || word.japanese);
    return [
      japaneseText ? { wordId: word.id, lang: "ja-JP", text: japaneseText } : null,
      word.meaning ? { wordId: word.id, lang: "vi-VN", text: word.meaning } : null
    ];
  }).filter(Boolean);
}

function normalizeJapaneseSpeech(text) {
  const source = String(text || "").trim();
  if (!source) return "";
  const candidates = source.split(/[\/／・]/).map(candidate => candidate.trim()).filter(Boolean);
  const reading = candidates.find(candidate => /[\u3040-\u309f]/.test(candidate)) || candidates[0] || source;
  return reading
    .replace(/[（）()]/g, "")
    .replace(/[～〜~]/g, "")
    .replace(/[、,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getSpeechSynthesis() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

function matchesLanguage(voice, lang) {
  const voiceLang = String(voice.lang || "").toLowerCase();
  const normalizedLang = lang.toLowerCase();
  const prefix = normalizedLang.slice(0, 2);
  return voiceLang === normalizedLang || voiceLang === prefix || voiceLang.startsWith(prefix + "-") || voiceLang.startsWith(prefix + "_");
}

function isFemaleVoice(voice, lang) {
  const languagePrefix = lang.slice(0, 2).toLowerCase();
  const femaleHints = femaleVoiceHintsByLanguage[languagePrefix];
  return Boolean(femaleHints?.test(voice.name || "")) && !maleVoiceHints.test(voice.name || "");
}

function scoreVoice(voice, lang) {
  let score = 0;
  if (voice.lang?.toLowerCase() === lang.toLowerCase()) score += 20;
  if (isFemaleVoice(voice, lang)) score += 100;
  if (maleVoiceHints.test(voice.name || "")) score -= 100;
  return score;
}

function getPreferredVoice(lang) {
  const speechSynthesis = getSpeechSynthesis();
  if (!speechSynthesis || typeof speechSynthesis.getVoices !== "function") return null;
  const voices = speechSynthesis.getVoices().filter(voice => matchesLanguage(voice, lang));
  const femaleVoices = voices.filter(voice => isFemaleVoice(voice, lang));
  const candidates = femaleVoices.length ? femaleVoices : voices;
  return [...candidates]
    .sort((first, second) => scoreVoice(second, lang) - scoreVoice(first, lang))[0] || null;
}

function createUtterance(text, lang, usePreferredVoice = true) {
  const speechText = lang === "ja-JP" ? normalizeJapaneseSpeech(text) : String(text || "").trim();
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = lang;
  utterance.rate = lang === "ja-JP" ? 0.84 : 0.9;
  utterance.pitch = 1.12;
  const voice = usePreferredVoice ? getPreferredVoice(lang) : null;
  if (voice) utterance.voice = voice;
  return utterance;
}

export function speakJapanese(text, enabled = true) {
  const speechSynthesis = getSpeechSynthesis();
  if (!enabled || !speechSynthesis) return;
  speechSynthesis.cancel();
  let retryWithoutVoice = true;
  const speakCurrent = (usePreferredVoice) => {
    const utterance = createUtterance(text, "ja-JP", usePreferredVoice);
    utterance.onerror = () => {
      if (!retryWithoutVoice) return;
      retryWithoutVoice = false;
      speechSynthesis.cancel();
      speakCurrent(false);
    };
    speechSynthesis.speak(utterance);
  };
  speakCurrent(true);
}

export function speakSequence(words, enabled = true, onComplete = () => {}) {
  const speechSynthesis = getSpeechSynthesis();
  if (!enabled || !speechSynthesis) return () => {};
  const sequence = buildSpeechSequence(words);
  let cursor = 0;
  let stopped = false;

  const speakNext = () => {
    if (stopped || cursor >= sequence.length) {
      if (!stopped) onComplete();
      return;
    }
    const item = sequence[cursor];
    let retryWithoutVoice = true;

    const speakCurrent = (usePreferredVoice) => {
      const utterance = createUtterance(item.text, item.lang, usePreferredVoice);
      let finished = false;
      const continueSequence = () => {
        if (finished) return;
        finished = true;
        cursor += 1;
        speakNext();
      };
      utterance.onend = continueSequence;
      utterance.onerror = () => {
        if (finished) return;
        if (retryWithoutVoice) {
          finished = true;
          retryWithoutVoice = false;
          speechSynthesis.cancel();
          speakCurrent(false);
          return;
        }
        continueSequence();
      };
      speechSynthesis.speak(utterance);
    };

    speakCurrent(true);
  };

  speechSynthesis.cancel();
  speakNext();
  return () => {
    stopped = true;
    speechSynthesis.cancel();
  };
}
