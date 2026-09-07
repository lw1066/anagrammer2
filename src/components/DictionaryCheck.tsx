import { useState } from "react";
import Button from "../ui/Button";

interface DictionaryCheckProps {
  onDictLookUp: (
    word: string,
    errHandler: (title: string, msg: string) => void,
  ) => void;
  onError: (title: string, message: string) => void;
  onClose: () => void;
}

export const DictionaryCheck = ({
  onError,
  onDictLookUp,
  onClose,
}: DictionaryCheckProps) => {
  const [letters, setLetters] = useState("");

  const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLetters(event.target.value);
  };

  const dictCheckHandler = (event: React.SubmitEvent) => {
    event.preventDefault();
    const checkRegex = /^[A-Za-z]+$/;
    if (!letters) {
      onError("No letters!", "Put a word in mate");
      return;
    }
    if (!letters.match(checkRegex)) {
      onError("Not letters!", "You can't check stuff that ain't letters");
      return;
    }
    onDictLookUp(letters, onError);
  };

  return (
    <form
      onSubmit={dictCheckHandler}
      className="flex flex-col items-center max-w-7/8 mx-auto my-8 p-6 bg-orange-50 rounded-lg shadow-sm"
    >
      <label
        htmlFor="target_word"
        className="text-lg font-bold text-gray-700 mb-4"
      >
        Enter word to dictionary check?
      </label>
      <input
        id="target_word"
        onChange={changeHandler}
        value={letters}
        type="text"
        className="w-fit px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ed800f] text-center uppercase tracking-widest mb-6"
      />
      <div className="flex justify-center gap-3">
        <Button type="submit">Check</Button>
        <Button
          className="bg-red-500 hover:bg-red-700"
          type="button"
          onClick={onClose}
        >
          Back
        </Button>
      </div>
    </form>
  );
};
