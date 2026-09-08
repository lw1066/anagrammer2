// src/components/__tests__/CheatDataInfiniteScroll.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CheatDataInfiniteScroll } from "../CheatDataInfiniteScroll";

const mockCheatData = Array.from({ length: 25 }, (_, i) => ({
  word: `word${i}`,
  pos: "noun",
  definitions: [
    { definition: `definition 1 of word${i}` },
    { definition: `definition 2 of word${i}` },
  ],
}));

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

  test("shows the 'More' button and loads next batch when clicked", async () => {
    render(
      <CheatDataInfiniteScroll
        cheatData={mockCheatData}
        letters={["w"]}
        onConfirm={onConfirm}
      />,
    );

    const itemsInitially = screen.getAllByText(/definition 1 of word/);
    expect(itemsInitially.length).toBe(20);

    const moreBtn = screen.getByRole("button", { name: "More" });
    expect(moreBtn).toBeInTheDocument();

    await userEvent.click(moreBtn);

    const itemsAfter = screen.getAllByText(/definition 1 of word/);
    expect(itemsAfter.length).toBe(25);

    expect(screen.queryByRole("button", { name: "more" })).toBeNull();
  });
});
