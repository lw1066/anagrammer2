import React from "react";
import type { FormEvent } from "react";
import Button from "../ui/Button";

interface AnagramDisplayProps {
  letters: string[];
  onError: (title: string, message: string) => void;
  onLetterSubmit: (list: string[]) => void;
}

const AnagramDisplay: React.FC<AnagramDisplayProps> = ({
  letters,
  onError,
  onLetterSubmit,
}) => {
  if (!Array.isArray(letters)) {
    return null;
  }

  const letterHandler = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Extract all input elements within the form
    const form = event.currentTarget;
    const inputElements = form.querySelectorAll('input[type="text"]');

    // Map over the input elements to extract their values
    const list = Array.from(inputElements).map((input) =>
      (input as HTMLInputElement).value.toLowerCase().trim()
    );

    // Validate input
    const data = letters.map((item) => item.toLowerCase());
    for (let i = 0; i < list.length; i++) {
      if (list[i] === "?") {
        onError("Only include known letters!", "Don't add unknowns - ?");
        return;
      }

      const index = data.indexOf(list[i]);
      if (index === -1 && list[i] !== "") {
        onError(
          "Wrong letters!",
          "Please check the letters are in your original anagram"
        );
        return;
      }

      if (index !== -1) {
        data.splice(index, 1); // Remove the letter to prevent further matches
      }
    }

    onLetterSubmit(list);
  };

  // Calculate flex-basis based on the number of letters for alignment
  const inputWidthPercentage = `${100 / letters.length - 3}%`;

  return (
    <form onSubmit={letterHandler} className="flex flex-col gap-6 max-w-2xl mx-auto mt-8 p-8 bg-white shadow-sm border border-slate-200 rounded-2xl">
      <p className="bg-white/95 rounded-lg p-3 text-center text-[#ed800f] font-medium border border-orange-100 shadow-sm">
        Position any letters ({letters.join(", ")})
      </p>
      
      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((_, index) => (
          <input
            type="text"
            id={index.toString()}
            key={index}
            size={1}
            maxLength={1}
            style={{ flexBasis: inputWidthPercentage }}
            className="h-12 w-12 text-center text-xl font-bold uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed800f] focus:border-transparent transition-all shadow-inner"
          />
        ))}
      </div>
      
      <div className="flex justify-center pt-2">
        <Button type="submit">Let's go</Button>
      </div>
    </form>
  );
};

export default AnagramDisplay;