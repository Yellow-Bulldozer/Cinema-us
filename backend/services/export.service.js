import prisma from '../config/prisma.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const exportJSON = async () => {
  return prisma.watchItem.findMany({
    orderBy: { createdAt: 'desc' },
  });
};

export const exportCSV = async () => {
  const items = await prisma.watchItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const fields = ['id', 'title', 'type', 'rating', 'experience', 'status', 'favorite', 'watchedDate', 'poster', 'platform', 'genre', 'mood', 'pinned', 'createdAt', 'updatedAt'];
  return new Parser({ fields }).parse(items);
};

export const exportPDF = async () => {
  const items = await prisma.watchItem.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const buffers = [];

    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    doc.fontSize(24).font('Helvetica-Bold').text('Our Watchlist', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#666666').text(`Generated on ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1);

    doc.strokeColor('#cccccc').lineWidth(1).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    const headers = ['Title', 'Type', 'Rating', 'Status', 'Genre', 'Platform'];
    const colWidths = [160, 60, 50, 80, 70, 80];

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333');
    headers.forEach((header, index) => {
      const x = 40 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
      doc.text(header, x, doc.y, { width: colWidths[index] });
    });
    doc.moveDown(0.8);
    doc.strokeColor('#eeeeee').moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(8).fillColor('#444444');
    for (const item of items) {
      if (doc.y > 750) doc.addPage();

      const row = [
        item.title?.substring(0, 30) || '',
        item.type || '',
        `${item.rating || 0}/10`,
        item.status || '',
        item.genre || '-',
        item.platform || '-',
      ];
      const startY = doc.y;
      row.forEach((cell, index) => {
        const x = 40 + colWidths.slice(0, index).reduce((sum, width) => sum + width, 0);
        doc.text(cell, x, startY, { width: colWidths[index] });
      });
      doc.moveDown(0.7);
    }

    doc.moveDown(1);
    doc.fontSize(8).fillColor('#999999').text(`Total: ${items.length} items`, { align: 'center' });
    doc.end();
  });
};
