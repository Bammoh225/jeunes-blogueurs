import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ExportService {

  exportPDF(titre: string, colonnes: string[], lignes: any[][], nomFichier: string) {
    import('jspdf').then(({ jsPDF }) => {
      import('jspdf-autotable').then(() => {
        const doc = new jsPDF({ orientation: 'landscape' });

        const now = new Date().toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric'
        });

        // En-tête
        doc.setFillColor(14, 165, 233);
        doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Jeunes Blogueurs — UNICEF Côte d\'Ivoire', 14, 12);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text(titre, 14, 22);

        // Date
        doc.setFontSize(9);
        doc.text(`Généré le ${now}`, doc.internal.pageSize.width - 14, 22, { align: 'right' });

        // Tableau
        (doc as any).autoTable({
          head: [colonnes],
          body: lignes,
          startY: 36,
          styles: {
            fontSize: 9,
            cellPadding: 4,
          },
          headStyles: {
            fillColor: [14, 165, 233],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [240, 249, 255],
          },
          margin: { left: 14, right: 14 },
        });

        // Pied de page
        const totalPages = (doc as any).internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(
            `Page ${i} / ${totalPages}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 8,
            { align: 'center' }
          );
        }

        doc.save(`${nomFichier}.pdf`);
      });
    });
  }

  exportExcel(colonnes: string[], lignes: any[][], nomFichier: string) {
    import('xlsx').then(XLSX => {
      const ws = XLSX.utils.aoa_to_sheet([colonnes, ...lignes]);

      // Style de l'en-tête
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) {
          cell.s = {
            fill: { fgColor: { rgb: '0EA5E9' } },
            font: { bold: true, color: { rgb: 'FFFFFF' } },
          };
        }
      }

      // Largeur auto des colonnes
      const colWidths = colonnes.map((col, i) => {
        const maxLen = Math.max(
          col.length,
          ...lignes.map(row => String(row[i] ?? '').length)
        );
        return { wch: Math.min(maxLen + 2, 40) };
      });
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Rapport');
      XLSX.writeFile(wb, `${nomFichier}.xlsx`);
    });
  }
}
