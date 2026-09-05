import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App Component", () => {
  test("renders welcome text initially", () => {
    render(<App />);
    expect(
      screen.getByText(/Hello, if you need anagram help/i),
    ).toBeInTheDocument();
  });

  // Add more tests as needed
});
