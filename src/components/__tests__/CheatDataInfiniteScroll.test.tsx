import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheatDataInfiniteScroll } from "../CheatDataInfiniteScroll";

const mockItem = (
  word: string,
  pos: string | null,
  definitionsCount: number,
) => ({
  word,
  pos: pos ?? "",
  definitions: Array.from({ length: definitionsCount }, (_, i) => ({
    definition: `definition ${i + 1} of ${word}`,
  })),
});

const mockCheatData = Array.from({ length: 25 }, (_, i) =>
  mockItem(`word${i}`, i % 2 === 0 ? "noun" : "verb", i < 10 ? 1 : 3),
);

describe("<CheatDataInfiniteScroll />", () => {
  const onConfirm = jest.fn();

  beforeEach(() => {
    onConfirm.mockClear();
  });

  test("renders modal and overlay", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /showing/i }),
    ).toBeInTheDocument();
  });

  test("shows initial batch of 20 items", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    const items = screen.getAllByText(/definition 1 of word/);
    expect(items).toHaveLength(20);
  });

  test("displays 'More' button when more items are available", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByRole("button", { name: "More" })).toBeInTheDocument();
  });

  test("loads next batch when 'More' is clicked", async () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "More" }));

    const items = screen.getAllByText(/definition 1 of word/);
    expect(items).toHaveLength(25);
  });

  test("hides 'More' button when all items are loaded", async () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "More" }));

    expect(screen.queryByRole("button", { name: "More" })).toBeNull();
  });

  test("does not show 'More' button when data has less than batch size", () => {
    const smallData = Array.from({ length: 5 }, (_, i) =>
      mockItem(`word${i}`, "noun", 1),
    );

    render(
      <CheatDataInfiniteScroll
        cheatData={smallData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.queryByRole("button", { name: "More" })).toBeNull();
    const items = screen.getAllByText(/definition 1 of word/);
    expect(items).toHaveLength(5);
  });

  test("calls onConfirm when 'Okay' button is clicked", async () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Okay" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("calls onConfirm when overlay is clicked", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    // The overlay is the first div with fixed inset-0
    const overlay = document.querySelector(".fixed.inset-0");
    expect(overlay).toBeInTheDocument();
    fireEvent.click(overlay!);

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  test("toggles definition expansion for items with multiple definitions", async () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    // Items with index >= 10 have 3 definitions
    const toggleButton = screen.getAllByText(/Show \d+ more definition/)[0];
    expect(toggleButton).toBeInTheDocument();

    // Initially only 1 definition visible per item
    const defsBefore = screen.queryAllByText(/definition 2 of word/);
    expect(defsBefore).toHaveLength(0); // because only the first def is shown

    // Click to expand
    await userEvent.click(toggleButton);

    // Now all definitions should be visible for that item
    // We can check that "definition 2 of word10" appears (since word10 has 3 defs)
    expect(screen.getByText("definition 2 of word10")).toBeInTheDocument();

    // Click "Show Less"
    const showLessButton = screen.getByText("Show Less");
    await userEvent.click(showLessButton);

    // The extra definition should disappear again
    expect(
      screen.queryByText("definition 2 of word10"),
    ).not.toBeInTheDocument();
  });

  test("does not show toggle button for items with single definition", () => {
    // Words 0-9 have only 1 definition
    render(
      <CheatDataInfiniteScroll
        cheatData={[mockItem("single", "noun", 1)]}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.queryByText(/more definition/)).toBeNull();
    expect(screen.queryByText("Show Less")).toBeNull();
  });

  test("displays part of speech when present", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={[mockItem("test", "noun", 1)]}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/noun/)).toBeInTheDocument();
  });

  test("returns null when cheatData is undefined", () => {
    const { container } = render(
      <CheatDataInfiniteScroll
        cheatData={undefined as any}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  test("renders correctly with empty array", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={[]}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(screen.getByText(/Showing 0 of 0 anagrams?/)).toBeInTheDocument();
    expect(screen.queryByText("More")).toBeNull();
  });

  test("prevents body scroll when mounted and restores on unmount", () => {
    const { unmount } = render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("");
  });

  test("header displays correct count", () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /showing 20 of 25 anagrams/i }),
    ).toBeInTheDocument();
  });
});
