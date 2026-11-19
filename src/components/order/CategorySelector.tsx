'use client';

import React from 'react';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  platformPrefix: string;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  platformPrefix,
}) => {
  if (categories.length === 0) {
    return (
      <div className="p-3 rounded-xl bg-app-elevated border border-app-border text-xs text-app-subtle">
        Chưa có dịch vụ nào cho nền tảng này.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 pt-0.5">
      {categories.map((cat) => {
        const isSelected = cat === selectedCategory;
        const displayName = cat.replace(new RegExp(`^${platformPrefix}-`, 'i'), '');

        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`
              px-3.5 py-2 rounded-xl text-xs font-bold transition border select-none min-h-[38px] flex items-center shrink-0
              ${isSelected
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-app-surface border-app-border text-app-muted hover:text-app-text hover:bg-app-elevated hover:border-app-borderSubtle'
              }
            `}
          >
            {displayName}
          </button>
        );
      })}
    </div>
  );
};
