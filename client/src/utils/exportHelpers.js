import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// Converts a Blob to Base64 string
const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const dataUrl = reader.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
};

/**
 * Universal Native & Web File Saver/Sharer
 * On Android/iOS APK: Writes file to device Cache/Documents and opens native Share/Save dialog.
 * On Web: Falls back to Web Share API or direct browser download.
 */
export const saveOrShareFile = async (blob, filename, mimeType) => {
  // 1. Native Capacitor (Android APK)
  if (typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache
      });

      await Share.share({
        title: filename,
        text: `ClassSathi Attendance: ${filename}`,
        url: writeResult.uri,
        dialogTitle: `Save or Share ${filename}`
      });
      return true;
    } catch (nativeErr) {
      console.warn('Native Capacitor share failed, falling back to browser methods:', nativeErr);
    }
  }

  // 2. Web Share API (if supported with files in browser)
  try {
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
          text: `ClassSathi Attendance: ${filename}`
        });
        return true;
      }
    }
  } catch (shareErr) {
    if (shareErr.name === 'AbortError') return true;
    console.warn('Web Share failed, attempting direct download...', shareErr);
  }

  // 3. Standard Browser Download Anchor
  try {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    return true;
  } catch (err) {
    console.error('All download mechanisms failed:', err);
    alert('File download failed. Please check storage/browser permissions.');
    return false;
  }
};

// --- DAILY EXPORTS ---

