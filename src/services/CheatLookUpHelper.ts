import type { DefinitionDetail, DefinitionItem } from "./GetDefinitionHelper";

export const CheatLookUpHelper = async (
  cheatWord: string | string[],
  letters: any[],
  errorHandler: (title: string, msg: string) => void,
): Promise<DefinitionItem[] | undefined> => {
  const cheatWordArray = Array.isArray(cheatWord)
    ? cheatWord
    : cheatWord.split("");

  const pattern = cheatWordArray.map((letter) =>
    !letter || letter === "_" || letter === "?" ? "." : letter,
  );
  const regexPattern = pattern.join("");
  const regex = new RegExp(`^${regexPattern}$`, "i");

  const cleanLetterStrings = letters.map((item) =>
    typeof item === "object" && item !== null ? item.char : item,
  );

  const datamusePrep = "//" + cleanLetterStrings.join("") + "//";

  try {
    const response = await fetch(
      `https://api.datamuse.com/words?sp=${datamusePrep}&max=100&md=d`,
    );

    if (!response.ok) {
      const error = new Error(
        `There is a problem at datamuse (${response.status})`,
      );
      error.name = "Error";
      throw error;
    }

    const rawData = await response.json();

    if (rawData.length === 0) {
      const error = new Error(
        `There aren't any results on datamuse for that collection of letters`,
      );
      error.name = "Nothing found";
      throw error;
    }

    const filteredData = rawData.filter((item: any) => {
      return regex.test(item.word) && item.defs && item.defs.length > 0;
    });

    if (filteredData.length === 0) {
      const error = new Error(
        `There are no anagram matches for this lot of letters`,
      );
      error.name = "Nothing found";
      throw error;
    }

    // Define POS mapping
    const posMap: Record<string, string> = {
      n: "Noun",
      v: "Verb",
      adj: "Adjective",
      adv: "Adverb",
    };

    // Group definitions by word and POS (each word has its own definitions)
    const wordDefinitionsMap: Map<
      string,
      Record<string, DefinitionDetail[]>
    > = new Map();

    for (const item of filteredData) {
      // Safety check: Ensure defs is an array
      if (!item.defs || !Array.isArray(item.defs)) continue;

      // Initialize word entry if not exists
      if (!wordDefinitionsMap.has(item.word)) {
        wordDefinitionsMap.set(item.word, {});
      }

      const wordDefs = wordDefinitionsMap.get(item.word) || {};

      for (const rawDef of item.defs) {
        const [rawPos, defText] = rawDef.split("\t");

        if (!rawPos || !defText) continue;

        const pos = posMap[rawPos] || "Other";

        // Initialize POS for this word if not exists
        if (!wordDefs[pos]) {
          wordDefs[pos] = [];
        }

        // Cap at 10 definitions per category per word
        if (wordDefs[pos].length < 10) {
          const formattedDef =
            defText.charAt(0).toUpperCase() + defText.slice(1);
          wordDefs[pos].push({ definition: formattedDef });
        }
      }
    }

    // Convert map to the final DefinitionItem[] structure
    const result: DefinitionItem[] = [];

    for (const [word, posDefs] of wordDefinitionsMap.entries()) {
      for (const [pos, definitions] of Object.entries(posDefs)) {
        result.push({
          pos,
          word,
          definitions,
        });
      }
    }

    // Sort results by word for consistent display
    result.sort((a, b) => a.word.localeCompare(b.word));

    return result;
  } catch (error: any) {
    errorHandler(error.name || "Error", error.message || "An error occurred");
    return undefined;
  }
};
