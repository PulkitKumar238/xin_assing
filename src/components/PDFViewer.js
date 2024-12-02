import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import styles from './PDFViewer.module.css';
import { jsPDF } from 'jspdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

function PDFViewer({ file, fileType }) {
  const canvasRef = useRef(null);
  const editCanvasRef = useRef(null);
  const imageInputRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [numPages, setNumPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scale, setScale] = useState(1.0);
  const [currentTool, setCurrentTool] = useState('cursor');

  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 100, y: 100 });
  const [isImagePlaced, setIsImagePlaced] = useState(false);

  const [cropMode, setCropMode] = useState(false);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState(null);

  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);

  const TOOLS = {
    CURSOR: 'cursor',
    BLUR: 'blur',
    ERASE: 'erase',
    TEXT: 'text',
    IMAGE: 'image',
    DRAW: 'draw'
  };

  useEffect(() => {
    if (!file || !canvasRef.current || !editCanvasRef.current) return;

    const loadFile = async () => {
      setIsLoading(true);
      setError(null);
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      try {
        if (fileType === 'image') {
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            editCanvasRef.current.width = img.width;
            editCanvasRef.current.height = img.height;
            ctx.drawImage(img, 0, 0);
            setIsLoading(false);
          };
          img.onerror = () => {
            setError('Failed to load image');
            setIsLoading(false);
          };
          img.src = file;
        } else if (fileType === 'pdf') {
          try {
            const loadingTask = pdfjsLib.getDocument(new Uint8Array(file));
            const pdf = await loadingTask.promise;
            setPdfDoc(pdf);
            setNumPages(pdf.numPages);
            await renderPage(1, pdf);
          } catch (err) {
            console.error('PDF Error:', err);
            setError('Failed to load PDF');
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load file');
        setIsLoading(false);
      }
    };

    loadFile();
  }, [file, fileType]);

  const drawBlur = (x, y) => {
    if (!isDrawing || !editCanvasRef.current) return;
    const ctx = editCanvasRef.current.getContext('2d');
    ctx.filter = 'blur(4px)';
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setLastPosition({ x, y });
  };

  const erase = (x, y) => {
    if (!isDrawing || !editCanvasRef.current) return;
    const ctx = editCanvasRef.current.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    setLastPosition({ x, y });
  };

  const handleTextPlacement = (x, y) => {
    setTextPosition({ x, y });
    setShowTextInput(true);
  };

  const addText = () => {
    if (!textInput.trim() || !editCanvasRef.current) return;
    const ctx = editCanvasRef.current.getContext('2d');
    ctx.font = '16px Arial';
    ctx.fillStyle = '#000000';
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    setShowTextInput(false);
    setTextInput('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = editCanvasRef.current.width * 0.8;
          const maxHeight = editCanvasRef.current.height * 0.8;
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (newWidth > maxWidth) {
            const ratio = maxWidth / newWidth;
            newWidth = maxWidth;
            newHeight = newHeight * ratio;
          }
          
          if (newHeight > maxHeight) {
            const ratio = maxHeight / newHeight;
            newHeight = maxHeight;
            newWidth = newWidth * ratio;
          }

          setSelectedImage({
            element: img,
            width: newWidth,
            height: newHeight,
          });
          setImageSize({ width: newWidth, height: newHeight });
          setImagePosition({
            x: (editCanvasRef.current.width - newWidth) / 2,
            y: (editCanvasRef.current.height - newHeight) / 2
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const startDrag = (e) => {
    if (selectedImage) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const dragImage = (e) => {
    if (isDragging && selectedImage) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      const newPosition = {
        x: imagePosition.x + deltaX,
        y: imagePosition.y + deltaY,
      };
      setImagePosition(newPosition);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const startResize = (e) => {
    if (selectedImage) {
      setIsResizing(true);
      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  };

  const resizeImage = (e) => {
    if (isResizing && selectedImage) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      setImageSize(prevSize => ({
        width: Math.max(10, prevSize.width + deltaX),
        height: Math.max(10, prevSize.height + deltaY),
      }));
      setResizeStart({ x: e.clientX, y: e.clientY });
    }
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const stopResize = () => {
    setIsResizing(false);
  };

  const handleCanvasMouseDown = (e) => {
    const rect = editCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    switch (currentTool) {
      case TOOLS.CURSOR:
      case TOOLS.BLUR:
      case TOOLS.ERASE:
        startDrawing(e);
        break;
      case TOOLS.IMAGE:
        if (selectedImage) {
          if (e.shiftKey) {
            startResize(e);
          } else {
            startDrag(e);
          }
        }
        break;
      case TOOLS.TEXT:
        handleTextPlacement(x, y);
        break;
      default:
        break;
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (currentTool === TOOLS.IMAGE && selectedImage) {
      if (isResizing) {
        resizeImage(e);
      } else if (isDragging) {
        dragImage(e);
      }
    } else if (isDrawing) {
      draw(e);
    }
  };

  const handleCanvasMouseUp = () => {
    if (currentTool === TOOLS.IMAGE) {
      stopDrag();
      stopResize();
    } else {
      stopDrawing();
    }
  };

  const handleCanvasDoubleClick = () => {
    if (selectedImage) {
      finalizeImage();
    }
  };

  const renderPage = async (pageNum, doc = pdfDoc) => {
    if (!doc) return;
    
    try {
      const page = await doc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      const canvas = canvasRef.current;
      const editCanvas = editCanvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      editCanvas.width = viewport.width;
      editCanvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error rendering page:', error);
      setError('Failed to render page');
    }
  };

  useEffect(() => {
    if (fileType === 'pdf' && pdfDoc) {
      setIsLoading(true);
      renderPage(currentPage);
    }
  }, [currentPage, scale, pdfDoc, fileType]);

  const handleCrop = () => {
    if (!crop || !editCanvasRef.current) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    ctx.drawImage(
      editCanvasRef.current,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      crop.width,
      crop.height
    );
    
    const croppedImageData = canvas.toDataURL();
    // Handle the cropped image data
  };

  const savePDF = async () => {
    try {
      setIsLoading(true);
      
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = canvasRef.current.width;
      canvas.height = canvasRef.current.height;
      
      // Draw base canvas
      ctx.drawImage(canvasRef.current, 0, 0);
      // Draw edit canvas
      ctx.drawImage(editCanvasRef.current, 0, 0);
      
      // Convert to PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('edited-document.pdf');
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error saving PDF:', error);
      setError('Failed to save PDF');
    }
  };

  const placeImage = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex(null);
      setCurrentTool('cursor');
    }
  };

  useEffect(() => {
    if (selectedImage && editCanvasRef.current) {
      const ctx = editCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, editCanvasRef.current.width, editCanvasRef.current.height);
      ctx.drawImage(
        selectedImage.element,
        imagePosition.x,
        imagePosition.y,
        imageSize.width,
        imageSize.height
      );
    }
  }, [selectedImage, imagePosition, imageSize, isImagePlaced]);

  useEffect(() => {
    if (editCanvasRef.current) {
      const ctx = editCanvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, editCanvasRef.current.width, editCanvasRef.current.height);
      images.forEach((image, index) => {
        ctx.drawImage(
          image.element,
          image.position.x,
          image.position.y,
          image.width,
          image.height
        );
      });
    }
  }, [images]);

  const Toolbar = () => {
    return (
      <div className={styles.toolbar}>
        <button
          className={currentTool === TOOLS.CURSOR ? styles.active : ''}
          onClick={() => setCurrentTool(TOOLS.CURSOR)}
        >
          <span role="img" aria-label="cursor">✏️</span> Draw
        </button>
        <button
          className={currentTool === TOOLS.BLUR ? styles.active : ''}
          onClick={() => setCurrentTool(TOOLS.BLUR)}
        >
          <span role="img" aria-label="blur">🌫️</span> Blur
        </button>
        <button
          className={currentTool === TOOLS.ERASE ? styles.active : ''}
          onClick={() => setCurrentTool(TOOLS.ERASE)}
        >
          <span role="img" aria-label="erase">🗑️</span> Erase
        </button>
        <button
          className={currentTool === TOOLS.IMAGE ? styles.active : ''}
          onClick={() => {
            setCurrentTool(TOOLS.IMAGE);
            imageInputRef.current?.click();
          }}
        >
          Add Image
        </button>
        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
    );
  };

  // Drawing functions
  const startDrawing = (e) => {
    const rect = editCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setLastPosition({ x, y });
    
    // Start path for cursor tool
    if (currentTool === TOOLS.CURSOR) {
      const ctx = editCanvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.strokeStyle = '#000000';  // Black color for cursor
      ctx.lineWidth = 2;  // Thin line for cursor
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const rect = editCanvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ctx = editCanvasRef.current.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    
    switch (currentTool) {
      case TOOLS.CURSOR:
        ctx.strokeStyle = '#000000';  // Black color for cursor
        ctx.lineWidth = 2;  // Thin line for cursor
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        break;
      case TOOLS.BLUR:
        ctx.filter = 'blur(4px)';
        ctx.lineWidth = 20;
        ctx.strokeStyle = '#ffffff';
        break;
      case TOOLS.ERASE:
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
        break;
      default:
        break;
    }
    
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
    
    setLastPosition({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  // Image handling functions
  const finalizeImage = () => {
    if (selectedImage && editCanvasRef.current) {
      const ctx = editCanvasRef.current.getContext('2d');
      ctx.drawImage(
        selectedImage.element,
        imagePosition.x,
        imagePosition.y,
        imageSize.width,
        imageSize.height
      );
      setSelectedImage(null);
      setCurrentTool(TOOLS.CURSOR);
    }
  };

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.toolbar}>
        {fileType === 'pdf' && pdfDoc && (
          <div className={styles.navigation}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
            >
              Previous
            </button>
            <span>Page {currentPage} of {numPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
            >
              Next
            </button>
          </div>
        )}
        
        <div className={styles.zoomControls}>
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))}>
            Zoom Out
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))}>
            Zoom In
          </button>
        </div>
        
        <div className={styles.editTools}>
          <button 
            className={currentTool === TOOLS.CURSOR ? styles.active : ''}
            onClick={() => setCurrentTool(TOOLS.CURSOR)}
          >
            <span role="img" aria-label="cursor">✏️</span> Draw
          </button>
          <button 
            className={currentTool === TOOLS.BLUR ? styles.active : ''}
            onClick={() => setCurrentTool(TOOLS.BLUR)}
          >
            <span role="img" aria-label="blur">🌫️</span> Blur
          </button>
          <button 
            className={currentTool === TOOLS.ERASE ? styles.active : ''}
            onClick={() => setCurrentTool(TOOLS.ERASE)}
          >
            <span role="img" aria-label="erase">🗑️</span> Erase
          </button>
          <button 
            className={currentTool === TOOLS.TEXT ? styles.active : ''}
            onClick={() => setCurrentTool(TOOLS.TEXT)}
          >
            Add Text
          </button>
         
        </div>
        
        <button onClick={savePDF} className={styles.saveButton}>
          Save PDF
        </button>
        
        <button 
          className={currentTool === TOOLS.IMAGE ? styles.active : ''}
          onClick={() => {
            if (currentTool === TOOLS.IMAGE) {
              setCurrentTool(TOOLS.CURSOR);
              setSelectedImage(null);
            } else {
              setCurrentTool(TOOLS.IMAGE);
              imageInputRef.current?.click();
            }
          }}
        >
          Add Image
        </button>

        <input
          type="file"
          ref={imageInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      {showTextInput && (
        <div 
          className={styles.textInput}
          style={{ left: textPosition.x, top: textPosition.y }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            autoFocus
          />
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />
          <input
            type="number"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            min="8"
            max="72"
          />
          <button onClick={addText}>Add</button>
          <button onClick={() => setShowTextInput(false)}>Cancel</button>
        </div>
      )}

      <div className={styles.canvasContainer}>
        <canvas ref={canvasRef} className={styles.mainCanvas} />
        <canvas
          ref={editCanvasRef}
          className={`${styles.editCanvas} ${styles[currentTool]}`}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onDoubleClick={handleCanvasDoubleClick}
        />
      </div>
    </div>
  );
}

export default PDFViewer;
