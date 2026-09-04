interface DatamuseWordResponse {
  word: string;
  score: number;
  defs?: string[];
}

export interface DefinitionDetail {
  definition: string;
}

export interface DefinitionItem {
  pos: string;
  definitions: DefinitionDetail[];
  word: string;
}

const posMap: Record<string, string> = {
  n: "Noun",
  v: "Verb",
  adj: "Adjective",
  adv: "Adverb",
};

export async function GetDefinitionHelper(
  searchTerm: string,
): Promise<DefinitionItem[]> {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(normalizedSearch)}&max=1&md=d`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch definition for "${searchTerm}"`);
  }

  const data: DatamuseWordResponse[] = await response.json();

  if (!data.length || !data[0].defs || data[0].defs.length === 0) {
    throw new Error(`No definition found for "${searchTerm}"`);
  }

  const targetWord = data[0].word;
  const targetDefs = data[0].defs;

  if (targetWord.toLowerCase() !== normalizedSearch) {
    throw new Error(`No exact definition found for "${searchTerm}"`);
  }
  const groupedDefs: Record<string, DefinitionDetail[]> = {};

  for (const rawDef of targetDefs) {
    const [rawPos, defText] = rawDef.split("\t");
    if (!rawPos || !defText) continue;
    const pos = posMap[rawPos] || "Other";

    if (!groupedDefs[pos]) {
      groupedDefs[pos] = [];
    }

    if (groupedDefs[pos].length < 10) {
      const formattedDef = defText.charAt(0).toUpperCase() + defText.slice(1);
      groupedDefs[pos].push({ definition: formattedDef });
    }
  }

  return Object.entries(groupedDefs).map(([pos, definitions]) => ({
    pos,
    word: targetWord,
    definitions,
  }));
}
