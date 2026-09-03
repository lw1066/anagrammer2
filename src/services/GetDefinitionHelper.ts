// src/services/GetDefinitionHelper.ts

// 1. TYPE DEFINITIONS
// Represents the actual shape that Datamuse sends back
interface DatamuseWordResponse {
  word: string;
  score: number;
  defs?: string[]; // e.g., ["adj\tof great size", "n\ta principal player"]
}

export interface DefinitionDetail {
  definition: string;
}

// The exact model signature your UI expects
export interface DefinitionItem {
  pos: string; // Outputs: "Noun", "Noun 2", "Adjective 4", etc.
  definitions: DefinitionDetail[];
  word: string;
}

const posMap: Record<string, string> = {
  n: "Noun",
  v: "Verb",
  adj: "Adjective",
  adv: "Adverb",
};

// 2. THE HELPER FUNCTION
export async function GetDefinitionHelper(
  searchTerm: string,
): Promise<DefinitionItem[]> {
  try {
    // API endpoint with parameters for definitions mapping
    const url = `https://api.datamuse.com/words?sp=${encodeURIComponent(searchTerm.toLowerCase())}&max=1&md=d`;

    const response = await fetch(url);

    const contentType = response.headers.get("content-type");
    if (
      !response.ok ||
      (contentType && !contentType.includes("application/json"))
    ) {
      if (
        response.status === 404 ||
        (contentType && contentType.includes("text/html"))
      ) {
        const error = new Error(`Soz - nothing found for ${searchTerm}`);
        (error as any).status = 404;
        throw error;
      }
      const errorBody = await response.text();
      throw new Error(`Request failed: ${response.status} ${errorBody}`);
    }

    // 4. GET DATA (Correctly assigned to the Datamuse array schema)
    const rawData: DatamuseWordResponse[] = await response.json();

    // 5. FORMAT DATA
    // Reject immediately if Datamuse sends an empty response array or has no definitions field
    if (
      rawData.length === 0 ||
      !rawData[0].defs ||
      rawData[0].defs.length === 0
    ) {
      const error = new Error(`Soz - nothing found for ${searchTerm}`);
      (error as any).status = 404;
      throw error;
    }

    const targetItem = rawData[0];

    if (targetItem.word.toLowerCase() !== searchTerm.trim().toLowerCase()) {
      const error = new Error(
        `Soz - nothing found for exact spelling: "${searchTerm}"`,
      );
      (error as any).status = 404;
      throw error;
    }

    const rawDefs = targetItem.defs;

    const result: DefinitionItem[] = [];
    const posCounts: Record<string, number> = {};

    for (const rawDef of rawDefs) {
      // Datamuse string payload uses tab boundaries (\t) between POS codes and text strings
      const parts = rawDef.split("\t");
      if (parts.length < 2) continue;

      const rawPos = parts[0];
      const defText = parts[1];
      const basePos = posMap[rawPos] || "Other";

      if (!posCounts[basePos]) {
        posCounts[basePos] = 0;
      }

      // Enforce your strict cap: skip processing after 5 items per category type
      if (posCounts[basePos] >= 5) continue;

      posCounts[basePos]++;
      const currentCount = posCounts[basePos];

      // Format label cleanly: keep 1st index empty ("Noun"), number subsequent indices ("Noun 2")
      const finalPosLabel =
        currentCount === 1 ? basePos : `${basePos} ${currentCount}`;

      result.push({
        pos: finalPosLabel,
        word: targetItem.word,
        definitions: [
          {
            definition: defText.charAt(0).toUpperCase() + defText.slice(1), // Capitalise output string
          },
        ],
      });
    }

    console.log("Structured Result Payload for UI:", result);
    return result;
  } catch (error) {
    console.error("Error in GetDefinitionHelper:", error);
    throw error;
  }
}
