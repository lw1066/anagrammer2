import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryDisplay } from "../DictionaryDisplay";

describe("DictionaryDisplay", () => {
  it("renders nothing when wordDisplay is empty", () => {
    const { container } = render(
      <DictionaryDisplay wordDisplay={[]} onConfirm={jest.fn()} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders word header when data is provided", () => {
    const mockData = [
      {
        word: "hello",
        pos: "noun",
        definitions: [{ definition: "a greeting" }],
      },
    ];

    render(<DictionaryDisplay wordDisplay={mockData} onConfirm={jest.fn()} />);

    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("calls onConfirm when Okay button is clicked", async () => {
    const onConfirm = jest.fn();
    const user = userEvent.setup();
    const mockData = [
      {
        word: "test",
        pos: "verb",
        definitions: [{ definition: "to evaluate" }],
      },
    ];

    render(<DictionaryDisplay wordDisplay={mockData} onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: /okay/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
