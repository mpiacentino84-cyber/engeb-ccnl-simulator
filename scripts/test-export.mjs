import { getDb } from "../server/db.js";
import { ccnls, ccnlMonthlyStats } from "../drizzle/schema.js";
import { sql, eq, and, isNull, isNotNull } from "drizzle-orm";
import * as XLSX from "xlsx";
import { writeFileSync } from "fs";

async function testExport() {
  console.log("Testing Excel export...");
  
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    return;
  }

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Top 10 CCNL
  console.log("Fetching top CCNLs...");
  const topCCNLs = await db
    .select({
      nome: ccnls.name,
      settore: ccnls.sector,
      emittente: ccnls.issuer,
      tipo: sql`CASE WHEN ${ccnls.isENGEB} = 1 THEN 'ENGEB' ELSE 'Nazionale' END`,
      lavoratori: ccnls.numeroLavoratori,
      aziende: ccnls.numeroAziende,
    })
    .from(ccnls)
    .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
    .orderBy(sql`${ccnls.numeroLavoratori} DESC`)
    .limit(10);

  console.log(`Found ${topCCNLs.length} top CCNLs`);

  const ws1 = XLSX.utils.json_to_sheet(topCCNLs);
  ws1['!cols'] = [
    { wch: 40 },
    { wch: 30 },
    { wch: 40 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, ws1, "Top 10 CCNL");

  // Generate Excel file
  console.log("Writing Excel file...");
  const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  
  console.log(`Excel buffer size: ${excelBuffer.length} bytes`);
  
  // Save to file
  writeFileSync("/home/ubuntu/test-export.xlsx", excelBuffer);
  console.log("Excel file saved to /home/ubuntu/test-export.xlsx");
  
  // Test base64 conversion
  const base64 = excelBuffer.toString("base64");
  console.log(`Base64 length: ${base64.length} characters`);
  console.log(`Base64 preview: ${base64.substring(0, 50)}...`);
  
  process.exit(0);
}

testExport().catch(console.error);
