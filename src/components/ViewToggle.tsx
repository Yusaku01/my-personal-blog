import React from 'react';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onToggle: () => void;
}

// ViewToggleコンポーネント固有のスタイル
const viewToggleStyles = {
  button:
    'px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2',
  activeText: '',
  hiddenText: 'hidden',
};

export const ViewToggle: React.FC<ViewToggleProps> = ({ view, onToggle }) => {
  return (
    <button onClick={onToggle} className={viewToggleStyles.button} title="表示形式を切り替え">
      <span className={view === 'grid' ? viewToggleStyles.activeText : viewToggleStyles.hiddenText}>
        コラム
      </span>
      <span className={view === 'list' ? viewToggleStyles.activeText : viewToggleStyles.hiddenText}>
        リスト
      </span>
    </button>
  );
};