export const generateDailyPDF = async (dailyData, schoolInfo = {}) => {
  if (!dailyData || !dailyData.records || dailyData.records.length === 0) {
    alert('No attendance records available to export for this date.');
    return;
  }

  const schoolName = schoolInfo.schoolName || 'ClassSathi Academy (Class 9 & 10)';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // School Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(24, 43, 73);
  doc.text(schoolName, 105, 18, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('DAILY ATTENDANCE REGISTER', 105, 26, { align: 'center' });

  // Meta Information Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 32, 182, 18, 2, 2, 'F');

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text(`Class:`, 18, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(`Class ${dailyData.studentClass}`, 32, 39);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date:`, 85, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dailyData.date}`, 98, 39);

  doc.setFont('helvetica', 'bold');
  doc.text(`Total Students:`, 140, 39);
  doc.setFont('helvetica', 'normal');
  doc.text(`${dailyData.summary?.total || dailyData.records.length}`, 168, 39);

  // Summary Row inside meta bar
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text(`Present: ${dailyData.summary?.present || 0}`, 18, 46);

  doc.setTextColor(225, 29, 72);
  doc.text(`Absent: ${dailyData.summary?.absent || 0}`, 58, 46);

  doc.setTextColor(217, 119, 6);
  doc.text(`Late: ${dailyData.summary?.late || 0}`, 98, 46);

  doc.setTextColor(37, 99, 235);
  doc.text(`Leave: ${dailyData.summary?.leave || 0}`, 130, 46);

  doc.setTextColor(79, 70, 229);
  doc.text(`Rate: ${dailyData.summary?.percentage || 0}%`, 165, 46);

  // Table Data
  const tableRows = dailyData.records.map((item, index) => [
    index + 1,
    item.rollNo,
    item.name,
    item.fatherName,
    item.status.toUpperCase(),
    item.remarks || '-'
  ]);

  autoTable(doc, {
    startY: 55,
    head: [['#', 'Roll', 'Student Name', "Father's Name", 'Status', 'Remarks']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'center', cellWidth: 15 },
      2: { fontStyle: 'bold', cellWidth: 45 },
      3: { cellWidth: 45 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 28 },
      5: { cellWidth: 39 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        const val = data.cell.raw;
        if (val === 'PRESENT') {
          data.cell.styles.textColor = [5, 150, 105]; // Green
        } else if (val === 'ABSENT') {
          data.cell.styles.textColor = [225, 29, 72]; // Red
        } else if (val === 'LATE') {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else if (val === 'LEAVE') {
          data.cell.styles.textColor = [37, 99, 235]; // Blue
        }
      }
    },
    styles: {
      fontSize: 9,
      cellPadding: 2.5
    },
    margin: { left: 14, right: 14 }
  });

  // Footer Signatures
  const finalY = doc.lastAutoTable.finalY + 22;
  const pageHeight = doc.internal.pageSize.height;

  const signY = finalY > pageHeight - 30 ? pageHeight - 20 : finalY;
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.text('Class Teacher Signature', 25, signY);
  doc.line(20, signY - 6, 70, signY - 6);

  doc.text('Principal / Headmaster Seal & Signature', 130, signY);
  doc.line(125, signY - 6, 185, signY - 6);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated on ${new Date().toLocaleString()} by ClassSathi`, 105, pageHeight - 8, {
    align: 'center'
  });

  const filename = `Daily_Attendance_Class_${dailyData.studentClass}_${dailyData.date}.pdf`;
  const blob = doc.output('blob');
  return saveOrShareFile(blob, filename, 'application/pdf');
};

export const generateDailyExcel = async (dailyData, schoolInfo = {}) => {
  if (!dailyData || !dailyData.records || dailyData.records.length === 0) {
    alert('No attendance records available to export for this date.');
    return;
  }

  const schoolName = schoolInfo.schoolName || 'ClassSathi Academy (Class 9 & 10)';

  const headers = [
    ['SCHOOL NAME:', schoolName],
    ['REPORT:', 'DAILY ATTENDANCE REGISTER'],
    ['CLASS:', `Class ${dailyData.studentClass}`],
    ['DATE:', dailyData.date],
    ['TOTAL STUDENTS:', dailyData.summary?.total || dailyData.records.length],
    ['PRESENT:', dailyData.summary?.present || 0],
    ['ABSENT:', dailyData.summary?.absent || 0],
    ['LATE:', dailyData.summary?.late || 0],
    ['LEAVE:', dailyData.summary?.leave || 0],
    ['ATTENDANCE %:', `${dailyData.summary?.percentage || 0}%`],
    [], // empty line
    ['S.No', 'Roll No', 'Student Name', "Father's Name", 'Status', 'Remarks']
  ];

  const rows = dailyData.records.map((r, i) => [
    i + 1,
    r.rollNo,
    r.name,
    r.fatherName,
    r.status,
    r.remarks || ''
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 8 },
    { wch: 10 },
    { wch: 26 },
    { wch: 26 },
    { wch: 14 },
    { wch: 30 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daily Attendance');
  
  const filename = `Daily_Attendance_Class_${dailyData.studentClass}_${dailyData.date}.xlsx`;
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return saveOrShareFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};

// --- MONTHLY MATRIX EXPORTS ---

export const generateMonthlyPDF = async (monthlyData, schoolInfo = {}) => {
  if (!monthlyData || !monthlyData.studentRows || monthlyData.studentRows.length === 0) {
    alert('No monthly register records available to export.');
    return;
  }

  const schoolName = schoolInfo.schoolName || 'ClassSathi Academy (Class 9 & 10)';
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthTitle = `${monthNames[monthlyData.month - 1]} ${monthlyData.year}`;

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 43, 73);
  doc.text(schoolName, 148, 14, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`MONTHLY ATTENDANCE REGISTER — CLASS ${monthlyData.studentClass} — ${monthTitle.toUpperCase()}`, 148, 20, {
    align: 'center'
  });

  // Table Columns: Roll, Name, Father Name, 1..daysInMonth, P, A, L, LV, %
  const daysInMonth = monthlyData.daysInMonth;
  const headCols = ['Roll', 'Student Name', "Father's Name"];
  for (let d = 1; d <= daysInMonth; d++) {
    headCols.push(String(d));
  }
  headCols.push('P', 'A', 'L', 'LV', '%');

  const bodyRows = monthlyData.studentRows.map((s) => {
    const row = [s.rollNo, s.name, s.fatherName];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayData = s.dailyStatus[d];
      if (!dayData) {
        row.push('-');
      } else {
        const char =
          dayData.status === 'Present'
            ? 'P'
            : dayData.status === 'Absent'
            ? 'A'
            : dayData.status === 'Late'
            ? 'L'
            : dayData.status === 'Leave'
            ? 'LV'
            : '-';
        row.push(char);
      }
    }
    row.push(
      s.summary.present,
      s.summary.absent,
      s.summary.late,
      s.summary.leave,
      `${s.summary.percentage}%`
    );
    return row;
  });

  autoTable(doc, {
    startY: 25,
    head: [headCols],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      halign: 'center',
      cellPadding: 1
    },
    styles: {
      fontSize: 6.5,
      halign: 'center',
      cellPadding: 0.9
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left', fontStyle: 'bold', cellWidth: 26 },
      2: { halign: 'left', cellWidth: 24 }
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index >= 3 && data.column.index < 3 + daysInMonth) {
        const val = data.cell.raw;
        if (val === 'P') {
          data.cell.styles.textColor = [5, 150, 105];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'A') {
          data.cell.styles.textColor = [225, 29, 72];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [255, 241, 242];
        } else if (val === 'L') {
          data.cell.styles.textColor = [217, 119, 6];
          data.cell.styles.fontStyle = 'bold';
        } else if (val === 'LV') {
          data.cell.styles.textColor = [37, 99, 235];
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { left: 8, right: 8 }
  });

  const finalY = doc.lastAutoTable.finalY + 12;
  const pageHeight = doc.internal.pageSize.height;
  const signY = finalY > pageHeight - 20 ? pageHeight - 15 : finalY;

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Class Teacher Signature', 20, signY);
  doc.line(16, signY - 4, 60, signY - 4);

  doc.text('Principal / Headmaster Signature & Stamp', 220, signY);
  doc.line(216, signY - 4, 275, signY - 4);

  const filename = `Monthly_Register_Class_${monthlyData.studentClass}_${monthlyData.year}_${monthlyData.month}.pdf`;
  const blob = doc.output('blob');
  return saveOrShareFile(blob, filename, 'application/pdf');
};

export const generateMonthlyExcel = async (monthlyData, schoolInfo = {}) => {
  if (!monthlyData || !monthlyData.studentRows || monthlyData.studentRows.length === 0) {
    alert('No monthly register records available to export.');
    return;
  }

  const schoolName = schoolInfo.schoolName || 'ClassSathi Academy (Class 9 & 10)';
  const daysInMonth = monthlyData.daysInMonth;

  const headerRow = ['Roll No', 'Student Name', "Father's Name"];
  for (let d = 1; d <= daysInMonth; d++) {
    headerRow.push(`Day ${d}`);
  }
  headerRow.push('Total Present', 'Total Absent', 'Total Late', 'Total Leave', 'Attendance %');

  const metaRows = [
    ['SCHOOL NAME:', schoolName],
    ['REPORT:', 'MONTHLY ATTENDANCE REGISTER'],
    ['CLASS:', `Class ${monthlyData.studentClass}`],
    ['MONTH / YEAR:', `${monthlyData.month} / ${monthlyData.year}`],
    ['RECORDED WORKING DAYS:', monthlyData.totalWorkingDaysRecorded],
    ['TOTAL STUDENTS:', monthlyData.studentsCount],
    [], // spacing
    headerRow
  ];

  const studentRows = monthlyData.studentRows.map((s) => {
    const row = [s.rollNo, s.name, s.fatherName];
    for (let d = 1; d <= daysInMonth; d++) {
      const dayData = s.dailyStatus[d];
      if (!dayData) row.push('-');
      else row.push(dayData.status);
    }
    row.push(
      s.summary.present,
      s.summary.absent,
      s.summary.late,
      s.summary.leave,
      `${s.summary.percentage}%`
    );
    return row;
  });

  const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, ...studentRows]);

  // Set widths
  const cols = [{ wch: 10 }, { wch: 25 }, { wch: 25 }];
  for (let d = 1; d <= daysInMonth; d++) {
    cols.push({ wch: 6 });
  }
  cols.push({ wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 14 });
  worksheet['!cols'] = cols;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Register');

  const filename = `Monthly_Register_Class_${monthlyData.studentClass}_${monthlyData.year}_${monthlyData.month}.xlsx`;
  const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  return saveOrShareFile(blob, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
};
