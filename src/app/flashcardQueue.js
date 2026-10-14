function shuffle(items, random = Math.random) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

export class FlashcardQueue {
  constructor(words, random = Math.random) {
    this.random = random;
    this.items = shuffle(words, random);
    this.retryItems = [];
    this.roundTotal = this.items.length;
    this.roundIndex = 0;
    this.completed = this.items.length === 0;
  }

  current() {
    return this.items[0];
  }

  review(result, expectedWordId) {
    if (this.completed) return null;
    const word = this.current();
    if (!word || (expectedWordId !== undefined && word.id !== expectedWordId)) return null;

    this.items = this.items.slice(1);
    if (result === "again") this.retryItems.push(word);
    if (this.items.length === 0) {
      this.items = shuffle(this.retryItems, this.random);
      this.retryItems = [];
      this.roundTotal = this.items.length;
      this.roundIndex = 0;
      this.completed = this.items.length === 0;
    } else {
      this.roundIndex += 1;
    }
    return { word, completed: this.completed };
  }

  get length() {
    return this.items.length;
  }
}
