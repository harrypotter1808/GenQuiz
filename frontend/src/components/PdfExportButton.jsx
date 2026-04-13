import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function PdfExportButton({ targetId, filename }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsExporting(true);
    
    try {
      // Temporarily adjust styling for better PDF capture if needed
      const canvas = await html2canvas(element, {
        scale: 2, // Higher resolution
        backgroundColor: '#0f172a',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${filename}.pdf`);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button 
      className="btn btn-secondary" 
      onClick={handleExport}
      disabled={isExporting}
      style={{marginTop: '1rem'}}
    >
      {isExporting ? 'Generating PDF...' : 'Download Report (PDF)'}
    </button>
  );
}
