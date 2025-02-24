const { Report, ReportTemplate, User, Subscription, Invoice, Transaction } = require('../models');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { sequelize } = require('../config/database');

class ReportService {
    constructor() {
        this.availableMetrics = {
            revenue: {
                name: 'Revenue',
                calculate: this.calculateRevenue.bind(this)
            },
            subscriptions: {
                name: 'Subscriptions',
                calculate: this.calculateSubscriptions.bind(this)
            },
            users: {
                name: 'Users',
                calculate: this.calculateUsers.bind(this)
            },
            transactions: {
                name: 'Transactions',
                calculate: this.calculateTransactions.bind(this)
            }
        };
    }

    async createReportTemplate(data) {
        try {
            const template = await ReportTemplate.create({
                name: data.name,
                description: data.description,
                metrics: data.metrics,
                filters: data.filters,
                groupBy: data.groupBy,
                sortBy: data.sortBy,
                format: data.format,
                schedule: data.schedule,
                recipients: data.recipients
            });

            return template;
        } catch (error) {
            console.error('Error creating report template:', error);
            throw error;
        }
    }

    async generateReport(templateId, parameters) {
        try {
            const template = await ReportTemplate.findByPk(templateId);
            if (!template) throw new Error('Report template not found');

            // Recopilar datos para cada métrica
            const reportData = await this.collectReportData(template, parameters);

            // Aplicar filtros
            const filteredData = this.applyFilters(reportData, template.filters, parameters);

            // Agrupar datos
            const groupedData = this.groupData(filteredData, template.groupBy);

            // Ordenar datos
            const sortedData = this.sortData(groupedData, template.sortBy);

            // Generar el reporte en el formato especificado
            const report = await this.formatReport(sortedData, template.format);

            // Guardar el reporte
            const savedReport = await Report.create({
                templateId,
                parameters,
                data: sortedData,
                format: template.format,
                generatedAt: new Date()
            });

            return {
                report: savedReport,
                content: report
            };
        } catch (error) {
            console.error('Error generating report:', error);
            throw error;
        }
    }

    async collectReportData(template, parameters) {
        const data = {};
        for (const metric of template.metrics) {
            if (this.availableMetrics[metric]) {
                data[metric] = await this.availableMetrics[metric].calculate(parameters);
            }
        }
        return data;
    }

