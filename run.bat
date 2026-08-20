@echo off
set "AUDIT_DB_URL=jdbc:mysql://localhost:3306/auditdb?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
set "AUDIT_DB_USER=root"
set "AUDIT_DB_PASSWORD=ROOT"
set "AUDIT_DB_DRIVER=com.mysql.cj.jdbc.Driver"
set "AUDIT_JPA_DIALECT=org.hibernate.dialect.MySQLDialect"
set "AUDIT_JWT_SECRET=MySecretKeyForAuditProApp2024ChangeThis"
java -jar target/audit-management-1.0.0.jar
