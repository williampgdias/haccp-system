import { Router } from 'express';
import PDFDocument from 'pdfkit';
import prisma from '../prisma.js';

const router = Router();

// ==========================================
// HELPER: PDF Styles & Layout Constants
// ==========================================
const COLORS = {
    primary: '#1e293b', // slate-800
    secondary: '#64748b', // slate-500
    accent: '#3b82f6', // blue-500
    success: '#22c55e', // green-500
    danger: '#ef4444', // red-500
    warning: '#f59e0b', // amber-500
    light: '#f1f5f9', // slate-100
    white: '#ffffff',
    border: '#e2e8f0', // slate-200
};

const MARGIN = 50;
const PAGE_WIDTH = 595.28; // A4
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/**
 * Draws the HACCP Pro header on each page
 */
function drawHeader(
    doc: PDFKit.PDFDocument,
    restaurantName: string,
    reportTitle: string,
) {
    // Brand bar
    doc.rect(0, 0, PAGE_WIDTH, 80).fill(COLORS.primary);

    doc.fontSize(20)
        .fill(COLORS.white)
        .font('Helvetica-Bold')
        .text('HACCP Pro', MARGIN, 20);

    doc.fontSize(9)
        .fill('#94a3b8')
        .font('Helvetica')
        .text('Kitchen Compliance Report', MARGIN, 45);

    // Restaurant name + report title
    doc.fontSize(9)
        .fill(COLORS.white)
        .font('Helvetica')
        .text(restaurantName, PAGE_WIDTH - MARGIN - 200, 20, {
            width: 200,
            align: 'right',
        });

    doc.fontSize(8)
        .fill('#94a3b8')
        .text(reportTitle, PAGE_WIDTH - MARGIN - 200, 35, {
            width: 200,
            align: 'right',
        });

    // Generated date
    doc.fontSize(7)
        .fill('#94a3b8')
        .text(
            `Generated: ${new Date().toLocaleDateString('en-IE')} at ${new Date().toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })}`,
            PAGE_WIDTH - MARGIN - 200,
            50,
            { width: 200, align: 'right' },
        );

    doc.moveDown(2);
}

/**
 * Draws a table row with alternating backgrounds
 */
function drawTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    columns: { text: string; width: number }[],
    isHeader = false,
    isEven = false,
) {
    const rowHeight = 25;

    // Background
    if (isHeader) {
        doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(COLORS.primary);
    } else if (isEven) {
        doc.rect(MARGIN, y, CONTENT_WIDTH, rowHeight).fill(COLORS.light);
    }

    // Text
    let x = MARGIN + 8;
    columns.forEach((col) => {
        doc.fontSize(isHeader ? 8 : 9)
            .fill(isHeader ? COLORS.white : COLORS.primary)
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .text(col.text, x, y + 7, {
                width: col.width - 16,
                lineBreak: false,
            });
        x += col.width;
    });

    return y + rowHeight;
}

/**
 * Checks if we need a new page and adds header if so
 */
function checkNewPage(
    doc: PDFKit.PDFDocument,
    y: number,
    restaurantName: string,
    reportTitle: string,
    threshold = 120,
): number {
    if (y > 700) {
        doc.addPage();
        drawHeader(doc, restaurantName, reportTitle);
        return 100;
    }
    return y;
}

