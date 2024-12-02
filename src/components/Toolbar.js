import React from 'react';
import styles from './Toolbar.module.css';
import { 
  FaSearch, FaSearchMinus, FaSearchPlus, 
  FaChevronLeft, FaChevronRight, 
  FaFont, FaEraser, FaEyeSlash,
  FaMousePointer, FaSave, FaUndo, FaRedo
} from 'react-icons/fa';

function Toolbar({ 
  currentPage, 
  numPages, 
  scale,
  currentTool,
  onPageChange,
  onZoom,
  onToolChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave
}) {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.toolbar}>
        <div className={styles.toolGroup}>
          <button 
            className={styles.toolButton} 
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            title="Previous Page"
          >
            <FaChevronLeft />
          </button>
          <div className={styles.pageInfo}>
            <input 
              type="number" 
              value={currentPage}
              onChange={(e) => onPageChange(parseInt(e.target.value))}
              min={1}
              max={numPages}
            />
            <span>/ {numPages}</span>
          </div>
          <button 
            className={styles.toolButton}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= numPages}
            title="Next Page"
          >
            <FaChevronRight />
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button 
            className={styles.toolButton}
            onClick={() => onZoom('out')}
            title="Zoom Out"
          >
            <FaSearchMinus />
          </button>
          <div className={styles.zoomInfo}>
            {Math.round(scale * 100)}%
          </div>
          <button 
            className={styles.toolButton}
            onClick={() => onZoom('in')}
            title="Zoom In"
          >
            <FaSearchPlus />
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button 
            className={`${styles.toolButton} ${currentTool === 'cursor' ? styles.active : ''}`}
            onClick={() => onToolChange('cursor')}
            title="Select"
          >
            <FaMousePointer />
          </button>
          <button 
            className={`${styles.toolButton} ${currentTool === 'text' ? styles.active : ''}`}
            onClick={() => onToolChange('text')}
            title="Add Text"
          >
            <FaFont />
          </button>
          <button 
            className={`${styles.toolButton} ${currentTool === 'blur' ? styles.active : ''}`}
            onClick={() => onToolChange('blur')}
            title="Blur"
          >
            <FaEyeSlash />
          </button>
          <button 
            className={`${styles.toolButton} ${currentTool === 'erase' ? styles.active : ''}`}
            onClick={() => onToolChange('erase')}
            title="Erase"
          >
            <FaEraser />
          </button>
        </div>

        <div className={styles.toolGroup}>
          <button 
            className={styles.toolButton}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            <FaUndo />
          </button>
          <button 
            className={styles.toolButton}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            <FaRedo />
          </button>
          <button 
            className={`${styles.toolButton} ${styles.saveButton}`}
            onClick={onSave}
            title="Save PDF"
          >
            <FaSave />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Toolbar; 