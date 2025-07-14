// LetterBoxes.jsx
import React, { useRef, useEffect } from 'react';

export default function LetterBoxes({ length, value, onChange, name, className = "" }) {
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (e, idx) => {
    const newValue = e.target.value.replace(/[^a-zA-Z0-9@.\s]/, "").slice(0, 1);
    let chars = value.split("");
    chars[idx] = newValue;
    onChange(chars.join(""));
    
    if (newValue && idx < length - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      let chars = value.split("");
      
      if (chars[idx]) {
        chars[idx] = "";
        onChange(chars.join(""));
      } else if (idx > 0) {
        chars[idx - 1] = "";
        onChange(chars.join(""));
        inputRefs.current[idx - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && idx > 0) {
      e.preventDefault();
      inputRefs.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight" && idx < length - 1) {
      e.preventDefault();
      inputRefs.current[idx + 1]?.focus();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const nextElement = e.currentTarget.closest('.sbi-form-row')?.nextElementSibling?.querySelector('input');
      if (nextElement) {
        nextElement.focus();
      }
    }
  };

  return (
    <div className={`letter-box-row ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          type="text"
          maxLength={1}
          className="letter-box"
          value={value[idx] || ""}
          onChange={(e) => handleChange(e, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          autoComplete="off"
        />
      ))}
    </div>
  );
}
