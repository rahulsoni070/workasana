import { useState } from "react";

const TagInput = ({ value, onChange, suggestions = [] }) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean) return;
    if (value.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, clean]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !value.some((t) => t.toLowerCase() === s.toLowerCase()) &&
      (input === "" || s.toLowerCase().includes(input.toLowerCase()))
  );

  return (
    <div className="tag-input">
      <div className="tag-input-chips">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length ? "" : "Type and press Enter to add a tag"}
        />
      </div>
      {showSuggestions && (filteredSuggestions.length > 0 || input) && (
        <div className="tag-suggestions">
          {filteredSuggestions.map((s) => (
            <button
              type="button"
              key={s}
              className="tag-suggestion-item"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </button>
          ))}
          {input && !suggestions.some((s) => s.toLowerCase() === input.toLowerCase()) && (
            <button type="button" className="tag-suggestion-item tag-suggestion-new" onMouseDown={() => addTag(input)}>
              + Create "{input}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TagInput;