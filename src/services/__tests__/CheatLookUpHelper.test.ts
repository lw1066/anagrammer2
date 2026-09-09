import { CheatLookUpHelper } from "../CheatLookUpHelper";

const mockFetch = (data: any) => {
  globalThis.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => data,
  });
};

describe("CheatLookUpHelper", () => {
  const mockErrorHandler = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns filtered definitions grouped by word and POS", async () => {
    mockFetch([
      { word: "hello", defs: ["n\tA greeting", "v\tTo greet"] },
      { word: "holle", defs: ["n\tA misspelling"] },
    ]);

    const result = await CheatLookUpHelper(
      "h?ll?",
      [
        { char: "h" },
        { char: "e" },
        { char: "l" },
        { char: "l" },
        { char: "o" },
      ],
      mockErrorHandler,
    );

    expect(result).toEqual([
      {
        word: "hello",
        pos: "Noun",
        definitions: [{ definition: "A greeting" }],
      },
      { word: "hello", pos: "Verb", definitions: [{ definition: "To greet" }] },
      {
        word: "holle",
        pos: "Noun",
        definitions: [{ definition: "A misspelling" }],
      },
    ]);
  });

  it("calls errorHandler when datamuse returns empty", async () => {
    mockFetch([]);

    await CheatLookUpHelper("test", ["t", "e", "s", "t"], mockErrorHandler);

    expect(mockErrorHandler).toHaveBeenCalledWith(
      "Nothing found",
      expect.stringContaining("There aren't any results"),
    );
  });

  it("calls errorHandler on network failure", async () => {
    globalThis.fetch = jest.fn().mockRejectedValue(new Error("Network error"));

    await CheatLookUpHelper("test", ["t", "e", "s", "t"], mockErrorHandler);

    expect(mockErrorHandler).toHaveBeenCalledWith("Error", "Network error");
  });
});
