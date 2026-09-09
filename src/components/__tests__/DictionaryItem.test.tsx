import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DictionaryItem } from "../DictionaryItem";

describe("DictionaryItem", () => {
  it("renders pos and first definition initially", () => {
    const mockItem = {
      pos: "noun",
      definitions: [
        { definition: "a greeting" },
        { definition: "an expression of surprise" },
      ],
    };

    render(
      <DictionaryItem pos={mockItem.pos} definitions={mockItem.definitions} />,
    );

    expect(screen.getByText("noun")).toBeInTheDocument();
    expect(screen.getByText("a greeting")).toBeInTheDocument();
    // Second definition should NOT be visible initially
    expect(
      screen.queryByText("an expression of surprise"),
    ).not.toBeInTheDocument();
  });

  it("shows button with correct count when multiple definitions exist", () => {
    const mockItem = {
      pos: "verb",
      definitions: [
        { definition: "to evaluate" },
        { definition: "to examine" },
      ],
    };

    render(
      <DictionaryItem pos={mockItem.pos} definitions={mockItem.definitions} />,
    );

    expect(
      screen.getByRole("button", { name: /show 1 more definition/i }),
    ).toBeInTheDocument();
  });

  it("expands to show all definitions when clicked", async () => {
    const user = userEvent.setup();
    const mockItem = {
      pos: "verb",
      definitions: [
        { definition: "to evaluate" },
        { definition: "to examine" },
        { definition: "to test" },
      ],
    };

    render(
      <DictionaryItem pos={mockItem.pos} definitions={mockItem.definitions} />,
    );

    const expandButton = screen.getByRole("button", {
      name: /show 2 more definitions/i,
    });
    await user.click(expandButton);

    // All definitions should now be visible
    expect(screen.getByText("to examine")).toBeInTheDocument();
    expect(screen.getByText("to test")).toBeInTheDocument();
    // Button text changes to "Show Less"
    expect(
      screen.getByRole("button", { name: /show less/i }),
    ).toBeInTheDocument();
  });

  it("does not render expand button when only one definition", () => {
    render(
      <DictionaryItem
        pos="noun"
        definitions={[{ definition: "a greeting" }]}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /show/i }),
    ).not.toBeInTheDocument();
  });

  it("renders single definition with correct pluralization", () => {
    const mockItem = {
      pos: "noun",
      definitions: [{ definition: "a greeting" }],
    };

    render(
      <DictionaryItem pos={mockItem.pos} definitions={mockItem.definitions} />,
    );

    expect(screen.getByText("noun")).toBeInTheDocument();
    expect(screen.getByText("a greeting")).toBeInTheDocument();
  });
});
