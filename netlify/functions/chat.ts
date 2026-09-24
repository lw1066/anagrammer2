import type { Handler } from "@netlify/functions";
import { CheatLookUpHelper } from "../../src/services/CheatLookUpHelper";
import { DefinitionItem } from "../../src/services/GetDefinitionHelper";

interface Message {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
}

interface ToolCall {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
}

interface GroqResponse {
  choices: {
    message: {
      role: "assistant";
      content: string | null;
      tool_calls?: ToolCall[];
    };
  }[];
}

const SYSTEM_PROMPT = `
You are a concise, friendly anagram assistant. When asked to find anagrams: 1. Extract availableLetters exactly from the user's letters. 2. If no answer positions have been provided, ask for them and stop. 3. Convert any position information into letterPositions, then call cheatLookUp. Position information may be given as a pattern or natural language. Interpret known letters and positions, including phrases such as "e at position 2", "second letter is e", or "**e** is second". Use '_' for unknown positions and never use '?' in letterPositions. Keep availableLetters and letterPositions separate. Never move or reorder letters between them. If the user explicitly says there are no known positions, use '_' for every position. After results, give the total and part-of-speech counts using simple lines, not a table. Ask if the user wants one part of speech only. `;
const tools = [
  {
    type: "function",
    function: {
      name: "cheatLookUp",
      description:
        "Find anagrams from the complete letter pool and known answer positions. " +
        "Call only when both are known. " +
        "Preserve every character in availableLetters; '?' = one unknown letter. " +
        "letterPositions gives answer positions; '_' = unknown. " +
        "Keep availableLetters and letterPositions separate.",
      parameters: {
        type: "object",
        properties: {
          availableLetters: {
            type: "array",
            items: {
              type: "string",
              pattern: "^[A-Za-z?]$",
            },
            description:
              "Complete letter pool. Preserve every character. '?' represents exactly one unknown letter.",
          },
          letterPositions: {
            type: "array",
            items: {
              type: "string",
              pattern: "^[A-Za-z_]$",
            },
            description:
              "Answer positions. Use known letters and '_' for unknown positions.",
          },
        },
        required: ["availableLetters", "letterPositions"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "resetAnagram",
      description:
        "Reset the current anagram when the user clearly asks to start a new anagram, reset, or start again.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
];

const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method not allowed",
      }),
    };
  }

  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "No request body provided",
        }),
      };
    }

    const { messages } = JSON.parse(event.body);

    if (!Array.isArray(messages)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "messages must be an array",
        }),
      };
    }

    // Only send the most recent messages to reduce token usage.
    const recentMessages = messages.slice(-4);

    const groqMessages: Message[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...recentMessages.map((message: Message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    // Keep the full results for the app UI.
    let cheatResultsForApp: DefinitionItem[] = [];

    let availableLettersForApp: string[] = [];
    let letterPositionsForApp: string[] = [];

    // First request: allow the AI to decide whether to use the tool.
    const firstResponse = await callGroq(groqMessages, true);
    const assistantMessage = firstResponse.choices?.[0]?.message;

    if (!assistantMessage) {
      console.error("Groq returned no assistant message:", firstResponse);

      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "The AI did not return a response.",
        }),
      };
    }

    // No tool call - return the normal AI response.
    if (
      !assistantMessage.tool_calls ||
      assistantMessage.tool_calls.length === 0
    ) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: assistantMessage.content ?? "",
        }),
      };
    }

    // Preserve the assistant's tool call message.
    groqMessages.push({
      role: "assistant",
      content: assistantMessage.content ?? "",
      tool_calls: assistantMessage.tool_calls,
    } as Message & { tool_calls: ToolCall[] });

    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.function.name === "resetAnagram") {
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: "Starting a new anagram.",
            reset: true,
          }),
        };
      }

      if (toolCall.function.name !== "cheatLookUp") {
        continue;
      }

      let argumentsObject: {
        availableLetters?: unknown;
        letterPositions?: unknown;
      };

      try {
        argumentsObject = JSON.parse(toolCall.function.arguments);
      } catch (error) {
        console.error(
          "Could not parse tool arguments:",
          toolCall.function.arguments,
          error,
        );

        groqMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "The tool arguments could not be understood.",
          }),
        });

        continue;
      }

      const { availableLetters, letterPositions } = argumentsObject;

      if (
        !Array.isArray(availableLetters) ||
        !availableLetters.every((letter) => typeof letter === "string")
      ) {
        groqMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "availableLetters must be an array of strings.",
          }),
        });

        continue;
      }

      if (
        !Array.isArray(letterPositions) ||
        !letterPositions.every((letter) => typeof letter === "string")
      ) {
        groqMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: "letterPositions must be an array of strings.",
          }),
        });

        continue;
      }

      availableLettersForApp = availableLetters.map((letter) =>
        letter.toLowerCase(),
      );

      letterPositionsForApp = letterPositions.map((letter) =>
        letter.toLowerCase(),
      );

      const cheatResults = await CheatLookUpHelper(
        letterPositionsForApp,
        availableLettersForApp,
        (title, msg) => {
          console.error(`CheatLookUpHelper error - ${title}: ${msg}`);
        },
      );

      // Full results are kept for the app.
      cheatResultsForApp = cheatResults ?? [];

      const posCounts = (cheatResults ?? []).reduce(
        (counts, result) => {
          if (result.pos === "Noun") counts.noun++;
          if (result.pos === "Verb") counts.verb++;
          if (result.pos === "Adjective") counts.adjective++;
          if (result.pos === "Adverb") counts.adverb++;

          return counts;
        },
        {
          noun: 0,
          verb: 0,
          adjective: 0,
          adverb: 0,
        },
      );

      const toolContent =
        cheatResults && cheatResults.length > 0
          ? {
              totalFound: cheatResults?.length,
              posCounts,
              message:
                "Tell the user how many anagrams were found and give the part-of-speech counts. " +
                "Ask whether they want to display only one part of speech. " +
                "The full list is displayed in the app.",
            }
          : {
              words: [],
              message: "No matching anagrams were found.",
            };

      groqMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolContent),
      });
    }

    // Second request: no tools are needed here.
    const finalResponse = await callGroq(groqMessages, false);
    const finalMessage = finalResponse.choices?.[0]?.message;

    if (!finalMessage) {
      console.error("Groq returned no final message:", finalResponse);

      return {
        statusCode: 502,
        body: JSON.stringify({
          error: "The AI did not return a final response.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: finalMessage.content ?? "",
        cheatResults: cheatResultsForApp,
        availableLetters: availableLettersForApp,
        letterPositions: letterPositionsForApp,
      }),
    };
  } catch (error) {
    console.error("Chat function error:", error);

    if (error instanceof Error && error.message === "GROQ_429") {
      return {
        statusCode: 429,
        body: JSON.stringify({
          error: "The AI assistant is temporarily rate limited.",
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong while processing your request.",
      }),
    };
  }
};

async function callGroq(
  messages: Message[],
  includeTools: boolean,
): Promise<GroqResponse> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const requestBody: Record<string, unknown> = {
    model: "openai/gpt-oss-20b",
    messages,
    temperature: 0.2,
    max_tokens: includeTools ? 300 : 200,
  };

  if (includeTools) {
    requestBody.tools = tools;
    requestBody.tool_choice = "auto";
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Groq API error:", response.status, errorText);

    if (response.status === 429) {
      throw new Error("GROQ_429");
    }

    throw new Error(`Groq API returned ${response.status}`);
  }

  return (await response.json()) as GroqResponse;
}

export { handler };
