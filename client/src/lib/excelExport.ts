import ExcelJS from "exceljs";
import type { CCNL, CostCalculation } from "./ccnlData";

interface ExportData {
  ccnl1: CCNL;
  ccnl2: CCNL;
  selectedLevel1: number;
  selectedLevel2: number;
  calculation1: CostCalculation;
  calculation2: CostCalculation;
  numEmployees: number;
  monthsPerYear: number;
  isPartTime: boolean;
}

export async function generateExcelReport(data: ExportData): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ENGEB CCNL Simulator";
  workbook.created = new Date();

  // Sheet 1: Riepilogo
  const summarySheet = workbook.addWorksheet("Riepilogo", {
    properties: { tabColor: { argb: "FF3B82F6" } },
  });

  // Header
  summarySheet.mergeCells("A1:D1");
  const titleCell = summarySheet.getCell("A1");
  titleCell.value = "CONFRONTO COSTI CCNL - RIEPILOGO";
  titleCell.font = { size: 16, bold: true, color: { argb: "FF1E40AF" } };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  summarySheet.getRow(1).height = 30;

  // Parametri confronto
  summarySheet.addRow([]);
  summarySheet.addRow(["PARAMETRI CONFRONTO"]).font = { bold: true, size: 12 };
  summarySheet.addRow(["Data Analisi:", new Date().toLocaleDateString("it-IT")]);
  summarySheet.addRow(["Numero Dipendenti:", data.numEmployees]);
  summarySheet.addRow(["Mesi per Anno:", data.monthsPerYear]);
  summarySheet.addRow(["Modalità:", data.isPartTime ? "Part-Time" : "Full-Time"]);

  // CCNL 1
  summarySheet.addRow([]);
  summarySheet.addRow(["CCNL 1 - ENGEB"]).font = { bold: true, size: 12, color: { argb: "FF3B82F6" } };
  summarySheet.addRow(["Nome:", data.ccnl1.name]);
  summarySheet.addRow(["Settore:", data.ccnl1.sector]);
  summarySheet.addRow(["Emittente:", data.ccnl1.issuer]);
  summarySheet.addRow(["Livello:", data.ccnl1.levels[data.selectedLevel1].level]);
  summarySheet.addRow(["Mansione:", data.ccnl1.levels[data.selectedLevel1].description]);
  summarySheet.addRow(["Stipendio Base:", data.calculation1.baseSalary, "€/mese"]);

  // CCNL 2
  summarySheet.addRow([]);
  summarySheet.addRow(["CCNL 2 - COMPETITOR"]).font = { bold: true, size: 12, color: { argb: "FF10B981" } };
  summarySheet.addRow(["Nome:", data.ccnl2.name]);
  summarySheet.addRow(["Settore:", data.ccnl2.sector]);
  summarySheet.addRow(["Emittente:", data.ccnl2.issuer]);
  summarySheet.addRow(["Livello:", data.ccnl2.levels[data.selectedLevel2].level]);
  summarySheet.addRow(["Mansione:", data.ccnl2.levels[data.selectedLevel2].description]);
  summarySheet.addRow(["Stipendio Base:", data.calculation2.baseSalary, "€/mese"]);

  // Risultati
  summarySheet.addRow([]);
  summarySheet.addRow(["RISULTATI CONFRONTO"]).font = { bold: true, size: 12 };
  
  const totalAnnual1 = data.calculation1.totalAnnualCost * data.numEmployees * (data.monthsPerYear / 12);
  const totalAnnual2 = data.calculation2.totalAnnualCost * data.numEmployees * (data.monthsPerYear / 12);
  const savings = totalAnnual1 - totalAnnual2;
  const savingsPercentage = totalAnnual1 > 0 ? (savings / totalAnnual1) * 100 : 0;

  summarySheet.addRow(["Costo Annuale CCNL 1:", totalAnnual1.toFixed(2), "€"]);
  summarySheet.addRow(["Costo Annuale CCNL 2:", totalAnnual2.toFixed(2), "€"]);
  
  const savingsRow = summarySheet.addRow([
    savings > 0 ? "Risparmio ENGEB:" : "Maggior Costo ENGEB:",
    Math.abs(savings).toFixed(2),
    "€",
    `(${Math.abs(savingsPercentage).toFixed(2)}%)`
  ]);
  savingsRow.font = { bold: true, size: 11 };
  savingsRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: savings > 0 ? "FFD1FAE5" : "FFFEE2E2" },
  };

  // Formattazione colonne
  summarySheet.getColumn(1).width = 25;
  summarySheet.getColumn(2).width = 20;
  summarySheet.getColumn(3).width = 10;
  summarySheet.getColumn(4).width = 15;

  // Sheet 2: Confronto Costi Mensili
  const costsSheet = workbook.addWorksheet("Confronto Costi", {
    properties: { tabColor: { argb: "FF10B981" } },
  });

  // Header
  costsSheet.mergeCells("A1:D1");
  const costsTitle = costsSheet.getCell("A1");
  costsTitle.value = "CONFRONTO COSTI MENSILI PER DIPENDENTE";
  costsTitle.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
  costsTitle.alignment = { horizontal: "center", vertical: "middle" };
  costsTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  costsSheet.getRow(1).height = 25;

  // Intestazioni tabella
  costsSheet.addRow([]);
  const headerRow = costsSheet.addRow(["Voce", data.ccnl1.name, data.ccnl2.name, "Differenza"]);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF3B82F6" },
  };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 20;

  // Dati costi
  costsSheet.addRow([
    "Stipendio Base",
    data.calculation1.baseSalary,
    data.calculation2.baseSalary,
    { formula: `B4-C4` }
  ]);
  
  costsSheet.addRow([
    "TFR",
    data.calculation1.tfr,
    data.calculation2.tfr,
    { formula: `B5-C5` }
  ]);
  
  costsSheet.addRow([
    "Contributi Sociali",
    data.calculation1.socialContributions,
    data.calculation2.socialContributions,
    { formula: `B6-C6` }
  ]);
  
  costsSheet.addRow([
    "Altri Benefici",
    data.calculation1.otherBenefits,
    data.calculation2.otherBenefits,
    { formula: `B7-C7` }
  ]);

  // Totale
  const totalRow = costsSheet.addRow([
    "TOTALE MENSILE",
    { formula: `SUM(B4:B7)` },
    { formula: `SUM(C4:C7)` },
    { formula: `B8-C8` }
  ]);
  totalRow.font = { bold: true, size: 11 };
  totalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0F2FE" },
  };

  // Formattazione numeri
  ["B", "C", "D"].forEach(col => {
    for (let row = 4; row <= 8; row++) {
      const cell = costsSheet.getCell(`${col}${row}`);
      cell.numFmt = '€#,##0.00';
      cell.alignment = { horizontal: "right" };
    }
  });

  // Bordi
  for (let row = 3; row <= 8; row++) {
    for (let col = 1; col <= 4; col++) {
      const cell = costsSheet.getCell(row, col);
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    }
  }

  // Larghezza colonne
  costsSheet.getColumn(1).width = 25;
  costsSheet.getColumn(2).width = 18;
  costsSheet.getColumn(3).width = 18;
  costsSheet.getColumn(4).width = 18;

  // Sheet 3: Breakdown Annuale
  const annualSheet = workbook.addWorksheet("Analisi Annuale", {
    properties: { tabColor: { argb: "FFF59E0B" } },
  });

  // Header
  annualSheet.mergeCells("A1:E1");
  const annualTitle = annualSheet.getCell("A1");
  annualTitle.value = "ANALISI COSTI ANNUALI";
  annualTitle.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
  annualTitle.alignment = { horizontal: "center", vertical: "middle" };
  annualTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  annualSheet.getRow(1).height = 25;

  // Parametri
  annualSheet.addRow([]);
  annualSheet.addRow(["Parametri:", "", "", "", ""]);
  annualSheet.addRow(["Numero Dipendenti:", data.numEmployees]);
  annualSheet.addRow(["Mesi per Anno:", data.monthsPerYear]);

  // Tabella breakdown mensile
  annualSheet.addRow([]);
  const annualHeaderRow = annualSheet.addRow([
    "Mese",
    `${data.ccnl1.name} (Costo Mensile)`,
    `${data.ccnl1.name} (Cumulativo)`,
    `${data.ccnl2.name} (Costo Mensile)`,
    `${data.ccnl2.name} (Cumulativo)`
  ]);
  annualHeaderRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  annualHeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF59E0B" },
  };
  annualHeaderRow.alignment = { horizontal: "center", vertical: "middle" };

  const monthlyCost1 = data.calculation1.totalMonthlyCost * data.numEmployees;
  const monthlyCost2 = data.calculation2.totalMonthlyCost * data.numEmployees;

  // Dati mensili con formule
  for (let month = 1; month <= data.monthsPerYear; month++) {
    const row = annualSheet.addRow([
      `Mese ${month}`,
      monthlyCost1,
      { formula: `B${8 + month} * ${month}` },
      monthlyCost2,
      { formula: `D${8 + month} * ${month}` }
    ]);
    
    ["B", "C", "D", "E"].forEach(col => {
      const cell = row.getCell(col);
      cell.numFmt = '€#,##0.00';
      cell.alignment = { horizontal: "right" };
    });
  }

  // Totale annuale
  const lastRow = 8 + data.monthsPerYear;
  const totalAnnualRow = annualSheet.addRow([
    "TOTALE ANNUALE",
    { formula: `SUM(B9:B${lastRow})` },
    "",
    { formula: `SUM(D9:D${lastRow})` },
    ""
  ]);
  totalAnnualRow.font = { bold: true, size: 11 };
  totalAnnualRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFEF3C7" },
  };
  ["B", "D"].forEach(col => {
    const cell = totalAnnualRow.getCell(col);
    cell.numFmt = '€#,##0.00';
    cell.alignment = { horizontal: "right" };
  });

  // Risparmio
  annualSheet.addRow([]);
  const savingsAnnualRow = annualSheet.addRow([
    savings > 0 ? "RISPARMIO ANNUALE ENGEB" : "MAGGIOR COSTO ANNUALE ENGEB",
    { formula: `B${lastRow + 1}-D${lastRow + 1}` },
    "",
    "",
    ""
  ]);
  savingsAnnualRow.font = { bold: true, size: 12 };
  savingsAnnualRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: savings > 0 ? "FFD1FAE5" : "FFFEE2E2" },
  };
  savingsAnnualRow.getCell("B").numFmt = '€#,##0.00';
  savingsAnnualRow.getCell("B").alignment = { horizontal: "right" };

  // Larghezza colonne
  annualSheet.getColumn(1).width = 15;
  annualSheet.getColumn(2).width = 25;
  annualSheet.getColumn(3).width = 25;
  annualSheet.getColumn(4).width = 25;
  annualSheet.getColumn(5).width = 25;

  // Sheet 4: Contributi Dettagliati
  const contribSheet = workbook.addWorksheet("Contributi", {
    properties: { tabColor: { argb: "FFEF4444" } },
  });

  // Header
  contribSheet.mergeCells("A1:E1");
  const contribTitle = contribSheet.getCell("A1");
  contribTitle.value = "DETTAGLIO CONTRIBUTI";
  contribTitle.font = { size: 14, bold: true, color: { argb: "FF1E40AF" } };
  contribTitle.alignment = { horizontal: "center", vertical: "middle" };
  contribTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFF0F9FF" },
  };
  contribSheet.getRow(1).height = 25;

  // CCNL 1 Contributi
  contribSheet.addRow([]);
  contribSheet.addRow([`CONTRIBUTI ${data.ccnl1.name}`]).font = { bold: true, size: 12, color: { argb: "FF3B82F6" } };
  
  const contrib1HeaderRow = contribSheet.addRow(["Nome Contributo", "Importo", "Categoria", "Descrizione"]);
  contrib1HeaderRow.font = { bold: true };
  contrib1HeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0F2FE" },
  };

  data.ccnl1.contributions.forEach(contrib => {
    const row = contribSheet.addRow([
      contrib.name,
      contrib.amount,
      contrib.category,
      contrib.description
    ]);
    row.getCell(2).numFmt = '€#,##0.00';
  });

  // CCNL 2 Contributi
  contribSheet.addRow([]);
  contribSheet.addRow([`CONTRIBUTI ${data.ccnl2.name}`]).font = { bold: true, size: 12, color: { argb: "FF10B981" } };
  
  const contrib2HeaderRow = contribSheet.addRow(["Nome Contributo", "Importo", "Categoria", "Descrizione"]);
  contrib2HeaderRow.font = { bold: true };
  contrib2HeaderRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD1FAE5" },
  };

  data.ccnl2.contributions.forEach(contrib => {
    const row = contribSheet.addRow([
      contrib.name,
      contrib.amount,
      contrib.category,
      contrib.description
    ]);
    row.getCell(2).numFmt = '€#,##0.00';
  });

  // Larghezza colonne
  contribSheet.getColumn(1).width = 30;
  contribSheet.getColumn(2).width = 15;
  contribSheet.getColumn(3).width = 20;
  contribSheet.getColumn(4).width = 50;

  // Download file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Confronto_CCNL_${data.ccnl1.name.replace(/\s/g, "_")}_vs_${data.ccnl2.name.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
  link.click();
  window.URL.revokeObjectURL(url);
}
