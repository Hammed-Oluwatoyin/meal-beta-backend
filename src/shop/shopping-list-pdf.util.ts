import PDFDocument from 'pdfkit';
import { ShoppingList } from '../database/entities';

export function renderShoppingListPdf(
  list: ShoppingList,
): InstanceType<typeof PDFDocument> {
  const doc = new PDFDocument({ margin: 50 });
  doc.fontSize(18).text('MealBeta Shopping List', { align: 'center' });
  doc.moveDown();

  const itemsByCategory = new Map<string, typeof list.items>();
  for (const item of list.items) {
    const bucket = itemsByCategory.get(item.category) ?? [];
    bucket.push(item);
    itemsByCategory.set(item.category, bucket);
  }

  for (const [category, items] of itemsByCategory) {
    doc.fontSize(14).text(category, { underline: true });
    doc.moveDown(0.3);
    for (const item of items) {
      const mark = item.isChecked ? '[x]' : '[ ]';
      doc
        .fontSize(11)
        .text(`${mark} ${item.name} - ${item.quantity} ${item.unit}`);
    }
    doc.moveDown();
  }

  doc.end();
  return doc;
}
