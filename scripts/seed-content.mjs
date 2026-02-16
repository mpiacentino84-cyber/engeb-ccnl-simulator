import "dotenv/config";
import mysql from "mysql2/promise";

function parseDbUrl(databaseUrl) {
  const url = new URL(databaseUrl);
  return {
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", ""),
  };
}

async function ensure(conn, sql, params) {
  await conn.execute(sql, params);
}

async function getId(conn, sql, params) {
  const [rows] = await conn.execute(sql, params);
  return rows?.[0]?.id ?? null;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("Missing DATABASE_URL. Copy .env.example to .env and set DATABASE_URL.");
    process.exit(1);
  }

  const cfg = parseDbUrl(databaseUrl);
  const conn = await mysql.createConnection({
    ...cfg,
    multipleStatements: true,
  });

  console.log("Seeding content...");

  // --- Legal Sources (example content) ---
  const existingLegalId = await getId(
    conn,
    "SELECT id FROM legal_sources WHERE title = ? AND type = ? LIMIT 1",
    ["ESEMPIO – D.Lgs. 66/2003 (orario di lavoro)", "law"]
  );

  let legalId = existingLegalId;
  if (!legalId) {
    const [res] = await conn.execute(
      `INSERT INTO legal_sources
        (title, type, issuing_body, act_number, act_date, effective_from, effective_to, source_url, summary, tags, status, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        "ESEMPIO – D.Lgs. 66/2003 (orario di lavoro)",
        "law",
        "Governo Italiano",
        "66/2003",
        "2003-04-08",
        "2003-04-29",
        null,
        "https://www.normattiva.it/",
        "ESEMPIO: quadro generale su orario di lavoro, riposi e ferie. Verificare testo vigente su Normattiva.",
        "orario,ferie,riposi",
        "published",
      ]
    );
    legalId = res.insertId;
  }

  // --- Checklist (example) ---
  const existingChecklistId = await getId(
    conn,
    "SELECT id FROM toolkit_checklists WHERE title = ? LIMIT 1",
    ["Assunzione – Checklist operativa (ESEMPIO)"]
  );

  let checklistId = existingChecklistId;
  if (!checklistId) {
    const [res] = await conn.execute(
      `INSERT INTO toolkit_checklists (title, category, description, status, created_by_user_id, updated_at)
       VALUES (?, ?, ?, ?, NULL, NOW())`,
      [
        "Assunzione – Checklist operativa (ESEMPIO)",
        "Assunzione",
        "ESEMPIO: checklist di avvio. Adattare al caso specifico e alla normativa vigente.",
        "published",
      ]
    );
    checklistId = res.insertId;

    const items = [
      [1, "Raccogli dati anagrafici e documenti lavoratore", "Documento identità, CF, permesso di soggiorno (se applicabile)", 1],
      [2, "Verifica CCNL applicabile e inquadramento", "Definisci livello, mansione, eventuale superminimo", 1],
      [3, "Predisponi lettera/contratto e consegna informativa", "ESEMPIO: verifica obblighi informativi", 1],
      [4, "Comunicazioni obbligatorie (se applicabili)", "ESEMPIO: UNILAV e adempimenti correlati", 1],
    ];
    for (const [pos, text, notes, req] of items) {
      await ensure(
        conn,
        `INSERT INTO toolkit_checklist_items (checklist_id, position, text, notes, is_required, reference_source_id)
         VALUES (?, ?, ?, ?, ?, NULL)`,
        [checklistId, pos, text, notes, req]
      );
    }
  }

  // --- Template (example) ---
  const existingTemplateId = await getId(
    conn,
    "SELECT id FROM toolkit_templates WHERE title = ? LIMIT 1",
    ["Comunicazione assunzione (ESEMPIO)"]
  );

  let templateId = existingTemplateId;
  if (!templateId) {
    const content =
      "Oggetto: Comunicazione di assunzione\n\nSpett.le {{azienda}}\n\nSi comunica l'assunzione del/la Sig./Sig.ra {{lavoratore_nome}} (CF {{lavoratore_cf}}) con decorrenza {{data_assunzione}} e inquadramento {{inquadramento}}.\n\nCordiali saluti\n{{firmatario}}";
    const [res] = await conn.execute(
      `INSERT INTO toolkit_templates (title, category, description, status, format, content, created_by_user_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, NULL, NOW())`,
      [
        "Comunicazione assunzione (ESEMPIO)",
        "Assunzione",
        "ESEMPIO: modello base da verificare e personalizzare.",
        "published",
        "markdown",
        content,
      ]
    );
    templateId = res.insertId;

    const fields = [
      ["azienda", "Azienda", "text", 1, null, null, 0],
      ["lavoratore_nome", "Nome lavoratore", "text", 1, null, null, 1],
      ["lavoratore_cf", "Codice fiscale", "text", 1, null, null, 2],
      ["data_assunzione", "Data assunzione", "date", 1, null, null, 3],
      ["inquadramento", "Inquadramento", "text", 1, null, null, 4],
      ["firmatario", "Firmatario", "text", 1, null, null, 5],
    ];

    for (const [name, label, fieldType, required, defaultValue, helpText, position] of fields) {
      await ensure(
        conn,
        `INSERT INTO toolkit_template_fields
         (template_id, name, label, field_type, required, default_value, help_text, position)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [templateId, name, label, fieldType, required, defaultValue, helpText, position]
      );
    }
  }

  // --- Service (example) ---
  const existingServiceId = await getId(conn, "SELECT id FROM services_catalog WHERE name = ? LIMIT 1", ["ESEMPIO – Richiesta prestazione EB (bozza)"]);
  if (!existingServiceId) {
    await ensure(
      conn,
      `INSERT INTO services_catalog
       (name, category, description, eligibility, procedure, sla_days, status, created_by_user_id, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NOW())`,
      [
        "ESEMPIO – Richiesta prestazione EB (bozza)",
        "Ente bilaterale",
        "ESEMPIO: prestazione/servizio dimostrativo per test del workflow richieste.",
        "ESEMPIO: requisiti indicativi. Verificare regolamento ente bilaterale.",
        "1) Crea richiesta\n2) Carica documenti\n3) Invia\n4) Staff valuta e aggiorna stato",
        15,
        "published",
      ]
    );
  }

  await conn.end();
  console.log("Seed completed.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
