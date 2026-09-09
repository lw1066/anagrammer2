import { GetDefinitionHelper } from "../GetDefinitionHelper";

let originalFetch: typeof globalThis.fetch;
let mockFetch: jest.Mock;

beforeAll(() => {
  originalFetch = globalThis.fetch;
  mockFetch = jest.fn();
  globalThis.fetch = mockFetch;
});

afterAll(() => {
  globalThis.fetch = originalFetch;
});

beforeEach(() => {
  mockFetch.mockClear();
});

describe("GetDefinitionHelper", () => {
  it("returns grouped definitions for a valid word", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          word: "test",
          score: 100,
          defs: [
            "n\tA procedure intended to establish the quality, performance, or reliability of something.",
            "v\tTo take measures to check the quality, performance, or reliability of something.",
          ],
        },
      ],
    } as Response);

    const result = await GetDefinitionHelper("test");
    expect(result).toEqual([
      {
        pos: "Noun",
        word: "test",
        definitions: [
          {
            definition:
              "A procedure intended to establish the quality, performance, or reliability of something.",
          },
        ],
      },
      {
        pos: "Verb",
        word: "test",
        definitions: [
          {
            definition:
              "To take measures to check the quality, performance, or reliability of something.",
          },
        ],
      },
    ]);
  });

  it("throws when no definitions are returned", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    await expect(GetDefinitionHelper("xyz")).rejects.toThrow(
      'No definition found for "xyz"',
    );
  });

  it("throws when the word does not match exactly (ignoring case)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          word: "tested",
          score: 100,
          defs: ["v\tPast tense of test."],
        },
      ],
    } as Response);

    await expect(GetDefinitionHelper("test")).rejects.toThrow(
      'No exact definition found for "test"',
    );
  });

  it("throws on network failure (non-ok response)", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
    } as Response);

    await expect(GetDefinitionHelper("test")).rejects.toThrow(
      'Failed to fetch definition for "test"',
    );
  });

  it("limits definitions per part of speech to 10", async () => {
    const manyDefs = Array.from(
      { length: 12 },
      (_, i) => `n\tDefinition ${i + 1}`,
    );
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [{ word: "test", score: 100, defs: manyDefs }],
    } as Response);

    const result = await GetDefinitionHelper("test");
    expect(result[0].definitions).toHaveLength(10);
  });

  it('handles unknown POS tags gracefully (falls back to "Other")', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { word: "test", score: 100, defs: ["x\tUnknown part of speech."] },
      ],
    } as Response);

    const result = await GetDefinitionHelper("test");
    expect(result[0]).toEqual({
      pos: "Other",
      word: "test",
      definitions: [{ definition: "Unknown part of speech." }],
    });
  });
});
