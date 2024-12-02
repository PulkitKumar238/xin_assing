import React, { useRef } from "react";

function AnnotationCanvas() {
  const canvasRef = useRef(null);

  const handleMouseDown = (e) => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(e.nativeEvent.offsetX, e.nativeEvent.offsetY, 50, 50);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        className="border rounded shadow-lg"
        width={600}
        height={800}
      />
    </div>
  );
}

export default AnnotationCanvas;
