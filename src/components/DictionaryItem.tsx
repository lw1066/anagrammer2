import React, { useState } from "react";
import type { DefinitionDetail } from "../services/GetDefinitionHelper";

interface DictionaryItemProps {
  pos: string;
  definitions: DefinitionDetail[];
}

export const DictionaryItem: React.FC<DictionaryItemProps> = ({
  pos,
  definitions,
}) => {
  const [showAll, setShowAll] = useState(false);

  const displayedDefinitions = showAll ? definitions : definitions.slice(0, 1);
  const hasMoreThanOne = definitions.length > 1;

  return (
    <li className="mb-6 p-4 border border-orange-100 rounded-xl bg-orange-50/30">
      {/* Part of Speech Badge Heading */}
      <h3 className="text-sm font-bold uppercase tracking-wider text-[#ed800f] mb-2">
        {pos}
      </h3>

      {/* Definitions Sub-List */}
      <ol className="list-decimal pl-5 space-y-2 text-gray-700">
        {displayedDefinitions.map((def, idx) => (
          <li key={idx} className="leading-relaxed">
            {def.definition}
          </li>
        ))}
      </ol>

      {/* Toggle Button shown ONLY if there are extra definitions hidden */}
      {hasMoreThanOne && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs font-bold text-[#ed800f] hover:text-[#d4700b] transition-colors focus:outline-none flex items-center gap-1"
        >
          {showAll ? (
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
              More Definitions ({definitions.length - 1} hidden)
              <svg
                className="w-3 h-3"
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
          )}
        </button>
      )}
    </li>
  );
};
