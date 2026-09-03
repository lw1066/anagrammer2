import React from 'react';

interface DictionaryItemProps {
  pos: string;
  definitions: { definition: string }[];
}

export const DictionaryItem: React.FC<DictionaryItemProps> = ({ pos, definitions }) => {
  return (
    <li className="mb-4">
      <span className="font-bold text-[#ed800f] uppercase tracking-wide text-sm">{pos}</span>
      <ul className="list-disc list-inside mt-2 space-y-1">
        {definitions.map((definition, index) => (
          <li className="text-gray-700 ml-4" key={index}>{definition.definition}</li>
        ))}
      </ul>
    </li>
  );
};

