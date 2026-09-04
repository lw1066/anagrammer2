import { useState } from "react";
import Button from "../ui/Button";

interface AnagramDisplayProps {
  letters: string[];
  onError: (title: string, message: string) => void;
  onLetterSubmit: (list: string[]) => void;
}

export const AnagramDisplay = ({
  letters,
  onError,
  onLetterSubmit,
}: AnagramDisplayProps) => {
  const [userLetters, setUserLetters] = useState<string[]>(
    Array(letters.length).fill(""),
  );

  if (!Array.isArray(letters)) {
    return null;
  }

  const letterHandler = (index: number, value: string) => {
    const updatedLetters = [...userLetters];
    updatedLetters[index] = value.toLowerCase().trim();

    setUserLetters(updatedLetters);
  };

  const submitHandler = () => {
    const data = letters.map((item) => item.toLowerCase());

    for (const letter of userLetters) {
      if (letter === "?") {
        onError("Only include known letters!", "Don't add unknowns - ?");
        return;
      }

      const index = data.indexOf(letter);

      if (index === -1 && letter !== "") {
        onError(
          "Wrong letters!",
          "Please check the letters are in your original anagram",
        );
        return;
      }

      if (index !== -1) {
        data.splice(index, 1);
      }
    }

    onLetterSubmit(userLetters);
  };

  const inputWidthPercentage = `${100 / letters.length - 3}%`;

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto mt-8 p-8 bg-white shadow-sm border border-slate-200 rounded-2xl">
      <p className="bg-white/95 rounded-lg p-3 text-center text-[#ed800f] font-medium border border-orange-100 shadow-sm">
        Position any letters ({letters.join(", ")})
      </p>

      <div className="flex flex-wrap justify-center gap-2">
        {letters.map((_, index) => (
          <input
            type="text"
            id={index.toString()}
            key={index}
            value={userLetters[index]}
            onChange={(event) => letterHandler(index, event.target.value)}
            size={1}
            maxLength={1}
            style={{ flexBasis: inputWidthPercentage }}
            className="h-12 w-12 text-center text-xl font-bold uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed800f] focus:border-transparent transition-all shadow-inner"
          />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <Button type="button" onClick={submitHandler}>
          Let's go
        </Button>
      </div>
    </div>
  );
};
