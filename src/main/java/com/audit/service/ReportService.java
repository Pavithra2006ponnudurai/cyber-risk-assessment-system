package com.audit.service;

import com.audit.model.AuditRecord;
import com.audit.model.QuestionnaireResponse;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class ReportService {

    private static final Font TITLE_FONT = new Font(Font.FontFamily.HELVETICA, 20, Font.BOLD, BaseColor.BLACK);
    private static final Font HEADER_FONT = new Font(Font.FontFamily.HELVETICA, 13, Font.BOLD, new BaseColor(30, 30, 30));
    private static final Font BODY_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.NORMAL, BaseColor.DARK_GRAY);
    private static final Font LABEL_FONT = new Font(Font.FontFamily.HELVETICA, 10, Font.BOLD, BaseColor.DARK_GRAY);

    public byte[] generatePdf(AuditRecord audit) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Header bar
        PdfPTable headerTable = new PdfPTable(1);
        headerTable.setWidthPercentage(100);
        PdfPCell headerCell = new PdfPCell(new Phrase("AUDIT MANAGEMENT SYSTEM", TITLE_FONT));
        headerCell.setBackgroundColor(new BaseColor(15, 15, 15));
        headerCell.setPadding(15);
        headerCell.setBorder(Rectangle.NO_BORDER);
        headerCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        headerCell.getPhrase().getFont().setColor(BaseColor.WHITE);
        headerTable.addCell(headerCell);
        doc.add(headerTable);
        doc.add(Chunk.NEWLINE);

        // Report title
        Paragraph title = new Paragraph("AUDIT REPORT", HEADER_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(new Paragraph("Generated: " +
                audit.getSubmittedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")), BODY_FONT));
        doc.add(Chunk.NEWLINE);

        // Company Details
        doc.add(sectionTitle("1. COMPANY DETAILS"));
        doc.add(infoTable(new String[][]{
            {"Company Name", audit.getCompanyName()},
            {"Audit Type", audit.getAuditType().name()},
            {"Number of Employees", String.valueOf(audit.getNumberOfEmployees())},
            {"Compliance Level", audit.getComplianceLevel().name()},
            {"Data Sensitivity", audit.getDataSensitivity().name()},
            {"Update Frequency", audit.getUpdateFrequency().name()}
        }));
        doc.add(Chunk.NEWLINE);

        // Risk Assessment
        doc.add(sectionTitle("2. RISK ASSESSMENT"));
        BaseColor riskColor = getRiskColor(audit.getRiskLevel());
        PdfPTable riskTable = new PdfPTable(2);
        riskTable.setWidthPercentage(60);
        addRiskCell(riskTable, "Risk Score", audit.getRiskScore() + " / 100", riskColor);
        addRiskCell(riskTable, "Risk Level", audit.getRiskLevel().name(), riskColor);
        doc.add(riskTable);
        doc.add(Chunk.NEWLINE);

        // Security Controls
        doc.add(sectionTitle("3. SECURITY CONTROLS"));
        doc.add(infoTable(new String[][]{
            {"Firewall", audit.isHasFirewall() ? "✓ Enabled" : "✗ Not Implemented"},
            {"Antivirus", audit.isHasAntivirus() ? "✓ Enabled" : "✗ Not Implemented"},
            {"Encryption", audit.isHasEncryption() ? "✓ Enabled" : "✗ Not Implemented"},
            {"Multi-Factor Authentication", audit.isHasMfa() ? "✓ Enabled" : "✗ Not Implemented"},
            {"Previous Incidents", audit.isPreviousIncidents() ? "Yes" : "No"}
        }));
        doc.add(Chunk.NEWLINE);

        // Recommendations
        doc.add(sectionTitle("4. RECOMMENDATIONS"));
        String[] recs = audit.getRecommendations().split("\\|\\|");
        for (int i = 0; i < recs.length; i++) {
            Paragraph rec = new Paragraph((i + 1) + ". " + recs[i], BODY_FONT);
            rec.setSpacingAfter(5);
            doc.add(rec);
        }
        doc.add(Chunk.NEWLINE);

        // Footer
        Paragraph footer = new Paragraph("This report is confidential and intended for authorized personnel only.", BODY_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);

        doc.close();
        return out.toByteArray();
    }

    private Paragraph sectionTitle(String text) {
        Paragraph p = new Paragraph(text, HEADER_FONT);
        p.setSpacingBefore(5);
        p.setSpacingAfter(8);
        return p;
    }

    private PdfPTable infoTable(String[][] rows) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{35, 65});
        for (String[] row : rows) {
            PdfPCell label = new PdfPCell(new Phrase(row[0], LABEL_FONT));
            label.setBackgroundColor(new BaseColor(245, 245, 245));
            label.setPadding(6);
            PdfPCell value = new PdfPCell(new Phrase(row[1], BODY_FONT));
            value.setPadding(6);
            table.addCell(label);
            table.addCell(value);
        }
        return table;
    }

    private void addRiskCell(PdfPTable table, String label, String value, BaseColor color) {
        Font f = new Font(Font.FontFamily.HELVETICA, 11, Font.BOLD, color);
        PdfPCell l = new PdfPCell(new Phrase(label, LABEL_FONT));
        l.setPadding(8);
        PdfPCell v = new PdfPCell(new Phrase(value, f));
        v.setPadding(8);
        table.addCell(l);
        table.addCell(v);
    }

    private BaseColor getRiskColor(AuditRecord.RiskLevel level) {
        return switch (level) {
            case CRITICAL -> new BaseColor(180, 0, 0);
            case HIGH     -> new BaseColor(200, 80, 0);
            case MEDIUM   -> new BaseColor(180, 130, 0);
            case LOW      -> new BaseColor(0, 130, 0);
        };
    }

    private BaseColor getRiskColorByString(String level) {
        if (level == null) return BaseColor.DARK_GRAY;
        return switch (level) {
            case "CRITICAL" -> new BaseColor(180, 0, 0);
            case "HIGH"     -> new BaseColor(200, 80, 0);
            case "MEDIUM"   -> new BaseColor(180, 130, 0);
            default         -> new BaseColor(0, 130, 0);
        };
    }

    public byte[] generateQuestionnairePdf(QuestionnaireResponse q) throws DocumentException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document doc = new Document(PageSize.A4, 50, 50, 60, 60);
        PdfWriter.getInstance(doc, out);
        doc.open();

        // Header
        PdfPTable hdr = new PdfPTable(1);
        hdr.setWidthPercentage(100);
        PdfPCell hc = new PdfPCell(new Phrase("AUDIT MANAGEMENT SYSTEM", TITLE_FONT));
        hc.setBackgroundColor(new BaseColor(15, 15, 15));
        hc.setPadding(15); hc.setBorder(Rectangle.NO_BORDER);
        hc.setHorizontalAlignment(Element.ALIGN_CENTER);
        hc.getPhrase().getFont().setColor(BaseColor.WHITE);
        hdr.addCell(hc);
        doc.add(hdr);
        doc.add(Chunk.NEWLINE);

        Paragraph title = new Paragraph("SECURITY QUESTIONNAIRE REPORT", HEADER_FONT);
        title.setAlignment(Element.ALIGN_CENTER);
        doc.add(title);
        doc.add(new Paragraph("Generated: " +
                q.getSubmittedAt().format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")), BODY_FONT));
        doc.add(Chunk.NEWLINE);

        // Organization
        doc.add(sectionTitle("1. ORGANIZATION DETAILS"));
        doc.add(infoTable(new String[][]{
            {"Company Name",    q.getCompanyName()},
            {"Industry",        q.getIndustryType()},
            {"Employees",       q.getEmployeeCount()},
            {"Infrastructure",  q.getItInfrastructure()}
        }));
        doc.add(Chunk.NEWLINE);

        // Risk Summary
        doc.add(sectionTitle("2. RISK ASSESSMENT SUMMARY"));
        BaseColor rc = getRiskColorByString(q.getRiskLevel());
        PdfPTable rt = new PdfPTable(2);
        rt.setWidthPercentage(60);
        addRiskCell(rt, "Overall Risk Score", q.getRiskScore() + " / 100", rc);
        addRiskCell(rt, "Risk Level", q.getRiskLevel(), rc);
        doc.add(rt);
        doc.add(Chunk.NEWLINE);

        // Section Scores
        doc.add(sectionTitle("3. SECTION-WISE RISK BREAKDOWN"));
        if (q.getSectionScores() != null && !q.getSectionScores().isEmpty()) {
            String raw = q.getSectionScores().replaceAll("[\\[\\]]", "");
            String[] entries = raw.split("\\},\\{");
            PdfPTable st = new PdfPTable(3);
            st.setWidthPercentage(100);
            st.setWidths(new float[]{45, 20, 20});
            for (String entry : entries) {
                String section = extract(entry, "section");
                String pct     = extract(entry, "pct");
                String lvl     = extract(entry, "level");
                PdfPCell c1 = new PdfPCell(new Phrase(section, LABEL_FONT)); c1.setPadding(6);
                PdfPCell c2 = new PdfPCell(new Phrase(pct + "%", BODY_FONT)); c2.setPadding(6);
                Font lf = new Font(Font.FontFamily.HELVETICA, 9, Font.BOLD, getRiskColorByString(lvl));
                PdfPCell c3 = new PdfPCell(new Phrase(lvl, lf)); c3.setPadding(6);
                st.addCell(c1); st.addCell(c2); st.addCell(c3);
            }
            doc.add(st);
        }
        doc.add(Chunk.NEWLINE);

        // Recommendations
        doc.add(sectionTitle("4. RECOMMENDATIONS"));
        if (q.getRecommendations() != null) {
            String[] recs = q.getRecommendations().split("\\|\\|");
            for (int i = 0; i < recs.length; i++) {
                Paragraph rec = new Paragraph((i + 1) + ". " + recs[i], BODY_FONT);
                rec.setSpacingAfter(5);
                doc.add(rec);
            }
        }
        doc.add(Chunk.NEWLINE);

        Paragraph footer = new Paragraph("This report is confidential and intended for authorized personnel only.", BODY_FONT);
        footer.setAlignment(Element.ALIGN_CENTER);
        doc.add(footer);
        doc.close();
        return out.toByteArray();
    }

    private String extract(String json, String key) {
        String search = "\"" + key + "\":\"";
        int i = json.indexOf(search);
        if (i >= 0) {
            int start = i + search.length();
            int end = json.indexOf('"', start);
            return end > start ? json.substring(start, end) : "";
        }
        // numeric
        String numSearch = "\"" + key + "\":";
        i = json.indexOf(numSearch);
        if (i >= 0) {
            int start = i + numSearch.length();
            int end = start;
            while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.')) end++;
            return json.substring(start, end);
        }
        return "";
    }
}
