const { Invoice, InvoiceTemplate, InvoiceItem, User, Organization } = require('../models');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { formatCurrency } = require('../utils/currency');
const { calculateTaxes } = require('../utils/tax');

class CustomInvoiceService {
    async createTemplate(data) {
        try {
            const template = await InvoiceTemplate.create({
                name: data.name,
                layout: data.layout,
                style: data.style,
                sections: data.sections,
                customFields: data.customFields,
                numberFormat: data.numberFormat,
                dateFormat: data.dateFormat,
                language: data.language,
                currency: data.currency,
                taxSettings: data.taxSettings,
                header: data.header,
                footer: data.footer,
                terms: data.terms,
                logo: data.logo
            });

            return template;
        } catch (error) {
            console.error('Error creating invoice template:', error);
            throw error;
        }
    }

    async generateInvoice(templateId, data) {
        try {
            const template = await InvoiceTemplate.findByPk(templateId);
            if (!template) throw new Error('Template not found');

            // Generar número de factura único
            const invoiceNumber = await this.generateInvoiceNumber(template);

            // Calcular impuestos y totales
            const { subtotal, taxes, total } = this.calculateTotals(data.items, template.taxSettings);

            // Crear factura
            const invoice = await Invoice.create({
                templateId,
                number: invoiceNumber,
                userId: data.userId,
                organizationId: data.organizationId,
                status: 'draft',
                issueDate: new Date(),
                dueDate: this.calculateDueDate(data.paymentTerms),
                currency: template.currency,
                subtotal,
                taxes,
                total,
                notes: data.notes,
                customFields: data.customFields,
                paymentTerms: data.paymentTerms
            });

            // Crear items de la factura
            await this.createInvoiceItems(invoice.id, data.items);

            // Generar PDF
            const pdf = await this.generatePDF(invoice, template);

            return {
                invoice,
                pdf
            };
        } catch (error) {
            console.error('Error generating invoice:', error);
            throw error;
        }
    }

    async generateInvoiceNumber(template) {
        const { numberFormat } = template;
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');

        // Obtener último número de factura
        const lastInvoice = await Invoice.findOne({
            where: {
                templateId: template.id
            },
            order: [['createdAt', 'DESC']]
        });

        let sequence = 1;
        if (lastInvoice) {
            const lastNumber = lastInvoice.number;
            const match = lastNumber.match(/\d+$/);
            if (match) {
                sequence = parseInt(match[0]) + 1;
            }
        }

        return numberFormat
            .replace('{YEAR}', year)
            .replace('{MONTH}', month)
            .replace('{SEQ}', String(sequence).padStart(4, '0'));
    }

    calculateTotals(items, taxSettings) {
        const subtotal = items.reduce((sum, item) => 
            sum + (item.quantity * item.price), 0
        );

        const taxes = calculateTaxes(subtotal, taxSettings);
        const total = subtotal + taxes;

        return { subtotal, taxes, total };
    }

