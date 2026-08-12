# AuditPro — Intelligent Audit Management System

A full-stack web-based audit management system built with Spring Boot and vanilla JavaScript.

## Tech Stack
- **Backend**: Spring Boot 3.2, Spring Security, JWT, JPA
- **Database**: H2 (demo) / MySQL (production)
- **Frontend**: HTML, CSS, JavaScript, Chart.js
- **PDF**: iText 5

## Features
- Role-based login (Admin / Auditor / Client)
- 11-section security audit form (40+ questions)
- Weighted risk scoring (0–100)
- Smart recommendations (Critical / High / Medium / Low)
- Risk charts (Donut, Bar)
- PDF report download
- Admin panel with filters
- Dark / Light mode

## Quick Start (Demo)

### 1. Clone
```bash
git clone https://github.com/YourUsername/audit-management-system.git
cd audit-management-system
```

### 2. Set Environment Variables

**Windows (Command Prompt):**
```cmd
set AUDIT_JWT_SECRET=MySecretKeyForAuditProApp2024ChangeThis
set PORT=8080
```

**Windows (PowerShell):**
```powershell
$env:AUDIT_JWT_SECRET="MySecretKeyForAuditProApp2024ChangeThis"
$env:PORT="8080"
```

**Linux / Mac:**
```bash
export AUDIT_JWT_SECRET=MySecretKeyForAuditProApp2024ChangeThis
export PORT=8080
```

> For production with MySQL, also set:
> `AUDIT_DB_URL`, `AUDIT_DB_USER`, `AUDIT_DB_PASSWORD`, `AUDIT_DB_DRIVER`, `AUDIT_JPA_DIALECT`
> See `.env.example` for details.

### 3. Build & Run
```bash
mvn package -DskipTests
java -jar target/audit-management-1.0.0.jar
```

### 4. Open Browser
```
http://localhost:8080
```

## Demo Credentials
| Role    | Username  | Password   |
|---------|-----------|------------|
| Admin   | admin     | admin123   |
| Auditor | auditor1  | audit123   |
| Client  | client1   | client123  |

## Environment Variables Reference

| Variable           | Required | Default                        | Description                  |
|--------------------|----------|--------------------------------|------------------------------|
| `AUDIT_JWT_SECRET` | Yes      | Dev default (change in prod)   | JWT signing secret (32+ chars)|
| `AUDIT_JWT_EXPIRY` | No       | `86400000` (24h)               | Token expiry in milliseconds |
| `AUDIT_DB_URL`     | No       | H2 in-memory                   | JDBC database URL            |
| `AUDIT_DB_USER`    | No       | `sa`                           | Database username            |
| `AUDIT_DB_PASSWORD`| No       | *(empty)*                      | Database password            |
| `AUDIT_DB_DRIVER`  | No       | `org.h2.Driver`                | JDBC driver class            |
| `AUDIT_JPA_DIALECT`| No       | H2Dialect                      | Hibernate dialect            |
| `PORT`             | No       | `8080`                         | Server port                  |

## API Endpoints
| Method | Endpoint                        | Access        |
|--------|---------------------------------|---------------|
| POST   | `/api/auth/login`               | Public        |
| POST   | `/api/auth/register`            | Public        |
| POST   | `/api/audits`                   | Authenticated |
| GET    | `/api/audits`                   | Authenticated |
| GET    | `/api/audits/{id}/report`       | Authenticated |
| GET    | `/api/admin/audits`             | Admin only    |
| GET    | `/api/admin/stats`              | Admin only    |
