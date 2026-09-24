import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock services
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

jest.mock("./services/GetDefinitionHelper", () => ({
  GetDefinitionHelper: jest.fn(() =>
    Promise.resolve([
      {
        word: "test",
        pos: "noun",
        definitions: [
          { definition: "a procedure intended to establish quality" },
        ],
      },
    ]),
  ),
}));

// Helper to get through welcome screen and enter letters
async function setupLetters(letters = "test") {
  const user = userEvent.setup();
  render(<App />);

  // Dismiss welcome
  await user.click(screen.getByRole("button", { name: /let's go/i }));

  // Enter letters
  const input = screen.getByLabelText("Enter letters (? for unknown)");
  await user.type(input, letters);

  // Submit
  await user.click(screen.getByRole("button", { name: /let's anagrammise/i }));

  // Wait for AnagramDisplay to appear
  await screen.findByText((content) =>
    content.includes("Position any letters"),
  );
}

describe("App Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders welcome text initially", () => {
    render(<App />);
    expect(
      screen.getByText(/Hello, if you need anagram help/i),
    ).toBeInTheDocument();
  });

  test("dismissing welcome shows the input form", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /let's go/i }));

    expect(
      screen.queryByText(/Hello, if you need anagram help/i),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Enter letters (? for unknown)"),
    ).toBeInTheDocument();
  });

  test("entering letters and submitting shows AnagramDisplay", async () => {
    await setupLetters();
    // After setup, AnagramDisplay should be visible (e.g., individual letter buttons)
    expect(
      screen.getByText(/Position any letters.*t, e, s, t/),
    ).toBeInTheDocument();
  });

  test('clicking "Back" in AnagramDisplay resets to input form', async () => {
    const user = userEvent.setup();
    await setupLetters();

    // Click "Back" button
    await user.click(screen.getByRole("button", { name: /back/i }));

    // Should see the input form again
    expect(
      screen.getByLabelText("Enter letters (? for unknown)"),
    ).toBeInTheDocument();
    // AnagramDisplay should be gone
    expect(screen.queryByText(/t, e, s, t/i)).not.toBeInTheDocument();
  });

  test("clicking 'Dict Look Up' shows the dictionary check modal", async () => {
    const user = userEvent.setup();
    await setupLetters();

    // Now FinalAnagram section should appear with a "Let's go" button (the confirm button)
    await user.click(screen.getByRole("button", { name: /let's go/i }));

    // Now click "Dictionary" button
    const dictBtn = screen.getByRole("button", { name: /dictionary/i });
    await user.click(dictBtn);

    // The dictionary check modal should appear
    expect(
      screen.getByLabelText(/enter word to dictionary check/i),
    ).toBeInTheDocument();
  });

  test("dictionary lookup shows results", async () => {
    const user = userEvent.setup();
    await setupLetters();

    // Open final anagram display
    await user.click(screen.getByRole("button", { name: /let's go/i }));

    // Open dictionary modal
    await user.click(screen.getByRole("button", { name: /dictionary/i }));

    // Enter word and submit
    const dictInput = screen.getByLabelText(/enter word to dictionary check/i);
    await user.type(dictInput, "example");
    await user.click(screen.getByRole("button", { name: /check/i }));

    // Wait for results
    await waitFor(() => {
      expect(
        screen.getByText("a procedure intended to establish quality"),
      ).toBeInTheDocument();
    });
    // Dismiss
    await user.click(screen.getByRole("button", { name: /okay/i }));
    expect(
      screen.queryByText("a procedure intended to establish quality"),
    ).not.toBeInTheDocument();
  });

  test("cheat lookup shows results", async () => {
    const user = userEvent.setup();
    await setupLetters();

    await user.click(screen.getByRole("button", { name: /let's go/i }));

    // Click "Cheat" button
    const cheatBtn = screen.getByRole("button", { name: /cheat/i });
    await user.click(cheatBtn);

    // Wait for CheatDataInfiniteScroll to render
    await screen.findByText(/showing 1 of 1 anagram/i);
    expect(screen.getByText("example word heading")).toBeInTheDocument();
    expect(screen.getByText("example definition")).toBeInTheDocument();

    // Dismiss
    await user.click(screen.getByRole("button", { name: /okay/i }));
    expect(
      screen.queryByText(/showing 1 of 1 anagram/i),
    ).not.toBeInTheDocument();
  });

  test("error modal appears when wildcard limit exceeded", async () => {
    const user = userEvent.setup();

    await setupLetters("???????????");

    await user.click(screen.getByRole("button", { name: /let's go/i }));

    await user.click(screen.getByRole("button", { name: /cheat/i }));

    const dialog = await screen.findByRole("dialog");

    expect(dialog).toHaveTextContent(/too many wildcards/i);
  });

  test("mismatched letters trigger error modal", async () => {
    const user = userEvent.setup();
    // Enter letters "abc"
    await setupLetters("abc");

    const inputs = screen.getAllByRole("textbox");

    // Type one letter into each input, in display order
    await user.type(inputs[0], "d");

    await user.click(screen.getByRole("button", { name: /let's go/i }));

    // Error modal should appear
    await screen.findByRole("dialog");
    expect(screen.getByText(/wrong letters/i)).toBeInTheDocument();
  });
});
