import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinalAnagram } from "../FinalAnagram";

// Mock the Button component if it has complex styles; otherwise use the real one
// For minimal testing, the actual Button should work fine.

describe("FinalAnagram", () => {
  const defaultProps = {
    anaLetters: {
      unordered: ["a", "b", "c"],
      ld: ["a", "b", "c"],
    },
    dictLookUp: jest.fn(),
    cheatLookUp: jest.fn(),
    resetAnaLetters: jest.fn(),
    letters: ["a", "b", "c"],
  };

  it("renders the letter tiles and current anagram sequence", () => {
    render(<FinalAnagram {...defaultProps} />);
    // Each letter tile should be visible
    defaultProps.anaLetters.ld.forEach((letter) => {
      expect(screen.getByText(letter)).toBeInTheDocument();
    });
    // The joined sequence is in lower case - tailwind changes display to uppercase
    const sequence = screen.getByLabelText("Current anagram").textContent;
    expect(sequence).toBe("abc");
  });

  it("renders all four buttons", () => {
    render(<FinalAnagram {...defaultProps} />);
    expect(screen.getByRole("button", { name: /mix/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /dictionary/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cheat!/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("calls dictLookUp when Dictionary button is clicked", async () => {
    const dictLookUp = jest.fn();
    render(<FinalAnagram {...defaultProps} dictLookUp={dictLookUp} />);
    await userEvent.click(screen.getByRole("button", { name: /dictionary/i }));
    expect(dictLookUp).toHaveBeenCalledTimes(1);
  });

  it("calls cheatLookUp with correct arguments when Cheat! button is clicked", async () => {
    const cheatLookUp = jest.fn();
    render(
      <FinalAnagram
        {...defaultProps}
        cheatLookUp={cheatLookUp}
        letters="abc"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: /cheat!/i }));
    expect(cheatLookUp).toHaveBeenCalledWith(["a", "b", "c"], ["a", "b", "c"]);
  });

  it("calls resetAnaLetters when Back button is clicked", async () => {
    const resetAnaLetters = jest.fn();
    render(
      <FinalAnagram {...defaultProps} resetAnaLetters={resetAnaLetters} />,
    );
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(resetAnaLetters).toHaveBeenCalledTimes(1);
  });

  it("shuffles the letters when Mix button is clicked", async () => {
    const user = userEvent.setup();

    render(<FinalAnagram {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /mix/i }));

    const newSequence = screen.getByLabelText("Current anagram").textContent;

    expect(newSequence).toBeDefined();
    expect([...newSequence!].sort()).toEqual(["a", "b", "c"]);
  });
});
