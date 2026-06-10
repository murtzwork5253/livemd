export interface DiffWord {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  text: string;
  words?: DiffWord[];
}

/**
 * Computes a word-by-word diff comparison between two lines.
 */
export function computeWordDiff(oldLine: string, newLine: string): DiffWord[] {
  // Split by words, punctuation, and spaces
  const regex = /([^\s\w]+|\w+|\s+)/g;
  const oldWords = oldLine.match(regex) || [];
  const newWords = newLine.match(regex) || [];
  const wordDiff: DiffWord[] = [];

  let o = 0;
  let n = 0;
  const lookAheadLimit = 5;

  while (o < oldWords.length || n < newWords.length) {
    if (o < oldWords.length && n < newWords.length) {
      if (oldWords[o] === newWords[n]) {
        wordDiff.push({ type: 'unchanged', text: oldWords[o] });
        o++;
        n++;
      } else {
        let foundMatch = false;

        for (let i = 1; i <= lookAheadLimit; i++) {
          // Check for word additions
          if (n + i < newWords.length && oldWords[o] === newWords[n + i]) {
            for (let j = 0; j < i; j++) {
              wordDiff.push({ type: 'added', text: newWords[n + j] });
            }
            n += i;
            foundMatch = true;
            break;
          }
          // Check for word deletions
          if (o + i < oldWords.length && oldWords[o + i] === newWords[n]) {
            for (let j = 0; j < i; j++) {
              wordDiff.push({ type: 'removed', text: oldWords[o + j] });
            }
            o += i;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          wordDiff.push({ type: 'removed', text: oldWords[o] });
          wordDiff.push({ type: 'added', text: newWords[n] });
          o++;
          n++;
        }
      }
    } else if (o < oldWords.length) {
      wordDiff.push({ type: 'removed', text: oldWords[o] });
      o++;
    } else {
      wordDiff.push({ type: 'added', text: newWords[n] });
      n++;
    }
  }

  return wordDiff;
}

/**
 * Computes a line-by-line diff comparison between two strings.
 * Highlights line additions, removals, and unchanged segments.
 * Uses a lookahead window to match insertions and deletions.
 */
export function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const diff: DiffLine[] = [];

  let o = 0;
  let n = 0;
  const lookAheadLimit = 5;

  while (o < oldLines.length || n < newLines.length) {
    if (o < oldLines.length && n < newLines.length) {
      if (oldLines[o] === newLines[n]) {
        diff.push({ type: 'unchanged', text: oldLines[o] });
        o++;
        n++;
      } else {
        // Look ahead to find matches
        let foundMatch = false;

        for (let i = 1; i <= lookAheadLimit; i++) {
          // Check for line additions in newText (insertion lookahead)
          if (n + i < newLines.length && oldLines[o] === newLines[n + i]) {
            for (let j = 0; j < i; j++) {
              diff.push({ type: 'added', text: newLines[n + j] });
            }
            n += i;
            foundMatch = true;
            break;
          }
          // Check for line deletions in oldText (removal lookahead)
          if (o + i < oldLines.length && oldLines[o + i] === newLines[n]) {
            for (let j = 0; j < i; j++) {
              diff.push({ type: 'removed', text: oldLines[o + j] });
            }
            o += i;
            foundMatch = true;
            break;
          }
        }

        if (!foundMatch) {
          // If no matches found in window, replace/modify old line with new line
          const words = computeWordDiff(oldLines[o], newLines[n]);
          diff.push({
            type: 'modified',
            text: newLines[n],
            words,
          });
          o++;
          n++;
        }
      }
    } else if (o < oldLines.length) {
      diff.push({ type: 'removed', text: oldLines[o] });
      o++;
    } else {
      diff.push({ type: 'added', text: newLines[n] });
      n++;
    }
  }

  return diff;
}