    async calculateRevenue({ startDate, endDate }) {
        const revenue = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                },
                status: 'completed'
            },
            attributes: [
                [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
                [sequelize.fn('sum', sequelize.col('amount')), 'total']
            ],
            group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))]
        });

        return revenue;
    }

    async calculateSubscriptions({ startDate, endDate }) {
        const subscriptions = await Subscription.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'plan',
                'status',
                [sequelize.fn('count', '*'), 'count']
            ],
            group: ['plan', 'status']
        });

        return subscriptions;
    }

    async calculateUsers({ startDate, endDate }) {
        const users = await User.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'role',
                [sequelize.fn('count', '*'), 'count']
            ],
            group: ['role']
        });

        return users;
    }

    async calculateTransactions({ startDate, endDate }) {
        const transactions = await Transaction.findAll({
            where: {
                createdAt: {
                    [Op.between]: [startDate, endDate]
                }
            },
            attributes: [
                'type',
                'status',
                [sequelize.fn('count', '*'), 'count'],
                [sequelize.fn('sum', sequelize.col('amount')), 'total']
            ],
            group: ['type', 'status']
        });

        return transactions;
    }

    applyFilters(data, filters, parameters) {
        let filteredData = { ...data };

        for (const [key, filter] of Object.entries(filters)) {
            if (parameters[key]) {
                filteredData = this.applyFilter(filteredData, key, filter, parameters[key]);
            }
        }

        return filteredData;
    }

    applyFilter(data, key, filter, value) {
        return Object.entries(data).reduce((filtered, [metric, values]) => {
            filtered[metric] = values.filter(item => {
                switch (filter.operator) {
                    case 'equals':
                        return item[key] === value;
                    case 'contains':
                        return item[key].includes(value);
                    case 'greater':
                        return item[key] > value;
                    case 'less':
                        return item[key] < value;
                    default:
                        return true;
                }
            });
            return filtered;
        }, {});
    }

    groupData(data, groupBy) {
        if (!groupBy) return data;

        return Object.entries(data).reduce((grouped, [metric, values]) => {
            grouped[metric] = this.groupByKey(values, groupBy);
            return grouped;
        }, {});
    }

    groupByKey(array, key) {
        return array.reduce((grouped, item) => {
            const groupKey = item[key];
            grouped[groupKey] = grouped[groupKey] || [];
            grouped[groupKey].push(item);
            return grouped;
        }, {});
    }

    sortData(data, sortBy) {
        if (!sortBy) return data;

        return Object.entries(data).reduce((sorted, [metric, values]) => {
            sorted[metric] = this.sortByKey(values, sortBy);
            return sorted;
        }, {});
    }

    sortByKey(array, { key, order = 'asc' }) {
        return [...array].sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            }
            return a[key] < b[key] ? 1 : -1;
        });
    }

    async formatReport(data, format) {
        switch (format.toLowerCase()) {
            case 'csv':
                return this.generateCSV(data);
            case 'excel':
                return this.generateExcel(data);
            case 'pdf':
                return this.generatePDF(data);
            case 'json':
                return JSON.stringify(data, null, 2);
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    async generateCSV(data) {
        const parser = new Parser();
        return parser.parse(this.flattenData(data));
    }

    async generateExcel(data) {
        const workbook = new ExcelJS.Workbook();
        
        for (const [metric, values] of Object.entries(data)) {
            const worksheet = workbook.addWorksheet(metric);
            
            // Configurar encabezados
            const headers = Object.keys(values[0] || {});
            worksheet.addRow(headers);

            // Agregar datos
            values.forEach(row => {
                worksheet.addRow(headers.map(header => row[header]));
            });

            // Dar formato
            worksheet.getRow(1).font = { bold: true };
            worksheet.columns.forEach(column => {
                column.width = 15;
            });
        }

        return await workbook.xlsx.writeBuffer();
    }

    async generatePDF(data) {
        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffer => buffers.push(buffer));
        doc.on('end', () => Buffer.concat(buffers));

        // Agregar contenido al PDF
        doc.fontSize(16).text('Report', { align: 'center' });

        for (const [metric, values] of Object.entries(data)) {
            doc.moveDown()
               .fontSize(14)
               .text(metric, { underline: true });

            const table = this.createPDFTable(values);
            doc.moveDown().text(table);
        }

        doc.end();
        return Buffer.concat(buffers);
    }

    createPDFTable(data) {
        if (!data || !data.length) return '';

        const headers = Object.keys(data[0]);
        const rows = data.map(row => headers.map(header => row[header]));

        return [
            headers.join('\t'),
            ...rows.map(row => row.join('\t'))
        ].join('\n');
    }

    flattenData(data) {
        return Object.entries(data).reduce((flattened, [metric, values]) => {
            return [...flattened, ...values.map(value => ({ metric, ...value }))];
        }, []);
    }

    async scheduleReport(templateId, schedule) {
        try {
            const template = await ReportTemplate.findByPk(templateId);
            if (!template) throw new Error('Report template not found');

            await template.update({ schedule });

            // Programar la generación del reporte
            this.scheduleReportGeneration(template);

            return template;
        } catch (error) {
            console.error('Error scheduling report:', error);
            throw error;
        }
    }

    scheduleReportGeneration(template) {
        const { schedule } = template;

        cron.schedule(schedule, async () => {
            try {
                const report = await this.generateReport(template.id, {
                    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
                    endDate: new Date()
                });

                // Enviar reporte a los destinatarios
                for (const recipient of template.recipients) {
                    await this.sendReport(report, recipient);
                }
            } catch (error) {
                console.error('Error in scheduled report generation:', error);
            }
        });
    }

    async sendReport(report, recipient) {
        try {
            await sendEmail({
                to: recipient.email,
                template: 'report_delivery',
                data: {
                    reportName: report.report.name,
                    generatedAt: report.report.generatedAt
                },
                attachments: [{
                    filename: `report.${report.report.format}`,
                    content: report.content
                }]
            });
        } catch (error) {
            console.error('Error sending report:', error);
            throw error;
        }
    }
}

module.exports = new ReportService();
