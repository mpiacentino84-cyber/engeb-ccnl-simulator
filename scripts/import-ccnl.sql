INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES ('ccnl_commercio', 'CCNL Commercio', 'Commercio', 'Confcommercio', 500000, 45000, 'INPS-UNIEMENS', '2024-12-31', FALSE, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();

INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES ('ccnl_metalmeccanici_industria', 'CCNL Metalmeccanici Industria', 'Metalmeccanica', 'Federmeccanica-Assistal', 1600000, 32000, 'INPS-UNIEMENS', '2024-12-31', FALSE, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();

INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES ('ccnl_edilizia_industria', 'CCNL Edilizia Industria', 'Edilizia', 'ANCE', 750000, 28000, 'INPS-UNIEMENS', '2024-12-31', FALSE, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();

INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES ('ccnl_trasporti_e_logistica', 'CCNL Trasporti e Logistica', 'Trasporti', 'Conftrasporto', 420000, 18000, 'INPS-UNIEMENS', '2024-12-31', FALSE, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();

INSERT INTO ccnls (externalId, name, sector, issuer, workerCount, companyCount, dataSource, lastUpdatedINPS, isCustom, createdBy, createdAt, updatedAt)
VALUES ('ccnl_telecomunicazioni', 'CCNL Telecomunicazioni', 'Telecomunicazioni', 'Asstel', 180000, 850, 'INPS-UNIEMENS', '2024-12-31', FALSE, NULL, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  sector = VALUES(sector),
  issuer = VALUES(issuer),
  workerCount = VALUES(workerCount),
  companyCount = VALUES(companyCount),
  dataSource = VALUES(dataSource),
  lastUpdatedINPS = VALUES(lastUpdatedINPS),
  updatedAt = NOW();