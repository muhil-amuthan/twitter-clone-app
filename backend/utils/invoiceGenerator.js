import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export function generateInvoice(userId, plan, amount, txnId) {
  const doc = new PDFDocument();
  const invoiceDir = path.join(process.cwd(), "invoices");
  
  // Create invoices directory if it doesn't exist
  if (!fs.existsSync(invoiceDir)) {
    fs.mkdirSync(invoiceDir, { recursive: true });
  }
  
  const filePath = path.join(invoiceDir, `${txnId}.pdf`);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Subscription Invoice");
  doc.moveDown();
  doc.text(`User: ${userId}`);
  doc.text(`Plan: ${plan}`);
  doc.text(`Amount: ₹${amount}`);
  doc.text(`Transaction ID: ${txnId}`);

  doc.end();

  return filePath;
}