import { useState, useEffect } from "react";
import Button from "../ui/Button";

interface FinalAnagramProps {
  anaLetters: {
    unordered: string[] | string;
    ld: string[] | string;
  };
  dictLookUp: () => void;
  cheatLookUp: (cheatWord: string[], currentLetters: string[]) => void;
  resetAna: () => void;
  resetAnaLetters: () => void;
  letters: string[] | string;
}

export const FinalAnagram = ({
  anaLetters,
  dictLookUp,
  cheatLookUp,
  resetAna,
  resetAnaLetters,
  letters,
}: FinalAnagramProps) => {
  const initialAna = Array.isArray(anaLetters.unordered)
    ? [...anaLetters.unordered]
    : typeof anaLetters.unordered === "string"
      ? anaLetters.unordered.split("")
      : [];

  const [ana, setAna] = useState<string[]>(initialAna);
  const letterData = Array.isArray(anaLetters.ld)
    ? anaLetters.ld
    : typeof anaLetters.ld === "string"
      ? anaLetters.ld.split("")
      : [];

  useEffect(() => {
    setAna(
      Array.isArray(anaLetters.unordered)
        ? [...anaLetters.unordered]
        : typeof anaLetters.unordered === "string"
          ? anaLetters.unordered.split("")
          : [],
    );
  }, [anaLetters.unordered]);

  if (!letterData || letterData.length === 0) {
    return null;
  }

  const mixTheLetters = () => {
    const shuffledLetters = [...ana];

    for (let i = shuffledLetters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledLetters[i], shuffledLetters[j]] = [
        shuffledLetters[j],
        shuffledLetters[i],
      ];
    }
    setAna([...shuffledLetters]);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto my-8 space-y-6">
      <div className="text-center w-full">
        <p className="flex flex-wrap justify-center text-[#ed800f] mb-4">
          {letterData.map((item, index) =>
            item ? (
              <span
                className="uppercase text-2xl text-center mx-2 font-bold text-[#ed800f]"
                key={index}
              >
                {item}
              </span>
            ) : (
              <span
                className="uppercase text-2xl text-center mx-2 font-bold text-[#ed800f]"
                key={index}
              >
                _
              </span>
            ),
          )}
        </p>
        <p className="uppercase text-2xl text-center mx-2 tracking-[0.75rem] wrap-break-word text-[#ed800f] font-bold">
          {ana.join("")}
        </p>
      </div>

      <div className="flex flex-col justify-center items-center rounded bg-cover bg-center w-full max-w-md h-32 p-4 shadow-md bg-[url('/alpha-spag.jpg')] bg-orange-100">
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={mixTheLetters} type="button">
            Mix
          </Button>
          <Button onClick={dictLookUp} type="button">
            Dictionary
          </Button>
          <Button
            onClick={() =>
              cheatLookUp(
                letterData as string[],
                Array.isArray(letters) ? letters : letters.split(""),
              )
            }
            type="button"
          >
            Cheat!
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-700"
            onClick={resetAnaLetters}
            type="button"
          >
            Back
          </Button>
          <Button
            className="bg-red-500 hover:bg-red-700"
            onClick={resetAna}
            type="button"
          >
            Restart
          </Button>
        </div>
      </div>
    </div>
  );
};
