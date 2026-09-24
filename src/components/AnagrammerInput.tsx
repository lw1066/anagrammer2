import React, { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import Button from "../ui/Button";

interface AnagrammerInputProps {
  onError: (title: string, message: string) => void;
  onAnagrammise: (letters: string) => void;
}

const AnagrammerInput: React.FC<AnagrammerInputProps> = ({
  onError,
  onAnagrammise,
}) => {
  const [letters, setLetters] = useState<string>("");

  const changeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    setLetters(event.target.value);
  };

  const anagrammiseHandler = (event: SubmitEvent) => {
    event.preventDefault();

    const checkRegex = /^[A-Za-z?]+$/;
    const trimmedLetters = letters.replace(/\s/g, "").trim();

    if (!trimmedLetters) {
      onError("No letters!", "Put some letters in to anagrammise");
      return;
    }
    if (!trimmedLetters.match(checkRegex)) {
      onError(
        "Invalid characters!",
        "You can only use letters and ? (for unknown letters)",
      );
      return;
    }

    const formattedLetters = trimmedLetters
      .replace(/\s+/g, " ")
      .replace(/\s*\?\s*/g, "?");

    onAnagrammise(formattedLetters);
  };

  return (
    <form
      onSubmit={anagrammiseHandler}
      className="flex flex-col gap-4 max-w-md mx-auto mt-8 p-6 bg-orange-50 shadow-sm rounded-2xl"
    >
      <label htmlFor="letters" className="text-sm font-semibold text-slate-700">
        Enter letters (? for unknown)
      </label>
      <input
        id="letters"
        onChange={changeHandler}
        value={letters}
        type="text"
        autoCorrect="off"
        placeholder="e.g. a?ple"
        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ed800f] focus:border-transparent transition-all placeholder:text-slate-400"
      />
      <div className="flex justify-center pt-2">
        <Button type="submit">Let's Anagrammise!</Button>
      </div>
    </form>
  );
};

export default AnagrammerInput;
