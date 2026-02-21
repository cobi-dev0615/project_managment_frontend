import React, { useState, useRef, useEffect } from 'react';
import './SearchableSelect.css';

const SearchableSelect = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  allowEmpty = false,
  emptyLabel = 'All',
  id,
  name,
  required = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  const valueStr = value === null || value === undefined ? '' : String(value);
  const selectedOption = options.find(opt => String(opt.id) === valueStr);
  const displayValue = selectedOption ? selectedOption.name : '';

  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchQuery('');
  }, [isOpen]);

  const handleSelect = (optValue) => {
    onChange(optValue === '' ? '' : optValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e, optValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(optValue);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${className} ${isOpen ? 'open' : ''}`}
    >
      <input type="hidden" name={name} value={valueStr} />
      <button
        type="button"
        id={id}
        className="searchable-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={!displayValue && allowEmpty ? 'placeholder' : ''}>
          {displayValue || (allowEmpty ? emptyLabel : placeholder)}
        </span>
        <span className="searchable-select-chevron">▼</span>
      </button>

      {isOpen && (
        <div className="searchable-select-dropdown" role="listbox">
          <div className="searchable-select-search">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="searchable-select-input"
              autoFocus
            />
          </div>
          <div className="searchable-select-options">
            {allowEmpty && (
              <div
                className={`searchable-select-option ${!valueStr ? 'selected' : ''}`}
                onClick={() => handleSelect('')}
                onKeyDown={(e) => handleKeyDown(e, '')}
                role="option"
                tabIndex={0}
                aria-selected={!valueStr}
              >
                {emptyLabel}
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div className="searchable-select-empty">No matching options</div>
            ) : (
              filteredOptions.map((opt) => {
                const optValue = String(opt.id);
                const isSelected = optValue === valueStr;
                return (
                  <div
                    key={opt.id}
                    className={`searchable-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(opt.id)}
                    onKeyDown={(e) => handleKeyDown(e, opt.id)}
                    role="option"
                    tabIndex={0}
                    aria-selected={isSelected}
                  >
                    {opt.name}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
