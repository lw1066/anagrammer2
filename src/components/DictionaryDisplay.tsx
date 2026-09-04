import { useEffect } from "react";
import Button from "../ui/Button";
import { DictionaryItem } from "./DictionaryItem";

interface DictionaryDisplayProps {
  wordDisplay: any[];
  onConfirm: () => void;
}

export const DictionaryDisplay = ({
  wordDisplay,
  onConfirm,
}: DictionaryDisplayProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!wordDisplay || wordDisplay.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dimmed Background Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onConfirm}
      />
      <div className="fixed top-[15vh] left-[10%] w-[80%] z-50 bg-white rounded-lg shadow-xl overflow-hidden md:w-160 md:left-[calc(50%-20rem)] flex flex-col max-h-[70vh]">
        <header className="bg-[#ed800f] p-4">
          <h2 className="m-0 text-white text-center font-bold text-2xl uppercase tracking-widest">
            {wordDisplay[0].word}
          </h2>
        </header>
        <div className="p-4 grow overflow-y-auto">
          <ul className="list-none p-0 m-0">
            {wordDisplay.map((word) => (
              <DictionaryItem
                key={word.pos}
                pos={word.pos}
                definitions={word.definitions}
              />
            ))}
          </ul>
        </div>
        <footer className="p-4 flex justify-end">
          <Button onClick={onConfirm}>Okay</Button>
        </footer>
      </div>
    </div>
  );
};
