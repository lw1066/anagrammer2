import React, { useState, useEffect, useCallback } from 'react';
import Button from '../ui/Button';

interface CheatDataInfiniteScrollProps {
  cheatData: any[];
  letters: string[];
  onConfirm: () => void;
}

export const CheatDataInfiniteScroll: React.FC<CheatDataInfiniteScrollProps> = (props) => {
  const [visibleItems, setVisibleItems] = useState<any[]>([]);
  const [offset, setOffset] = useState(0);
  const batchSize = 20;

  const loadItems = useCallback(() => {
    if (props.cheatData) {
      const newVisibleItems = props.cheatData.slice(0, offset + batchSize);
      setVisibleItems(newVisibleItems);
    }
  }, [props.cheatData, offset, batchSize]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const loadMoreItems = () => {
    const newOffset = offset + batchSize;
    if (newOffset < props.cheatData.length) {
      setOffset(newOffset);
    }
  };

  const showLoadMoreButton = props.cheatData && (offset + batchSize < props.cheatData.length);

  if (!props.cheatData) return null;

  return (
    <div>
      <div 
        className="fixed inset-0 bg-black/75 z-40" 
        onClick={props.onConfirm} 
      />
      <div className="fixed top-[15vh] left-[10%] w-[80%] z-50 bg-white rounded-lg shadow-xl overflow-hidden md:w-[40rem] md:left-[calc(50%-20rem)] flex flex-col max-h-[70vh]">
        <header className="bg-[#ed800f] p-4 text-white text-center">
          <h2 className="m-0 font-bold text-xl uppercase">
            {props.cheatData.length === 0 ? 'No' : props.cheatData.length}{' '}
            anagram{props.cheatData.length === 1 ? '' : 's'} found
          </h2>
        </header>
        
        <div className="p-4 flex-grow overflow-y-auto" style={{ height: '40vh' }}>
          <ul className="list-none p-0 m-0">
            {visibleItems.map((item, index) => (
              <React.Fragment key={index}>
                <li className="font-bold text-[#ed800f] uppercase tracking-wide text-lg mt-4">{item.word}</li>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {item.defs.map((definition: string, i: number) => (
                    <li className="text-gray-700 ml-4" key={i}>
                      {definition}
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </ul>
        </div>
        
        <footer className="p-4 flex justify-end items-center gap-4 border-t">
          {showLoadMoreButton && (
            <Button onClick={loadMoreItems}>Load More</Button>
          )}
          <Button className="!bg-red-500 hover:!bg-red-700" onClick={props.onConfirm}>Okay</Button>
        </footer>
      </div>
    </div>
  );
};

