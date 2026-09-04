import { useState, useEffect, useCallback } from "react";
import Button from "../ui/Button";

interface DefinitionDetail {
  definition: string;
}

interface DefinitionItem {
  word: string;
  pos: string;
  definitions: DefinitionDetail[];
}

interface CheatDataInfiniteScrollProps {
  cheatData: DefinitionItem[];
  letters: string[];
  onConfirm: () => void;
}

export const CheatDataInfiniteScroll = ({
  cheatData,
  onConfirm,
}: CheatDataInfiniteScrollProps) => {
  const [visibleItems, setVisibleItems] = useState<DefinitionItem[]>([]);
  const [offset, setOffset] = useState(0);
  const [expandedDefinitions, setExpandedDefinitions] = useState<Set<number>>(
    new Set(),
  );
  const batchSize = 20;

  // Prevent main app background scrolling when modal is active
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const loadItems = useCallback(() => {
    if (cheatData) {
      const newVisibleItems = cheatData.slice(0, offset + batchSize);
      setVisibleItems(newVisibleItems);
    }
  }, [cheatData, offset, batchSize]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const loadMoreItems = () => {
    const newOffset = offset + batchSize;
    if (newOffset < cheatData.length) {
      setOffset(newOffset);
    }
  };

  const showLoadMoreButton = cheatData && offset + batchSize < cheatData.length;

  const toggleDefinition = (index: number) => {
    setExpandedDefinitions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (!cheatData) return null;

  return (
    <div>
      {/* Blurred dimmed backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onConfirm}
      />
      <div className="fixed top-[15vh] left-[10%] w-[80%] z-50 bg-white rounded-2xl shadow-2xl overflow-hidden md:w-160 md:left-[calc(50%-20rem)] flex flex-col max-h-[70vh] border border-orange-100 animate-in fade-in zoom-in-95 duration-200">
        <header className="bg-[#ed800f] p-4 text-white text-center shadow-sm">
          <h2 className="m-0 font-bold text-xl uppercase tracking-wider">
            Showing {visibleItems.length} of {cheatData.length} anagram
            {cheatData.length === 1 ? "" : "s"}
          </h2>
        </header>

        <div className="p-6 grow overflow-y-auto" style={{ height: "40vh" }}>
          <ul className="list-none p-0 m-0 space-y-6">
            {visibleItems.map((item, index) => {
              const isExpanded = expandedDefinitions.has(index);
              const hasMoreThanOne = item.definitions.length > 1;

              // CRUCIAL BUG FIX: Direct slice avoids mapping duplication loops entirely!
              const displayedDefinitions = isExpanded
                ? item.definitions
                : item.definitions.slice(0, 1);

              return (
                <li
                  key={index}
                  className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div className="font-bold text-[#ed800f] uppercase tracking-wide text-lg mb-2">
                    {item.word}
                    {item.pos && (
                      <span className="text-xs text-gray-400 lowercase ml-2 font-normal">
                        ({item.pos.toLowerCase()})
                      </span>
                    )}
                  </div>

                  {/* Single rendering container list */}
                  <ul className="list-disc list-inside space-y-2 mb-2 pl-2">
                    {displayedDefinitions.map((def, defIndex) => (
                      <li
                        key={defIndex}
                        className="text-gray-700 leading-relaxed text-sm"
                      >
                        {def.definition}
                      </li>
                    ))}
                  </ul>

                  {/* Toggle buttons cleanly extracted from list tracking wrappers */}
                  {hasMoreThanOne && (
                    <button
                      onClick={() => toggleDefinition(index)}
                      className="text-[#ed800f] hover:text-[#d4700b] text-xs font-bold mt-1 pl-2 transition-colors cursor-pointer flex items-center gap-1 focus:outline-none"
                    >
                      {isExpanded ? (
                        <>
                          Show Less
                          <svg
                            className="w-3 h-3 rotate-180"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </>
                      ) : (
                        <>
                          Show {item.definitions.length - 1} more definition
                          {item.definitions.length - 1 === 1 ? "" : "s"}
                        </>
                      )}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end items-center gap-3">
          {showLoadMoreButton && (
            <Button onClick={loadMoreItems}>Load More</Button>
          )}
          <Button
            className="bg-red-500 hover:bg-red-700 transition-colors"
            onClick={onConfirm}
          >
            Okay
          </Button>
        </footer>
      </div>
    </div>
  );
};
