import React, { useState } from 'react';
import PDFViewer from './components/PDFViewer';
import styles from './App.module.css';

function App() {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    console.log("Selected file:", selectedFile); // Debug log

    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (e) => {
        console.log("File loaded"); // Debug log
        if (selectedFile.type === 'application/pdf') {
          setFile(e.target.result);
          setFileType('pdf');
        } else if (selectedFile.type.startsWith('image/')) {
          setFile(e.target.result);
          setFileType('image');
        }
      };

      if (selectedFile.type.startsWith('image/')) {
        reader.readAsDataURL(selectedFile);
      } else {
        reader.readAsArrayBuffer(selectedFile);
      }
    }
  };

  return (
    <div className={styles.app}>
      <div className={styles.uploadSection}>
        <input
          type="file"
          accept="application/pdf,image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        {file && <p>File uploaded successfully!</p>}
      </div>
      
      {file && fileType && (
        <PDFViewer file={file} fileType={fileType} />
      )}
    </div>
  );
}

export default App;
