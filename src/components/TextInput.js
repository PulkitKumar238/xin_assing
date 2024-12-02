import React, { useEffect, useRef } from 'react';
import styles from './TextInput.module.css';

function TextInput({ 
  position, 
  value, 
  onChange, 
  onSubmit, 
  onCancel,
  fontSize = 16,
  color = '#000000'
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <div 
      className={styles.textInputContainer}
      style={{ 
        left: position.x,
        top: position.y
      }}
    >
      <div className={styles.textControls}>
        <input
          type="number"
          value={fontSize}
          onChange={(e) => onChange({ fontSize: e.target.value })}
          min="8"
          max="72"
          className={styles.fontSizeInput}
        />
        <input
          type="color"
          value={color}
          onChange={(e) => onChange({ color: e.target.value })}
          className={styles.colorInput}
        />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange({ text: e.target.value })}
        onKeyPress={(e) => e.key === 'Enter' && onSubmit()}
        className={styles.textInput}
        style={{
          fontSize: `${fontSize}px`,
          color: color
        }}
      />
      <div className={styles.buttonGroup}>
        <button onClick={onSubmit} className={styles.addButton}>
          Add
        </button>
        <button onClick={onCancel} className={styles.cancelButton}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TextInput; 