// ==========================================
// GET /temperatures/:restaurantId
// Weekly temperature report
// ==========================================
router.get('/temperatures/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;

        // Default: last 7 days
        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate
            ? new Date(startDate as string)
            : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });
        if (!restaurant)
            return res.status(404).json({ error: 'Restaurant not found' });

        const logs = await prisma.temperatureLog.findMany({
            where: {
                restaurantId,
                createdAt: { gte: start, lte: end },
            },
            include: { equipment: true },
            orderBy: { createdAt: 'asc' },
        });

        // Build PDF
        const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
        const reportTitle = `Temperature Report: ${start.toLocaleDateString('en-IE')} – ${end.toLocaleDateString('en-IE')}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="temperatures-${restaurantId.slice(0, 8)}.pdf"`,
        );
        doc.pipe(res);

        drawHeader(doc, restaurant.name, reportTitle);

        // Summary stats
        let y = 100;
        const totalLogs = logs.length;
        const alertLogs = logs.filter(
            (l) => l.temperature > 8 || l.temperature < -25,
        );
        const avgTemp =
            totalLogs > 0
                ? (
                      logs.reduce((sum, l) => sum + l.temperature, 0) /
                      totalLogs
                  ).toFixed(1)
                : '—';

        // Summary boxes
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH / 3 - 8, 55, 6).fill(
            COLORS.light,
        );
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('TOTAL LOGS', MARGIN + 12, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(String(totalLogs), MARGIN + 12, y + 25);

        doc.roundedRect(
            MARGIN + CONTENT_WIDTH / 3 + 4,
            y,
            CONTENT_WIDTH / 3 - 8,
            55,
            6,
        ).fill(COLORS.light);
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('AVG TEMPERATURE', MARGIN + CONTENT_WIDTH / 3 + 16, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(`${avgTemp}°C`, MARGIN + CONTENT_WIDTH / 3 + 16, y + 25);

        const alertBg = alertLogs.length > 0 ? '#fef2f2' : COLORS.light;
        doc.roundedRect(
            MARGIN + (CONTENT_WIDTH / 3) * 2 + 8,
            y,
            CONTENT_WIDTH / 3 - 8,
            55,
            6,
        ).fill(alertBg);
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('ALERTS', MARGIN + (CONTENT_WIDTH / 3) * 2 + 20, y + 10);
        doc.fontSize(22)
            .fill(alertLogs.length > 0 ? COLORS.danger : COLORS.success)
            .font('Helvetica-Bold')
            .text(
                String(alertLogs.length),
                MARGIN + (CONTENT_WIDTH / 3) * 2 + 20,
                y + 25,
            );

        y += 75;

        // Table
        const tempCols = [
            { text: 'Date', width: 95 },
            { text: 'Time', width: 65 },
            { text: 'Equipment', width: 140 },
            { text: 'Temp (°C)', width: 75 },
            { text: 'Shift', width: 70 },
            { text: 'Initials', width: 50 },
        ];

        y = drawTableRow(doc, y, tempCols, true);

        logs.forEach((log, i) => {
            y = checkNewPage(doc, y, restaurant.name, reportTitle);
            const date = new Date(log.createdAt);
            const tempText = `${log.temperature}°C`;

            y = drawTableRow(
                doc,
                y,
                [
                    { text: date.toLocaleDateString('en-IE'), width: 95 },
                    {
                        text: date.toLocaleTimeString('en-IE', {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                        width: 65,
                    },
                    { text: log.equipment?.name || '—', width: 140 },
                    { text: tempText, width: 75 },
                    { text: log.timeChecked, width: 70 },
                    { text: log.initials, width: 50 },
                ],
                false,
                i % 2 === 0,
            );
        });

        // Footer
        y += 30;
        doc.fontSize(7)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text(
                'This report was generated by HACCP Pro — Digital Kitchen Compliance. All records are timestamped and tamper-evident.',
                MARGIN,
                y,
                { width: CONTENT_WIDTH, align: 'center' },
            );

        doc.end();
    } catch (error) {
        console.error('[REPORT] Temperature PDF error:', error);
        res.status(500).json({
            error: 'Failed to generate temperature report',
        });
    }
});

// ==========================================
// GET /deliveries/:restaurantId
// Monthly delivery log report
// ==========================================
router.get('/deliveries/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;

        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate
            ? new Date(startDate as string)
            : new Date(end.getFullYear(), end.getMonth(), 1);

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });
        if (!restaurant)
            return res.status(404).json({ error: 'Restaurant not found' });

        const logs = await prisma.deliveryLog.findMany({
            where: {
                restaurantId,
                createdAt: { gte: start, lte: end },
            },
            orderBy: { createdAt: 'asc' },
        });

        const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
        const reportTitle = `Delivery Log: ${start.toLocaleDateString('en-IE')} – ${end.toLocaleDateString('en-IE')}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="deliveries-${restaurantId.slice(0, 8)}.pdf"`,
        );
        doc.pipe(res);

        drawHeader(doc, restaurant.name, reportTitle);

        let y = 100;

        // Summary
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH / 2 - 4, 55, 6).fill(
            COLORS.light,
        );
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('TOTAL DELIVERIES', MARGIN + 12, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(String(logs.length), MARGIN + 12, y + 25);

        const uniqueSuppliers = [...new Set(logs.map((l) => l.supplier))]
            .length;
        doc.roundedRect(
            MARGIN + CONTENT_WIDTH / 2 + 4,
            y,
            CONTENT_WIDTH / 2 - 4,
            55,
            6,
        ).fill(COLORS.light);
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('UNIQUE SUPPLIERS', MARGIN + CONTENT_WIDTH / 2 + 16, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(
                String(uniqueSuppliers),
                MARGIN + CONTENT_WIDTH / 2 + 16,
                y + 25,
            );

        y += 75;

        const delCols = [
            { text: 'Date', width: 70 },
            { text: 'Product', width: 100 },
            { text: 'Supplier', width: 85 },
            { text: 'Batch Code', width: 75 },
            { text: 'Use By', width: 65 },
            { text: 'Temp (°C)', width: 60 },
            { text: 'By', width: 40 },
        ];

        y = drawTableRow(doc, y, delCols, true);

        logs.forEach((log, i) => {
            y = checkNewPage(doc, y, restaurant.name, reportTitle);
            const date = new Date(log.createdAt);

            y = drawTableRow(
                doc,
                y,
                [
                    { text: date.toLocaleDateString('en-IE'), width: 70 },
                    { text: log.productName, width: 100 },
                    { text: log.supplier, width: 85 },
                    { text: log.batchCode, width: 75 },
                    { text: log.useByDate || '—', width: 65 },
                    { text: `${log.temperature}°C`, width: 60 },
                    { text: log.initials, width: 40 },
                ],
                false,
                i % 2 === 0,
            );
        });

        y += 30;
        doc.fontSize(7)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text(
                'This report was generated by HACCP Pro — Digital Kitchen Compliance.',
                MARGIN,
                y,
                { width: CONTENT_WIDTH, align: 'center' },
            );

        doc.end();
    } catch (error) {
        console.error('[REPORT] Delivery PDF error:', error);
        res.status(500).json({ error: 'Failed to generate delivery report' });
    }
});

