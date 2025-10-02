declare module 'pdfkit' {
  // Minimal ambient types to satisfy TS when using dynamic import in adminExportPdf
  const PDFDocument: any;
  export default PDFDocument;
}