    calculateDueDate(paymentTerms) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + parseInt(paymentTerms));
        return dueDate;
    }

    async createInvoiceItems(invoiceId, items) {
        return await Promise.all(
            items.map(item =>
                InvoiceItem.create({
                    invoiceId,
                    description: item.description,
                    quantity: item.quantity,
                    price: item.price,
                    taxRate: item.taxRate,
                    discount: item.discount
                })
            )
        );
    }

    async generatePDF(invoice, template) {
        const doc = new PDFDocument();
        const buffers = [];

        return new Promise((resolve, reject) => {
            doc.on('data', buffer => buffers.push(buffer));
            doc.on('end', () => resolve(Buffer.concat(buffers)));

            try {
                // Aplicar estilo del template
                this.applyTemplateStyle(doc, template);

                // Agregar logo
                if (template.logo) {
                    doc.image(template.logo, 50, 50, { width: 150 });
                }

                // Agregar encabezado
                this.addHeader(doc, invoice, template);

                // Información de factura
                this.addInvoiceInfo(doc, invoice);

                // Información de cliente
                this.addClientInfo(doc, invoice);

                // Tabla de items
                this.addItemsTable(doc, invoice);

                // Totales
                this.addTotals(doc, invoice);

                // Términos y condiciones
                this.addTerms(doc, template);

                // Código QR
                this.addQRCode(doc, invoice);

                // Pie de página
                this.addFooter(doc, template);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    applyTemplateStyle(doc, template) {
        const { style } = template;
        
        // Configurar fuentes
        doc.font(style.fontFamily || 'Helvetica');
        
        // Configurar colores
        doc.fillColor(style.textColor || '#000000');
    }

    async addHeader(doc, invoice, template) {
        const { header } = template;
        const organization = await Organization.findByPk(invoice.organizationId);

        doc.fontSize(20)
           .text(header.title || 'INVOICE', 50, 50)
           .fontSize(12)
           .text(organization.name, 50, 80)
           .text(organization.address, 50, 100)
           .text(`Phone: ${organization.phone}`, 50, 120)
           .text(`Email: ${organization.email}`, 50, 140);
    }

    async addInvoiceInfo(doc, invoice) {
        doc.fontSize(12)
           .text(`Invoice Number: ${invoice.number}`, 400, 80)
           .text(`Issue Date: ${invoice.issueDate.toLocaleDateString()}`, 400, 100)
           .text(`Due Date: ${invoice.dueDate.toLocaleDateString()}`, 400, 120);
    }

    async addClientInfo(doc, invoice) {
        const client = await User.findByPk(invoice.userId);

        doc.fontSize(12)
           .text('Bill To:', 50, 200)
           .text(client.name, 50, 220)
           .text(client.address, 50, 240)
           .text(`Phone: ${client.phone}`, 50, 260)
           .text(`Email: ${client.email}`, 50, 280);
    }

    async addItemsTable(doc, invoice) {
        const items = await InvoiceItem.findAll({
            where: { invoiceId: invoice.id }
        });

        // Encabezados de tabla
        doc.fontSize(10)
           .text('Description', 50, 350)
           .text('Quantity', 300, 350)
           .text('Price', 400, 350)
           .text('Total', 500, 350);

        let y = 380;
        items.forEach(item => {
            doc.text(item.description, 50, y)
               .text(item.quantity.toString(), 300, y)
               .text(formatCurrency(item.price), 400, y)
               .text(formatCurrency(item.quantity * item.price), 500, y);
            y += 20;
        });
    }

    addTotals(doc, invoice) {
        const y = doc.y + 40;
        doc.fontSize(10)
           .text('Subtotal:', 400, y)
           .text(formatCurrency(invoice.subtotal), 500, y)
           .text('Taxes:', 400, y + 20)
           .text(formatCurrency(invoice.taxes), 500, y + 20)
           .fontSize(12)
           .text('Total:', 400, y + 40)
           .text(formatCurrency(invoice.total), 500, y + 40);
    }

    addTerms(doc, template) {
        const { terms } = template;
        if (terms) {
            doc.fontSize(10)
               .text('Terms and Conditions:', 50, doc.y + 40)
               .text(terms, 50, doc.y + 20);
        }
    }

    async addQRCode(doc, invoice) {
        try {
            const qrData = JSON.stringify({
                invoiceNumber: invoice.number,
                amount: invoice.total,
                date: invoice.issueDate
            });

            const qrCodeBuffer = await QRCode.toBuffer(qrData);
            doc.image(qrCodeBuffer, 450, doc.y + 40, { width: 100 });
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    }

    addFooter(doc, template) {
        const { footer } = template;
        if (footer) {
            doc.fontSize(8)
               .text(footer, 50, doc.page.height - 50, {
                   align: 'center',
                   width: doc.page.width - 100
               });
        }
    }

    async previewTemplate(templateId, sampleData) {
        try {
            const template = await InvoiceTemplate.findByPk(templateId);
            if (!template) throw new Error('Template not found');

            return await this.generatePDF({
                ...sampleData,
                template
            });
        } catch (error) {
            console.error('Error generating template preview:', error);
            throw error;
        }
    }

    async duplicateTemplate(templateId, newName) {
        try {
            const template = await InvoiceTemplate.findByPk(templateId);
            if (!template) throw new Error('Template not found');

            const newTemplate = await InvoiceTemplate.create({
                ...template.toJSON(),
                id: undefined,
                name: newName
            });

            return newTemplate;
        } catch (error) {
            console.error('Error duplicating template:', error);
            throw error;
        }
    }
}

module.exports = new CustomInvoiceService();
