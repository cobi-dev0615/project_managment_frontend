import React, { useState, useRef, useEffect } from 'react';
import './TechStackSelect.css';

const TECH_STACK_OPTIONS = [
  // Languages
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  'Scala', 'Dart', 'Elixir', 'Lua', 'R', 'MATLAB',
  // Frontend
  'React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte', 'jQuery', 'HTML/CSS', 'Tailwind CSS',
  'Bootstrap', 'Material UI', 'Redux', 'GraphQL', 'Webpack', 'Vite',
  // Backend
  'Node.js', 'Express', 'ExpressJS', 'Django', 'Flask', 'FastAPI', 'Laravel', 'Ruby on Rails', 'Spring Boot',
  'ASP.NET', 'NestJS', 'Koa', 'Gin', 'Phoenix',
  // Mobile
  'React Native', 'Flutter', 'Swift (iOS)', 'Kotlin (Android)', 'Xamarin',
  // Databases
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Firebase', 'Supabase',
  'Oracle', 'Microsoft SQL Server', 'DynamoDB', 'Elasticsearch',
  // DevOps & Cloud
  'Docker', 'Kubernetes', 'AWS', 'AWS Lambda', 'Azure', 'Google Cloud', 'Heroku', 'Vercel', 'Netlify',
  'CI/CD', 'Terraform', 'Linux', 'Nginx', 'Git',
  // AI & ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'OpenAI', 'OpenAI API', 'LangChain',
  'Natural Language Processing', 'Computer Vision', 'Data Science', 'Pandas', 'NumPy',
  // Other
  'REST API', 'Microservices', 'Blockchain', 'Web3', 'Unity', 'Unreal Engine',
  'Figma', 'Adobe XD', 'WordPress', 'Shopify', 'Stripe', 'Agile', 'Scrum',
  'React VR', 'RethinkDB', 'RESTEasy',
];

const MAX_SKILLS = 15;

const TechStackSelect = ({
  value = [],
  onChange,
  placeholder = 'Search or type to add...',
  id,
  className = '',
  maxSkills = MAX_SKILLS,
  showMaxHint = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const optionRefs = useRef([]);

  const selected = Array.isArray(value) ? value : [];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const atLimit = selected.length >= maxSkills;

  const filteredOptions = TECH_STACK_OPTIONS.filter(
    (opt) =>
      opt.toLowerCase().includes(normalizedQuery) && !selected.includes(opt)
  );

  const canAddCustom =
    normalizedQuery.length > 0 &&
    !TECH_STACK_OPTIONS.some((o) => o.toLowerCase() === normalizedQuery);
  const customLabel = canAddCustom ? `Add "${searchQuery.trim()}"` : null;

  const visibleOptions = filteredOptions.slice(0, 50);
  const selectableItems = customLabel
    ? [searchQuery.trim(), ...visibleOptions]
    : visibleOptions;

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
    if (isOpen) {
      setSearchQuery('');
      setHighlightedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen && selectableItems.length > 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex, isOpen, selectableItems.length]);

  const addItem = (item) => {
    const trimmed = typeof item === 'string' ? item.trim() : item;
    if (!trimmed || selected.includes(trimmed) || atLimit) return;
    onChange([...selected, trimmed]);
    setSearchQuery('');
    inputRef.current?.focus();
  };

  const removeItem = (item) => {
    onChange(selected.filter((s) => s !== item));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !searchQuery && selected.length > 0) {
      removeItem(selected[selected.length - 1]);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (selectableItems.length > 0) {
        setHighlightedIndex((i) => (i + 1) % selectableItems.length);
      }
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen && selectableItems.length > 0) {
        setHighlightedIndex((i) => (i - 1 + selectableItems.length) % selectableItems.length);
      }
      return;
    }
    if (e.key === 'Enter') {
      if (isOpen && selectableItems.length > 0) {
        e.preventDefault();
        const item = selectableItems[highlightedIndex];
        addItem(item);
        return;
      }
      if (searchQuery.trim()) {
        e.preventDefault();
        const match = TECH_STACK_OPTIONS.find(
          (o) => o.toLowerCase() === searchQuery.trim().toLowerCase()
        );
        addItem(match || searchQuery.trim());
      }
    }
  };

  const clearInput = (e) => {
    e.stopPropagation();
    setSearchQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`tech-stack-select ${className} ${isOpen ? 'open' : ''}`}
    >
      <div
        className="tech-stack-trigger"
        onClick={() => setIsOpen(true)}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls="tech-stack-listbox"
      >
        <div className="tech-stack-tags">
          {selected.map((item) => (
            <span key={item} className="tech-stack-tag">
              {item}
              <button
                type="button"
                className="tech-stack-tag-remove"
                onClick={(e) => { e.stopPropagation(); removeItem(item); }}
                aria-label={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id={id}
            type="text"
            className="tech-stack-input"
            placeholder={selected.length === 0 ? placeholder : ''}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="tech-stack-listbox"
          />
        </div>
        {searchQuery ? (
          <button
            type="button"
            className="tech-stack-clear"
            onClick={clearInput}
            aria-label="Clear search"
          >
            ×
          </button>
        ) : (
          <span className="tech-stack-chevron">▼</span>
        )}
      </div>
      {showMaxHint && (
        <div className="tech-stack-hint">Maximum {maxSkills} skills.</div>
      )}

      {isOpen && (
        <div
          id="tech-stack-listbox"
          className="tech-stack-dropdown"
          role="listbox"
        >
          <div className="tech-stack-options">
            {filteredOptions.length === 0 && !customLabel ? (
              <div className="tech-stack-empty">
                {normalizedQuery ? 'No matching technologies' : 'Start typing to search'}
              </div>
            ) : (
              <>
                {customLabel && (
                  <div
                    ref={(el) => { optionRefs.current[0] = el; }}
                    className={`tech-stack-option tech-stack-option-add ${highlightedIndex === 0 ? 'highlighted' : ''}`}
                    onClick={() => addItem(searchQuery.trim())}
                    role="option"
                    aria-selected={highlightedIndex === 0}
                  >
                    {customLabel}
                  </div>
                )}
                {visibleOptions.map((opt, i) => {
                  const idx = customLabel ? i + 1 : i;
                  return (
                    <div
                      key={opt}
                      ref={(el) => { optionRefs.current[idx] = el; }}
                      className={`tech-stack-option ${highlightedIndex === idx ? 'highlighted' : ''}`}
                      onClick={() => addItem(opt)}
                      role="option"
                      aria-selected={highlightedIndex === idx}
                    >
                      {opt}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TechStackSelect;
export { TECH_STACK_OPTIONS };
