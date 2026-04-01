import React, { useState, useEffect } from 'react';

interface SearchInputProps {
  onChange: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onChange }) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    const debounce = setTimeout(() => {
      onChange(value);
    }, 300);

    return () => clearTimeout(debounce);
  }, [value, onChange]);

  const handleClear = () => {
    setValue('');
    onChange('');
  };

  return (
    <div className="search-container">
      <div className="search-wrapper">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Поиск по названию или сообщению..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="search-input"
        />
        {value && (
          <button className="search-clear" onClick={handleClear} title="Очистить">
            ✕
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchInput;