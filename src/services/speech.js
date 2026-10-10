export function speakJapanese(text, enabled = true) {
  if (!enabled || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 0.84;
  window.speechSynthesis.speak(utterance);
}
