export const CheatLookUpHelper = async (
  cheatWord: string | string[],
  letters: any[],
  errorHandler: (title: string, msg: string) => void,
) => {
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

    const data = await response.json();

    if (data.length === 0) {
      const error = new Error(
        `There aren't any results on datamuse for that collection of letters`,
      );
      error.name = "Nothing found";
      throw error;
    }

    const filteredData = data.filter((item: any) => {
      return regex.test(item.word) && item.defs;
    });

    if (filteredData.length === 0) {
      const error = new Error(
        `There are no anagram matches for this lot of letters`,
      );
      error.name = "Nothing found";
      throw error;
    }

    const cheatData = filteredData.map((item: any) => ({
      word: item.word,
      defs: item.defs,
    }));
    return cheatData;
  } catch (error: any) {
    errorHandler(error.name || "Error", error.message || "An error occurred");
    return undefined;
  }
};
