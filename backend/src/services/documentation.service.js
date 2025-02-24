const { Documentation, DocSection, DocArticle, DocFeedback } = require('../models');
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');
const { searchIndex } = require('../utils/search');

class DocumentationService {
    constructor() {
        this.setupMarkdownRenderer();
    }

    setupMarkdownRenderer() {
        marked.setOptions({
            highlight: function(code, lang) {
                const hljs = require('highlight.js');
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            pedantic: false,
            gfm: true,
            breaks: false,
            sanitize: false,
            smartypants: false,
            xhtml: false
        });
    }

    async createDocumentation(data) {
        try {
            const documentation = await Documentation.create({
                title: data.title,
                description: data.description,
                version: data.version,
                language: data.language,
                status: 'draft',
                metadata: data.metadata
            });

            // Crear secciones iniciales
            if (data.sections) {
                await this.createSections(documentation.id, data.sections);
            }

            return documentation;
        } catch (error) {
            console.error('Error creating documentation:', error);
            throw error;
        }
    }

    async createSections(documentationId, sections) {
        try {
            for (const section of sections) {
                const docSection = await DocSection.create({
                    documentationId,
                    title: section.title,
                    order: section.order,
                    description: section.description
                });

                if (section.articles) {
                    await this.createArticles(docSection.id, section.articles);
                }
            }
        } catch (error) {
            console.error('Error creating sections:', error);
            throw error;
        }
    }

    async createArticles(sectionId, articles) {
        try {
            for (const article of articles) {
                await DocArticle.create({
                    sectionId,
                    title: article.title,
                    content: article.content,
                    order: article.order,
                    tags: article.tags,
                    author: article.author,
                    status: 'draft'
                });
            }
        } catch (error) {
            console.error('Error creating articles:', error);
            throw error;
        }
    }

    async publishArticle(articleId) {
        try {
            const article = await DocArticle.findByPk(articleId);
            if (!article) throw new Error('Article not found');

            // Procesar y validar contenido
            const processedContent = await this.processArticleContent(article.content);

            // Actualizar artículo
            await article.update({
                status: 'published',
                publishedAt: new Date(),
                processedContent
            });

            // Indexar para búsqueda
            await this.indexArticle(article);

            return article;
        } catch (error) {
            console.error('Error publishing article:', error);
            throw error;
        }
    }

    async processArticleContent(content) {
        // Convertir Markdown a HTML
        let html = marked(content);

        // Sanitizar HTML
        html = sanitizeHtml(html, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([
                'img', 'code', 'pre', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
            ]),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                'img': ['src', 'alt', 'title'],
                'code': ['class'],
                'pre': ['class']
            }
        });