// ==========================================
// GET /cleaning/:restaurantId
// Weekly cleaning checklist report
// ==========================================
router.get('/cleaning/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;

        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate
            ? new Date(startDate as string)
            : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });
        if (!restaurant)
            return res.status(404).json({ error: 'Restaurant not found' });

        const logs = await prisma.cleaningLog.findMany({
            where: {
                restaurantId,
                createdAt: { gte: start, lte: end },
            },
            orderBy: { createdAt: 'asc' },
        });

        const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
        const reportTitle = `Cleaning Report: ${start.toLocaleDateString('en-IE')} – ${end.toLocaleDateString('en-IE')}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="cleaning-${restaurantId.slice(0, 8)}.pdf"`,
        );
        doc.pipe(res);

        drawHeader(doc, restaurant.name, reportTitle);

        let y = 100;

        // Summary
        const completed = logs.filter(
            (l) => l.status === 'Done' || l.status === 'done',
        ).length;
        const completionRate =
            logs.length > 0 ? Math.round((completed / logs.length) * 100) : 0;

        doc.roundedRect(MARGIN, y, CONTENT_WIDTH / 2 - 4, 55, 6).fill(
            COLORS.light,
        );
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('TOTAL TASKS', MARGIN + 12, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(String(logs.length), MARGIN + 12, y + 25);

        const rateBg =
            completionRate >= 90
                ? '#f0fdf4'
                : completionRate >= 70
                  ? '#fffbeb'
                  : '#fef2f2';
        doc.roundedRect(
            MARGIN + CONTENT_WIDTH / 2 + 4,
            y,
            CONTENT_WIDTH / 2 - 4,
            55,
            6,
        ).fill(rateBg);
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('COMPLETION RATE', MARGIN + CONTENT_WIDTH / 2 + 16, y + 10);
        const rateColor =
            completionRate >= 90
                ? COLORS.success
                : completionRate >= 70
                  ? COLORS.warning
                  : COLORS.danger;
        doc.fontSize(22)
            .fill(rateColor)
            .font('Helvetica-Bold')
            .text(
                `${completionRate}%`,
                MARGIN + CONTENT_WIDTH / 2 + 16,
                y + 25,
            );

        y += 75;

        const cleanCols = [
            { text: 'Date', width: 90 },
            { text: 'Area', width: 140 },
            { text: 'Status', width: 90 },
            { text: 'By', width: 60 },
            { text: 'Comments', width: 115 },
        ];

        y = drawTableRow(doc, y, cleanCols, true);

        logs.forEach((log, i) => {
            y = checkNewPage(doc, y, restaurant.name, reportTitle);
            const date = new Date(log.createdAt);

            y = drawTableRow(
                doc,
                y,
                [
                    { text: date.toLocaleDateString('en-IE'), width: 90 },
                    { text: log.area, width: 140 },
                    { text: log.status, width: 90 },
                    { text: log.initials, width: 60 },
                    { text: log.comments || '—', width: 115 },
                ],
                false,
                i % 2 === 0,
            );
        });

        y += 30;
        doc.fontSize(7)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text(
                'This report was generated by HACCP Pro — Digital Kitchen Compliance.',
                MARGIN,
                y,
                { width: CONTENT_WIDTH, align: 'center' },
            );

        doc.end();
    } catch (error) {
        console.error('[REPORT] Cleaning PDF error:', error);
        res.status(500).json({ error: 'Failed to generate cleaning report' });
    }
});

