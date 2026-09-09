import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnagramDisplay } from "../AnagramDisplay";

describe("AnagramDisplay", () => {
  const letters = ["a", "b", "c"];

  const renderComponent = (overrides = {}) => {
    const onLetterSubmit = jest.fn();
    const onError = jest.fn();
    const handleResetAnagram = jest.fn();

    render(
      <AnagramDisplay
        letters={letters}
        handleResetAnagram={handleResetAnagram}
        onError={onError}
        onLetterSubmit={onLetterSubmit}
        {...overrides}
      />,
    );

    return { onLetterSubmit, onError, handleResetAnagram };
  };

  it("renders one input per letter", () => {
    renderComponent();

    expect(screen.getAllByRole("textbox")).toHaveLength(letters.length);
  });

  it("accepts valid letters and submits them in the entered order", async () => {
    const user = userEvent.setup();
    const { onLetterSubmit, onError } = renderComponent();

    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "c");
    await user.type(inputs[1], "a");
    await user.type(inputs[2], "b");

    await user.click(screen.getByRole("button", { name: /let's go/i }));

    expect(onLetterSubmit).toHaveBeenCalledWith(["c", "a", "b"]);
    expect(onError).not.toHaveBeenCalled();
  });

  it("rejects wildcard '?' letters", async () => {
    const user = userEvent.setup();
    const { onError } = renderComponent();

    await user.type(screen.getAllByRole("textbox")[0], "?");

    expect(onError).toHaveBeenCalledWith(
      "Only include known letters!",
      "Don't add unknowns - ?",
    );
  });

  it("rejects letters not present in the original anagram", async () => {
    const user = userEvent.setup();
    const { onError } = renderComponent();

    await user.type(screen.getAllByRole("textbox")[0], "z");

    expect(onError).toHaveBeenCalledWith(
      "Wrong letters!",
      "Please check the letters are in your original anagram",
    );
  });

  it("rejects duplicate letters beyond what the original anagram contains", async () => {
    const user = userEvent.setup();
    const { onError } = renderComponent();

    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "a");
    await user.type(inputs[1], "a");

    expect(onError).toHaveBeenCalledWith(
      "Wrong letters!",
      "Please check the letters are in your original anagram",
    );
  });

  it("moves focus to the next input after a valid letter", async () => {
    const user = userEvent.setup();
    renderComponent();

    const inputs = screen.getAllByRole("textbox");

    await user.type(inputs[0], "a");

    expect(inputs[1]).toHaveFocus();
  });

  it("navigates between inputs with arrow keys", async () => {
    const user = userEvent.setup();
    renderComponent();

    const inputs = screen.getAllByRole("textbox");
    inputs[0].focus();

    await user.keyboard("{ArrowRight}");
    expect(inputs[1]).toHaveFocus();

    await user.keyboard("{ArrowLeft}");
    expect(inputs[0]).toHaveFocus();
  });

  it("calls handleResetAnagram when Back is clicked", async () => {
    const user = userEvent.setup();
    const { handleResetAnagram } = renderComponent();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(handleResetAnagram).toHaveBeenCalled();
  });
});
