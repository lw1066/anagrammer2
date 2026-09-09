import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryCheck } from "../DictionaryCheck";

describe("DictionaryCheck", () => {
  const mockOnDictLookUp = jest.fn();
  const mockOnError = jest.fn();
  const mockOnClose = jest.fn();

  const renderComponent = () => {
    render(
      <DictionaryCheck
        onDictLookUp={mockOnDictLookUp}
        onError={mockOnError}
        onClose={mockOnClose}
      />,
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form with input and buttons", () => {
    renderComponent();

    expect(
      screen.getByRole("textbox", { name: /enter word to dictionary check/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /check/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back/i })).toBeInTheDocument();
  });

  it("calls onClose when Back button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: /back/i }));

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("shows error when submitting with empty input", async () => {
    const user = userEvent.setup();
    renderComponent();

    await user.click(screen.getByRole("button", { name: /check/i }));

    expect(mockOnError).toHaveBeenCalledWith(
      "No letters!",
      "Put a word in mate",
    );
    expect(mockOnDictLookUp).not.toHaveBeenCalled();
  });

  it("shows error when submitting with non-alphabetic characters", async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole("textbox", {
      name: /enter word to dictionary check/i,
    });
    await user.type(input, "hello123");
    await user.click(screen.getByRole("button", { name: /check/i }));

    expect(mockOnError).toHaveBeenCalledWith(
      "Not letters!",
      "You can't check stuff that ain't letters",
    );
    expect(mockOnDictLookUp).not.toHaveBeenCalled();
  });

  it("calls onDictLookUp with the entered word and onError handler", async () => {
    const user = userEvent.setup();
    renderComponent();

    const input = screen.getByRole("textbox", {
      name: /enter word to dictionary check/i,
    });
    await user.type(input, "hello");
    await user.click(screen.getByRole("button", { name: /check/i }));

    expect(mockOnDictLookUp).toHaveBeenCalledWith("hello", mockOnError);
    expect(mockOnError).not.toHaveBeenCalled();
  });

  it("displays input as uppercase", () => {
    renderComponent();

    const input = screen.getByRole("textbox", {
      name: /enter word to dictionary check/i,
    });
    expect(input).toHaveClass("uppercase");
  });
});
