import { PDFDocument } from "pdf-lib";

export const savePDF = async (pdfBytes, annotations) => {
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  annotations.forEach((annotation) => {
    firstPage.drawText(annotation.text, {
      x: annotation.x,
      y: annotation.y,
      size: 12,
    });
  });

  const modifiedPdf = await pdfDoc.save();
  return modifiedPdf;
};
