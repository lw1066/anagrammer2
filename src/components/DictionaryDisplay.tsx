import React from 'react';
import Button from '../ui/Button';
import { DictionaryItem } from './DictionaryItem';

interface DictionaryDisplayProps {
  wordDisplay: any[];
  onConfirm: () => void;
}

const DictionaryDisplay: React.FC<DictionaryDisplayProps> = (props) => {
  if (!props.wordDisplay || props.wordDisplay.length === 0) return null;

  return (
    <div>
      <div 
        className="fixed inset-0 bg-black/75 z-40" 
        onClick={props.onConfirm} 
      />
      <div className="fixed top-[15vh] left-[10%] w-[80%] z-50 bg-white rounded-lg shadow-xl overflow-hidden md:w-[40rem] md:left-[calc(50%-20rem)] flex flex-col max-h-[70vh]">
        <header className="bg-[#ed800f] p-4">
          <h2 className="m-0 text-white text-center font-bold text-2xl uppercase tracking-widest">{props.wordDisplay[0].word}</h2>
        </header>
        <div className="p-4 flex-grow overflow-y-auto">
          <ul className="list-none p-0 m-0">
            {props.wordDisplay.map((word) => (
              <DictionaryItem
                key={word.pos}
                pos={word.pos}
                definitions={word.definitions}
              />
            ))}
          </ul>
        </div>
        <footer className="p-4 flex justify-end">
          <Button onClick={props.onConfirm}>Okay</Button>
        </footer>
      </div>
    </div>
  );
};

export default DictionaryDisplay;

