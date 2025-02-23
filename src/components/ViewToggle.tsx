import React from 'react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onToggle: () => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
      title="表示形式を切り替え"
    >
      <span className={view === 'grid' ? '' : 'hidden'}>コラム</span>
      <span className={view === 'list' ? '' : 'hidden'}>リスト</span>
    </button>
  );
};