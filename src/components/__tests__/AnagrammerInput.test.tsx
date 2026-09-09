import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnagrammerInput from "../AnagrammerInput";

describe("AnagrammerInput", () => {
  const renderComponent = (overrides = {}) => {
    const onAnagrammise = jest.fn();
    const onError = jest.fn();

    render(
      <AnagrammerInput
        onError={onError}
        onAnagrammise={onAnagrammise}
        {...overrides}
      />,
    );

    return { onAnagrammise, onError };
  };

  it("renders the input and submit button", () => {
    renderComponent();

    expect(screen.getByLabelText(/enter letters/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /let's anagrammise/i }),
    ).toBeInTheDocument();
  });

  it("submits valid letters and passes the cleaned input", async () => {
    const user = userEvent.setup();
    const { onAnagrammise, onError } = renderComponent();

    const input = screen.getByLabelText(/enter letters/i);
    await user.type(input, "a?ple");

    await user.click(
      screen.getByRole("button", { name: /let's anagrammise/i }),
    );

    expect(onAnagrammise).toHaveBeenCalledWith("a?ple");
    expect(onError).not.toHaveBeenCalled();
  });

  it("trims whitespace and formats question marks before submitting", async () => {
    const user = userEvent.setup();
    const { onAnagrammise } = renderComponent();

    const input = screen.getByLabelText(/enter letters/i);
    await user.type(input, "  a ? b  ");

    await user.click(
      screen.getByRole("button", { name: /let's anagrammise/i }),
    );

    expect(onAnagrammise).toHaveBeenCalledWith("a?b");
  });

  it("shows an error when no letters are entered", async () => {
    const user = userEvent.setup();
    const { onError, onAnagrammise } = renderComponent();

    await user.click(
      screen.getByRole("button", { name: /let's anagrammise/i }),
    );

    expect(onError).toHaveBeenCalledWith(
      "No letters!",
      "Put some letters in to anagrammise",
    );
    expect(onAnagrammise).not.toHaveBeenCalled();
  });

  it("shows an error for invalid characters", async () => {
    const user = userEvent.setup();
    const { onError, onAnagrammise } = renderComponent();

    const input = screen.getByLabelText(/enter letters/i);
    await user.type(input, "abc123");

    await user.click(
      screen.getByRole("button", { name: /let's anagrammise/i }),
    );

    expect(onError).toHaveBeenCalledWith(
      "Invalid characters!",
      "You can only use letters and ? (for unknown letters)",
    );
    expect(onAnagrammise).not.toHaveBeenCalled();
  });

  it("submits on pressing Enter", async () => {
    const user = userEvent.setup();
    const { onAnagrammise } = renderComponent();

    const input = screen.getByLabelText(/enter letters/i);
    await user.type(input, "test{Enter}");

    expect(onAnagrammise).toHaveBeenCalledWith("test");
  });
});
