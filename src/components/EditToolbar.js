import React from 'react';

function EditToolbar({ currentTool, onToolChange, onZoom, scale }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
      <div className="flex space-x-2">
        <button
          onClick={() => onToolChange('cursor')}
          className={`p-2 rounded ${currentTool === 'cursor' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        >
          <span className="material-icons">cursor</span>
        </button>
        <button
          onClick={() => onToolChange('blur')}
          className={`p-2 rounded ${currentTool === 'blur' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        >
          <span className="material-icons">blur_on</span>
        </button>
        <button
          onClick={() => onToolChange('erase')}
          className={`p-2 rounded ${currentTool === 'erase' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        >
          <span className="material-icons">auto_fix_normal</span>
        </button>
        <button
          onClick={() => onToolChange('text')}
          className={`p-2 rounded ${currentTool === 'text' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
        >
          <span className="material-icons">text_fields</span>
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => onZoom('out')}
          className="p-2 rounded hover:bg-gray-100"
        >
          <span className="material-icons">zoom_out</span>
        </button>
        <span className="text-sm">{Math.round(scale * 100)}%</span>
        <button
          onClick={() => onZoom('in')}
          className="p-2 rounded hover:bg-gray-100"
        >
          <span className="material-icons">zoom_in</span>
        </button>
      </div>
    </div>
  );
}

export default EditToolbar;
