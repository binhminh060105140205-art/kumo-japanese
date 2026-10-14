export function buildSpeechSequence(words) {
  return words.flatMap(word => [
    word.japanese ? { wordId: word.id, lang: "ja-JP", text: word.japanese } : null,
    word.meaning ? { wordId: word.id, lang: "vi-VN", text: word.meaning } : null
  ]).filter(Boolean);
}

function createUtterance(text, lang) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = lang === "ja-JP" ? 0.84 : 0.9;
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
