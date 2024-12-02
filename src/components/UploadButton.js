import React from "react";

function UploadButton({ setPdfFile }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (e) => setPdfFile(new Uint8Array(e.target.result)); // Ensure Uint8Array
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a valid PDF file.");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <label
        htmlFor="pdf-upload"
        className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload PDF
      </label>
      <input
        id="pdf-upload"
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}

export default UploadButton;
