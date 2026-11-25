import jsPDF from 'jspdf';
import { OrderWithDetails } from '@/types/database';
import { format } from 'date-fns';

export function generateOrderReceipt(order: OrderWithDetails, userName: string): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const primaryColor: [number, number, number] = [249, 115, 22]; // Orange
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];

  // Header background
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('🍽️ CampusBite', pageWidth / 2, 22, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Order Receipt', pageWidth / 2, 35, { align: 'center' });

  // Token Number Box
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(pageWidth / 2 - 35, 55, 70, 40, 5, 5, 'F');
  
  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.text('TOKEN NUMBER', pageWidth / 2, 68, { align: 'center' });
  
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text(`#${order.token_number}`, pageWidth / 2, 88, { align: 'center' });

  // Order Info
  let yPos = 115;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Order ID and Date
  doc.setTextColor(...mutedColor);
  doc.text(`Order ID: ${order.id.substring(0, 8)}...`, 20, yPos);
  doc.text(`Date: ${format(new Date(order.created_at), 'dd MMM yyyy, h:mm a')}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 10;
  doc.text(`Customer: ${userName}`, 20, yPos);
  
  if (order.time_slot) {
    doc.text(`Pickup: ${order.time_slot.start_time} - ${order.time_slot.end_time}`, pageWidth - 20, yPos, { align: 'right' });
  }

  // Divider
  yPos += 10;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Items Header
  yPos += 15;
  doc.setTextColor(...textColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Item', 20, yPos);
  doc.text('Qty', 120, yPos, { align: 'center' });
  doc.text('Price', pageWidth - 20, yPos, { align: 'right' });

  // Items
  yPos += 5;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  order.order_items?.forEach((item) => {
    const itemName = item.menu_item?.name || 'Item';
    const itemTotal = item.quantity * item.price_at_time;
    
    doc.setTextColor(...textColor);
    doc.text(itemName, 20, yPos);
    doc.text(item.quantity.toString(), 120, yPos, { align: 'center' });
    doc.text(`₹${itemTotal.toFixed(0)}`, pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 8;
  });

  // Total Divider
  yPos += 5;
  doc.setDrawColor(229, 231, 235);
  doc.line(20, yPos, pageWidth - 20, yPos);

  // Total
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('Total Amount', 20, yPos);
  doc.setTextColor(...primaryColor);
  doc.text(`₹${order.total_amount}`, pageWidth - 20, yPos, { align: 'right' });

  // Payment Status
  yPos += 15;
  doc.setFillColor(34, 197, 94);
  doc.roundedRect(pageWidth / 2 - 30, yPos - 5, 60, 15, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('PAID', pageWidth / 2, yPos + 5, { align: 'center' });

  // Notes
  if (order.notes) {
    yPos += 25;
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text(`Note: ${order.notes}`, 20, yPos);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.setFillColor(31, 41, 55);
  doc.rect(0, footerY - 10, pageWidth, 30, 'F');
  
  doc.setTextColor(156, 163, 175);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Thank you for ordering with CampusBite!', pageWidth / 2, footerY, { align: 'center' });
  doc.text('Please show this receipt when collecting your order.', pageWidth / 2, footerY + 8, { align: 'center' });

  // Save the PDF
  doc.save(`CampusBite-Order-${order.token_number}.pdf`);
}
