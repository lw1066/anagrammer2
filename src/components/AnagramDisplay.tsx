import { useRef, useState } from "react";
import Button from "../ui/Button";

interface AnagramDisplayProps {
  letters: string[];
  handleResetAnagram: () => void;
  onError: (title: string, message: string) => void;
  onLetterSubmit: (list: string[]) => void;
}

export const AnagramDisplay = ({
  letters,
  handleResetAnagram,
  onError,
  onLetterSubmit,
}: AnagramDisplayProps) => {
  const [userLetters, setUserLetters] = useState<string[]>(
    Array(letters.length).fill(""),
  );

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!Array.isArray(letters)) {
    return null;
  }

  const letterHandler = (index: number, value: string) => {
    const letter = value.toLowerCase().trim();

    if (letter === "") {
      const updatedLetters = [...userLetters];
      updatedLetters[index] = "";

      setUserLetters(updatedLetters);
      return;
    }

    // Don't allow unknown letters
    if (letter === "?") {
      onError("Only include known letters!", "Don't add unknowns - ?");
      return;
    }

    // Count how many times this letter exists in the original anagram
    const availableCount = letters.filter(
      (item) => item.toLowerCase() === letter,
    ).length;

    // Count how many times this letter is already being used,
    // excluding the input currently being edited
    const usedCount = userLetters.filter(
      (item, currentIndex) => currentIndex !== index && item === letter,
    ).length;

    // Letter doesn't exist, or we've used it too many times
    if (availableCount === 0 || usedCount >= availableCount) {
      onError(
        "Wrong letters!",
        "Please check the letters are in your original anagram",
      );
      return;
    }

    const updatedLetters = [...userLetters];
    updatedLetters[index] = letter;

    setUserLetters(updatedLetters);

    // Automatically move to the next input
    if (index < letters.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const keyHandler = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();

      if (index < letters.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();

      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }

    if (event.key === "Backspace" && !userLetters[index]) {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const submitHandler = () => {
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
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            id={index.toString()}
            key={index}
            value={userLetters[index]}
            onChange={(event) => letterHandler(index, event.target.value)}
            onKeyDown={(event) => keyHandler(event, index)}
            size={1}
            maxLength={1}
            style={{ flexBasis: inputWidthPercentage }}
            className="h-12 w-12 text-center text-xl font-bold uppercase bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed800f] focus:border-transparent transition-all shadow-inner"
          />
        ))}
      </div>

      <div className="flex justify-center gap-2 pt-2">
        <Button type="button" onClick={submitHandler}>
          Let's go
        </Button>
        <Button
          className="bg-red-500 hover:bg-red-700"
          type="button"
          onClick={handleResetAnagram}
        >
          Back
        </Button>
      </div>
    </div>
  );
};
