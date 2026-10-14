const femaleVoiceHints = /female|woman|girl|kyoko|haruka|nanami|sayaka|aoi|yuna|hoai ?my|hoài ?my|linh|mai|google.*(日本語|japanese|tiếng việt|vietnamese)|microsoft.*(nanami|hoai ?my|an)/i;

export function buildSpeechSequence(words) {
  return words.flatMap(word => [
    word.japanese ? { wordId: word.id, lang: "ja-JP", text: word.japanese } : null,
    word.meaning ? { wordId: word.id, lang: "vi-VN", text: word.meaning } : null
  ]).filter(Boolean);
}

function scoreVoice(voice) {
  const name = voice.name || "";
  let score = 0;
  if (femaleVoiceHints.test(name)) score += 20;
  if (/nanami|kyoko|haruka|hoai ?my|google.*(日本語|tiếng việt|vietnamese)/i.test(name)) score += 15;
  if (/male|man|ichiro|otoya|nam ?minh/i.test(name)) score -= 30;
  return score;
}

function getPreferredVoice(lang) {
  if (!("speechSynthesis" in window) || typeof window.speechSynthesis.getVoices !== "function") return null;
  const languagePrefix = lang.slice(0, 2).toLowerCase();
  const voices = window.speechSynthesis.getVoices().filter(voice => voice.lang?.toLowerCase().startsWith(languagePrefix));
  return [...voices].sort((first, second) => scoreVoice(second) - scoreVoice(first))[0] || null;
}

function createUtterance(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang === "ja-JP" ? 0.84 : 0.9;
  utterance.pitch = 1.12;
  const voice = getPreferredVoice(lang);
  if (voice) utterance.voice = voice;
  return utterance;
}

export function speakJapanese(text, enabled = true) {
  if (!enabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(createUtterance(text, "ja-JP"));
}

export function speakSequence(words, enabled = true, onComplete = () => {}) {
  if (!enabled || !("speechSynthesis" in window)) return () => {};
  const sequence = buildSpeechSequence(words);
  let cursor = 0;
  let stopped = false;

  const speakNext = () => {
    if (stopped || cursor >= sequence.length) {
      if (!stopped) onComplete();
      return;
    }
    const item = sequence[cursor];
    const utterance = createUtterance(item.text, item.lang);
    const continueSequence = () => {
      cursor += 1;
      speakNext();
    };
    utterance.onend = continueSequence;
    utterance.onerror = continueSequence;
    window.speechSynthesis.speak(utterance);
  };

  window.speechSynthesis.cancel();
  speakNext();
  return () => {
    stopped = true;
    window.speechSynthesis.cancel();
  };
}
