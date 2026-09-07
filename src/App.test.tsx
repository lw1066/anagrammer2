import { render, screen, fireEvent, act } from "@testing-library/react";
import App from "./App";

jest.mock("./services/CheatLookUpHelper", () => ({
  CheatLookUpHelper: jest.fn(() =>
    Promise.resolve([
      {
        word: "example word heading",
        pos: "noun",
        definitions: [{ definition: "example definition" }],
      },
    ]),
  ),
}));

describe("App Component", () => {
  test("renders welcome text initially", () => {
    render(<App />);
    expect(
      screen.getByText(/Hello, if you need anagram help/i),
    ).toBeInTheDocument();
  });

  test('"Let\'s Go" button hides welcome text and shows AnagrammerInput', () => {
    render(<App />);
    const letsGoButton = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton);

    expect(
      screen.queryByText(/Hello, if you need anagram help/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Enter letters (? for unknown)"),
    ).toBeInTheDocument();
  });

  test("Entering letters in AnagrammerInput updates state and shows AnagramDisplay", () => {
    render(<App />);
    const letsGoButton = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton);

    const inputField = screen.getByLabelText("Enter letters (? for unknown)");
    fireEvent.change(inputField, { target: { value: "example" } });

    const letsAnagrammiseButton = screen.getByRole("button", {
      name: /let's anagrammise/i,
    });
    fireEvent.click(letsAnagrammiseButton);

    expect(screen.getByText(/e, x, a, m, p, l, e/i)).toBeInTheDocument();
  });

  test('Clicking "Reset Anagram" clears state and shows AnagrammerInput', () => {
    render(<App />);
    const letsGoButton = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton);

    const inputField = screen.getByLabelText("Enter letters (? for unknown)");
    fireEvent.change(inputField, { target: { value: "example" } });

    const letsAnagrammiseButton = screen.getByRole("button", {
      name: /let's anagrammise/i,
    });
    fireEvent.click(letsAnagrammiseButton);

    const resetAnagramButton = screen.getByRole("button", {
      name: /back/i,
    });
    fireEvent.click(resetAnagramButton);

    expect(
      screen.getByLabelText("Enter letters (? for unknown)"),
    ).toBeInTheDocument();
  });

  test('Clicking "Dict Look Up" shows DictionaryCheck component', () => {
    render(<App />);
    const letsGoButton = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton);
    const inputField = screen.getByLabelText("Enter letters (? for unknown)");
    fireEvent.change(inputField, { target: { value: "example" } });

    const letsAnagrammiseButton = screen.getByRole("button", {
      name: /let's anagrammise/i,
    });
    fireEvent.click(letsAnagrammiseButton);

    const letsGoButton2 = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton2);

    const dictLookUpButton = screen.getByRole("button", {
      name: /dictionary/i,
    });
    fireEvent.click(dictLookUpButton);

    expect(
      screen.getByLabelText(/enter word to dictionary check/i),
    ).toBeInTheDocument();
  });

  test('Clicking "Cheat Look Up" shows CheatDataInfiniteScroll component', async () => {
    render(<App />);
    const letsGoButton = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton);
    const inputField = screen.getByLabelText("Enter letters (? for unknown)");
    fireEvent.change(inputField, { target: { value: "example" } });

    const letsAnagrammiseButton = screen.getByRole("button", {
      name: /let's anagrammise/i,
    });
    fireEvent.click(letsAnagrammiseButton);

    const letsGoButton2 = screen.getByRole("button", {
      name: /Let's go/i,
    });
    fireEvent.click(letsGoButton2);

    const cheatLookUpButton = screen.getByRole("button", { name: /cheat/i });
    await act(async () => {
      fireEvent.click(cheatLookUpButton);
    });

    expect(
      await screen.findByText(/showing 1 of 1 anagram/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/example word heading/i)).toBeInTheDocument();
    expect(screen.getByText(/example definition/i)).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /okay/i })).toBeInTheDocument();
  });
});