// ==========================================
// GET /cooking/:restaurantId
// Cooking & cooling logs report
// ==========================================
router.get('/cooking/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { startDate, endDate } = req.query;

        const end = endDate ? new Date(endDate as string) : new Date();
        const start = startDate
            ? new Date(startDate as string)
            : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);

        const restaurant = await prisma.restaurant.findUnique({
            where: { id: restaurantId },
        });
        if (!restaurant)
            return res.status(404).json({ error: 'Restaurant not found' });

        const logs = await prisma.cookingLog.findMany({
            where: {
                restaurantId,
                createdAt: { gte: start, lte: end },
            },
            orderBy: { createdAt: 'asc' },
        });

        const doc = new PDFDocument({ size: 'A4', margin: MARGIN });
        const reportTitle = `Cooking & Cooling Report: ${start.toLocaleDateString('en-IE')} – ${end.toLocaleDateString('en-IE')}`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="cooking-${restaurantId.slice(0, 8)}.pdf"`,
        );
        doc.pipe(res);

        drawHeader(doc, restaurant.name, reportTitle);

        let y = 100;

        // Summary
        doc.roundedRect(MARGIN, y, CONTENT_WIDTH / 2 - 4, 55, 6).fill(
            COLORS.light,
        );
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('TOTAL MEALS LOGGED', MARGIN + 12, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(String(logs.length), MARGIN + 12, y + 25);

        const withCooling = logs.filter(
            (l) => l.coolingFinishTemp !== null,
        ).length;
        doc.roundedRect(
            MARGIN + CONTENT_WIDTH / 2 + 4,
            y,
            CONTENT_WIDTH / 2 - 4,
            55,
            6,
        ).fill(COLORS.light);
        doc.fontSize(8)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text('WITH COOLING DATA', MARGIN + CONTENT_WIDTH / 2 + 16, y + 10);
        doc.fontSize(22)
            .fill(COLORS.primary)
            .font('Helvetica-Bold')
            .text(String(withCooling), MARGIN + CONTENT_WIDTH / 2 + 16, y + 25);

        y += 75;

        const cookCols = [
            { text: 'Date', width: 80 },
            { text: 'Food Item', width: 120 },
            { text: 'Cook °C', width: 65 },
            { text: 'Cook Time', width: 70 },
            { text: 'Cool End °C', width: 75 },
            { text: 'By', width: 85 },
        ];

        y = drawTableRow(doc, y, cookCols, true);

        logs.forEach((log, i) => {
            y = checkNewPage(doc, y, restaurant.name, reportTitle);
            const date = new Date(log.createdAt);

            y = drawTableRow(
                doc,
                y,
                [
                    { text: date.toLocaleDateString('en-IE'), width: 80 },
                    { text: log.foodItem, width: 120 },
                    {
                        text: log.cookTemp ? `${log.cookTemp}°C` : '—',
                        width: 65,
                    },
                    { text: log.cookTime || '—', width: 70 },
                    {
                        text: log.coolingFinishTemp
                            ? `${log.coolingFinishTemp}°C`
                            : '—',
                        width: 75,
                    },
                    { text: log.initials, width: 85 },
                ],
                false,
                i % 2 === 0,
            );
        });

        y += 30;
        doc.fontSize(7)
            .fill(COLORS.secondary)
            .font('Helvetica')
            .text(
                'This report was generated by HACCP Pro — Digital Kitchen Compliance.',
                MARGIN,
                y,
                { width: CONTENT_WIDTH, align: 'center' },
            );

        doc.end();
    } catch (error) {
        console.error('[REPORT] Cooking PDF error:', error);
        res.status(500).json({ error: 'Failed to generate cooking report' });
    }
});

export default router;