        return html;
    }

    async indexArticle(article) {
        const articleData = {
            id: article.id,
            title: article.title,
            content: article.content,
            tags: article.tags,
            sectionId: article.sectionId
        };

        await searchIndex.addDocument(articleData);
    }

    async searchDocumentation(query, filters = {}) {
        try {
            const searchResults = await searchIndex.search(query, {
                fields: ['title', 'content'],
                ...filters
            });

            // Enriquecer resultados con metadatos
            const enrichedResults = await this.enrichSearchResults(searchResults);

            return enrichedResults;
        } catch (error) {
            console.error('Error searching documentation:', error);
            throw error;
        }
    }

    async enrichSearchResults(results) {
        const enriched = await Promise.all(
            results.map(async (result) => {
                const article = await DocArticle.findByPk(result.id, {
                    include: [{
                        model: DocSection,
                        include: [Documentation]
                    }]
                });

                return {
                    ...result,
                    section: article.DocSection.title,
                    documentation: article.DocSection.Documentation.title,
                    url: this.generateArticleUrl(article)
                };
            })
        );

        return enriched;
    }

    generateArticleUrl(article) {
        return `/docs/${article.DocSection.Documentation.id}/` +
               `${article.DocSection.id}/${article.id}`;
    }

    async getTableOfContents(documentationId) {
        try {
            const documentation = await Documentation.findByPk(documentationId, {
                include: [{
                    model: DocSection,
                    include: [DocArticle]
                }]
            });

            if (!documentation) throw new Error('Documentation not found');

            return this.formatTableOfContents(documentation);
        } catch (error) {
            console.error('Error getting table of contents:', error);
            throw error;
        }
    }

    formatTableOfContents(documentation) {
        return {
            title: documentation.title,
            sections: documentation.DocSections.map(section => ({
                title: section.title,
                articles: section.DocArticles.map(article => ({
                    title: article.title,
                    url: this.generateArticleUrl(article)
                }))
            }))
        };
    }

    async recordFeedback(articleId, userId, data) {
        try {
            const feedback = await DocFeedback.create({
                articleId,
                userId,
                rating: data.rating,
                comment: data.comment,
                helpful: data.helpful
            });

            // Actualizar estadísticas del artículo
            await this.updateArticleStats(articleId);

            return feedback;
        } catch (error) {
            console.error('Error recording feedback:', error);
            throw error;
        }
    }

    async updateArticleStats(articleId) {
        const stats = await DocFeedback.findAll({
            where: { articleId },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'avgRating'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalFeedback'],
                [
                    sequelize.fn('SUM', 
                    sequelize.literal('CASE WHEN helpful THEN 1 ELSE 0 END')),
                    'helpfulCount'
                ]
            ]
        });

        await DocArticle.update({
            stats: stats[0],
            lastFeedbackAt: new Date()
        }, {
            where: { id: articleId }
        });
    }

    async generatePDF(documentationId) {
        try {
            const documentation = await Documentation.findByPk(documentationId, {
                include: [{
                    model: DocSection,
                    include: [DocArticle]
                }]
            });

            if (!documentation) throw new Error('Documentation not found');

            const doc = new PDFDocument();
            const buffers = [];

            return new Promise((resolve, reject) => {
                doc.on('data', buffer => buffers.push(buffer));
                doc.on('end', () => resolve(Buffer.concat(buffers)));

                try {
                    // Portada
                    this.addCover(doc, documentation);

                    // Índice
                    this.addTableOfContents(doc, documentation);

                    // Contenido
                    this.addContent(doc, documentation);

                    doc.end();
                } catch (error) {
                    reject(error);
                }
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }

    addCover(doc, documentation) {
        doc.fontSize(24)
           .text(documentation.title, { align: 'center' })
           .fontSize(14)
           .moveDown()
           .text(documentation.description, { align: 'center' })
           .moveDown()
           .text(`Version ${documentation.version}`, { align: 'center' });
    }

    addTableOfContents(doc, documentation) {
        doc.addPage()
           .fontSize(16)
           .text('Table of Contents', { align: 'center' })
           .moveDown();

        documentation.DocSections.forEach(section => {
            doc.fontSize(14)
               .text(section.title)
               .moveDown(0.5);

            section.DocArticles.forEach(article => {
                doc.fontSize(12)
                   .text(`  • ${article.title}`)
                   .moveDown(0.25);
            });

            doc.moveDown();
        });
    }

    addContent(doc, documentation) {
        documentation.DocSections.forEach(section => {
            doc.addPage()
               .fontSize(16)
               .text(section.title, { align: 'center' })
               .moveDown();

            section.DocArticles.forEach(article => {
                doc.fontSize(14)
                   .text(article.title)
                   .moveDown()
                   .fontSize(12)
                   .text(article.processedContent)
                   .moveDown(2);
            });
        });
    }

    async exportDocumentation(documentationId, format) {
        try {
            switch (format.toLowerCase()) {
                case 'pdf':
                    return await this.generatePDF(documentationId);
                case 'html':
                    return await this.generateHTML(documentationId);
                case 'markdown':
                    return await this.generateMarkdown(documentationId);
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        } catch (error) {
            console.error('Error exporting documentation:', error);
            throw error;
        }
    }
}

module.exports = new DocumentationService();
