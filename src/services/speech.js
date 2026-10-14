const femaleVoiceHintsByLanguage = {
  ja: /female|woman|girl|kyoko|haruka|nanami|sayaka|aoi|yuna|google.*(日本語|japanese)|microsoft.*(nanami|haruka|kyoko|sayaka|aoi|yuna)/i,
  vi: /female|woman|girl|hoai ?my|hoài ?my|linh|mai|google.*(tiếng việt|vietnamese)|microsoft.*(hoai ?my|linh|mai)/i
};
const maleVoiceHints = /\bmale\b|\bman\b|\bichiro\b|\botoya\b|\bnam[\s_-]*minh\b/i;
const languageNameHints = {
  ja: /japanese|日本語|日本|ayumi|haruka|ichiro|nanami|sayaka|kyoko/i,
  vi: /vietnamese|tiếng việt|việt nam|hoai ?my|hoài ?my|nam[\s_-]*minh|microsoft\s+an\b|google\s+tiếng việt/i
};

export function buildSpeechSequence(words) {
  return words.flatMap(word => {
    const japaneseText = normalizeJapaneseSpeech(word.kana);
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

function getVoices(speechSynthesis) {
  if (!speechSynthesis || typeof speechSynthesis.getVoices !== "function") return null;
  return speechSynthesis.getVoices().filter(Boolean);
}

function hasVoiceForLanguage(voices, lang) {
  if (!voices) return false;
  return lang ? voices.some(voice => matchesLanguage(voice, lang)) : voices.length > 0;
}

function waitForVoices(speechSynthesis, onReady, lang = null) {
  const initialVoices = getVoices(speechSynthesis);
  if (!initialVoices || hasVoiceForLanguage(initialVoices, lang) || typeof speechSynthesis.addEventListener !== "function") {
    onReady();
    return () => {};
  }

  let active = true;
  let timeoutId;
  const check = () => {
    if (!active) return;
    if (!hasVoiceForLanguage(getVoices(speechSynthesis), lang)) return;
    active = false;
    if (timeoutId) clearTimeout(timeoutId);
    speechSynthesis.removeEventListener?.("voiceschanged", check);
    onReady();
  };

  const finish = () => {
    if (!active) return;
    active = false;
    if (timeoutId) clearTimeout(timeoutId);
    speechSynthesis.removeEventListener?.("voiceschanged", check);
    onReady();
  };

  speechSynthesis.addEventListener("voiceschanged", check);
  timeoutId = setTimeout(finish, 1500);
  return () => {
    active = false;
    if (timeoutId) clearTimeout(timeoutId);
    speechSynthesis.removeEventListener?.("voiceschanged", check);
  };
}

function matchesLanguage(voice, lang) {
  const voiceLang = String(voice.lang || "").toLowerCase();
  const normalizedLang = lang.toLowerCase();
  const prefix = normalizedLang.slice(0, 2);
  if (voiceLang === normalizedLang || voiceLang === prefix || voiceLang.startsWith(prefix + "-") || voiceLang.startsWith(prefix + "_")) return true;
  const voiceDetails = String(voice.name || "") + " " + String(voice.voiceURI || "");
  return Boolean(languageNameHints[prefix]?.test(voiceDetails));
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

function getVoiceCandidates(lang) {
  const speechSynthesis = getSpeechSynthesis();
  const voices = getVoices(speechSynthesis);
  if (!voices) return null;
  const matchingVoices = voices.filter(voice => matchesLanguage(voice, lang));
  return [...matchingVoices].sort((first, second) => scoreVoice(second, lang) - scoreVoice(first, lang));
}

function createUtterance(text, lang, voice = null) {
  const speechText = lang === "ja-JP" ? normalizeJapaneseSpeech(text) : String(text || "").trim();
  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = lang;
  utterance.rate = lang === "ja-JP" ? 0.84 : 0.9;
  utterance.pitch = 1.12;
  if (voice) utterance.voice = voice;
  return utterance;
}

export function speakJapanese(text, enabled = true) {
  const speechSynthesis = getSpeechSynthesis();
  if (!enabled || !speechSynthesis) return;
  speechSynthesis.cancel();
  let stopped = false;
  let stopWaiting = () => {};

  const start = () => {
    if (stopped) return;
    const candidates = getVoiceCandidates("ja-JP");
    if (candidates && !candidates.length) return;
    let voiceIndex = 0;
    const speakCurrent = () => {
      if (stopped) return;
      const voice = candidates?.[voiceIndex] || null;
      const utterance = createUtterance(text, "ja-JP", voice);
      utterance.onerror = () => {
        if (candidates && voiceIndex + 1 < candidates.length) {
          voiceIndex += 1;
          speechSynthesis.cancel();
          speakCurrent();
        }
      };
      speechSynthesis.speak(utterance);
    };
    speakCurrent();
  };

  stopWaiting = waitForVoices(speechSynthesis, start);
}

export function speakSequence(words, enabled = true, onComplete = () => {}) {
  const speechSynthesis = getSpeechSynthesis();
  if (!enabled || !speechSynthesis) return () => {};
  const sequence = buildSpeechSequence(words);
  let cursor = 0;
  let stopped = false;
  let stopWaiting = () => {};
  let voiceWaitFinishedForCursor = false;

  const speakNext = () => {
    if (stopped || cursor >= sequence.length) {
      if (!stopped) onComplete();
      return;
    }
    const item = sequence[cursor];
    const candidates = getVoiceCandidates(item.lang);
    if (candidates && !candidates.length && !voiceWaitFinishedForCursor) {
      stopWaiting = waitForVoices(speechSynthesis, () => {
        voiceWaitFinishedForCursor = true;
        speakNext();
      }, item.lang);
      return;
    }
    if (candidates && !candidates.length) {
      if (item.lang !== "vi-VN") {
        voiceWaitFinishedForCursor = false;
        cursor += 1;
        speakNext();
        return;
      }
      voiceWaitFinishedForCursor = false;
    }
    let voiceIndex = 0;

    const speakCurrent = () => {
      if (stopped) return;
      const voice = candidates?.[voiceIndex] || null;
      const utterance = createUtterance(item.text, item.lang, voice);
      let finished = false;
      const continueSequence = () => {
        if (finished) return;
        finished = true;
        voiceWaitFinishedForCursor = false;
        cursor += 1;
        speakNext();
      };
      utterance.onend = continueSequence;
      utterance.onerror = () => {
        if (finished) return;
        if (candidates && voiceIndex + 1 < candidates.length) {
          finished = true;
          voiceIndex += 1;
          speechSynthesis.cancel();
          speakCurrent();
          return;
        }
        continueSequence();
      };
      speechSynthesis.speak(utterance);
    };

    speakCurrent();
  };

  speechSynthesis.cancel();
  speakNext();
  return () => {
    stopped = true;
    stopWaiting();
    speechSynthesis.cancel();
  };
}
