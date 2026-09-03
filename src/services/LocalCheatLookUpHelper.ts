import localDictionaryData from '../assets/wordsByLength.json';
import { GetDefinitionHelper } from './GetDefinitionHelper';

const HasSameLetters = (word: string, sortedCheatWord: string) => {
  const wordLetters = word.toLowerCase().split('').sort().join('');
  const sortedLetters = sortedCheatWord.toLowerCase();
  return wordLetters === sortedLetters;
};

export const LocalCheatLookUpHelper = async (
  cheatWord: string | string[],
  letters: string[],
  errorHandler: (title: string, msg: string) => void
) => {
  const sortedCheatWord = [...letters].sort().join('');
  const cheatWordArray = Array.isArray(cheatWord) ? cheatWord : cheatWord.split('');
  const pattern = cheatWordArray.map((letter) => (!letter || letter === '_' || letter === '?' ? '.' : letter));
  const regexPattern = pattern.join('');
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  
  const wordLength = letters.length;
  // @ts-ignore - The JSON might not be strongly typed to have numbers as keys
  const wordArray: string[] = localDictionaryData[wordLength] || [];
  const cheatData: { word: string; defs: string[] }[] = [];

  for (const word of wordArray) {
    if (regex.test(word) && HasSameLetters(word, sortedCheatWord)) {
      try {
        const definitionsData = await GetDefinitionHelper(word, () => {}); // Mute individual errors
        let definitions = ['No definitions found'];

        if (definitionsData && Array.isArray(definitionsData)) {
          definitions = definitionsData.flatMap((item: any) =>
            item.definitions.map((defItem: any) => defItem.definition)
          );
        }

        cheatData.push({ word, defs: definitions });
      } catch (error: any) {
        // Just log the error and continue, no need to alert user for every missing word
        console.error(`Error processing word '${word}': ${error.message}`);
        cheatData.push({ word, defs: ['No definitions found'] });
      }
    }
  }

  if (cheatData.length === 0) {
    errorHandler('Nothing found', 'No local matches found for those letters.');
    return undefined;
  }

  return cheatData;
};

