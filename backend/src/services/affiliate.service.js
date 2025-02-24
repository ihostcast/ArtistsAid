const { User, Affiliate, Commission, Transaction } = require('../models');
const { commissions } = require('../config/products');

class AffiliateService {
    async createAffiliate(userId) {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            // Generar código de afiliado único
            const affiliateCode = await this.generateAffiliateCode(user);

            // Crear registro de afiliado
            const affiliate = await Affiliate.create({
                userId,
                code: affiliateCode,
                status: 'active',
                commissionRate: commissions.affiliate,
                paymentMethod: null,
                paymentDetails: null,
                minimumPayout: 50.00,
                balance: 0.00
            });

            return affiliate;
        } catch (error) {
            console.error('Error creating affiliate:', error);
            throw error;
        }
    }

    async generateAffiliateCode(user) {
        const baseCode = user.name.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        return `${baseCode}${randomNum}`;
    }

    async trackReferral(affiliateCode, visitorIp) {
        try {
            const affiliate = await Affiliate.findOne({
                where: { code: affiliateCode }
            });

            if (!affiliate) throw new Error('Invalid affiliate code');

            // Registrar visita
            await AffiliateVisit.create({
                affiliateId: affiliate.id,
                ipAddress: visitorIp,
                timestamp: new Date(),
                converted: false
            });

            // Establecer cookie de seguimiento
            return {
                cookieName: 'ref',
                cookieValue: affiliateCode,
                expiration: '30d'
            };
        } catch (error) {
            console.error('Error tracking referral:', error);
            throw error;
        }
    }

    async processCommission(transaction, affiliateCode) {
        try {
            const affiliate = await Affiliate.findOne({
                where: { code: affiliateCode }
            });

            if (!affiliate) return;

            // Calcular comisión
            const commissionAmount = transaction.amount * affiliate.commissionRate;

            // Crear registro de comisión
            const commission = await Commission.create({
                affiliateId: affiliate.id,
                transactionId: transaction.id,
                amount: commissionAmount,
                status: 'pending',
                clearanceDate: this.calculateClearanceDate()
            });

            // Actualizar balance del afiliado
            await affiliate.increment('balance', { by: commissionAmount });

            return commission;
        } catch (error) {
            console.error('Error processing commission:', error);
            throw error;
        }
    }

    calculateClearanceDate() {
        // Las comisiones se liberan después de 30 días
        const clearanceDate = new Date();
        clearanceDate.setDate(clearanceDate.getDate() + 30);
        return clearanceDate;
    }

    async processPayouts() {
        try {
            const eligibleAffiliates = await Affiliate.findAll({
                where: {
                    status: 'active',
                    balance: {
                        [Op.gte]: sequelize.col('minimumPayout')
                    }
                }
            });

            for (const affiliate of eligibleAffiliates) {
                await this.processSinglePayout(affiliate);
            }
        } catch (error) {
            console.error('Error processing payouts:', error);
            throw error;
        }
    }

    async processSinglePayout(affiliate) {
        const transaction = await sequelize.transaction();

        try {
            // Crear pago
            const payout = await AffiliatePayout.create({
                affiliateId: affiliate.id,
                amount: affiliate.balance,
                status: 'processing',
                paymentMethod: affiliate.paymentMethod,
                paymentDetails: affiliate.paymentDetails
            }, { transaction });

            // Procesar pago según el método
            let paymentResult;
            switch (affiliate.paymentMethod) {
                case 'paypal':
                    paymentResult = await this.processPayPalPayout(affiliate, payout);
                    break;
                case 'stripe':
                    paymentResult = await this.processStripePayout(affiliate, payout);
                    break;
                case 'bank_transfer':
                    paymentResult = await this.processBankTransfer(affiliate, payout);
                    break;
                default:
                    throw new Error('Invalid payment method');
            }

            // Actualizar estado del pago
            await payout.update({
                status: 'completed',
                transactionId: paymentResult.id,
                processedAt: new Date()
            }, { transaction });

            // Actualizar balance del afiliado
            await affiliate.update({
                balance: 0
            }, { transaction });

            await transaction.commit();
            return payout;
        } catch (error) {
            await transaction.rollback();
            console.error('Error processing payout:', error);
            throw error;
        }
    }

    async getAffiliateStats(affiliateId) {
        try {
            const affiliate = await Affiliate.findByPk(affiliateId);
            if (!affiliate) throw new Error('Affiliate not found');

            const now = new Date();
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            // Estadísticas generales
            const stats = {
                totalReferrals: await AffiliateVisit.count({
                    where: { affiliateId }
                }),
                totalConversions: await AffiliateVisit.count({
                    where: { affiliateId, converted: true }
                }),
                totalCommissions: await Commission.sum('amount', {
                    where: { affiliateId }
                }),
                monthlyStats: {
                    referrals: await AffiliateVisit.count({
                        where: {
                            affiliateId,
                            timestamp: { [Op.gte]: monthStart }
                        }
                    }),
                    conversions: await AffiliateVisit.count({
                        where: {
                            affiliateId,
                            converted: true,
                            timestamp: { [Op.gte]: monthStart }
                        }
                    }),
                    commissions: await Commission.sum('amount', {
                        where: {
                            affiliateId,
                            createdAt: { [Op.gte]: monthStart }
                        }
                    })
                },
                pendingCommissions: await Commission.sum('amount', {
                    where: {
                        affiliateId,
                        status: 'pending'
                    }
                }),
                conversionRate: 0,
                earnings: {
                    total: 0,
                    pending: 0,
                    paid: 0
                }
            };

            // Calcular tasa de conversión
            stats.conversionRate = stats.totalReferrals > 0 
                ? (stats.totalConversions / stats.totalReferrals) * 100 
                : 0;

            return stats;
        } catch (error) {
            console.error('Error getting affiliate stats:', error);
            throw error;
        }
    }

    async generateAffiliateReport(affiliateId, startDate, endDate) {
        try {
            const affiliate = await Affiliate.findByPk(affiliateId);
            if (!affiliate) throw new Error('Affiliate not found');

            const report = {
                affiliate: {
                    id: affiliate.id,
                    code: affiliate.code,
                    name: affiliate.User.name,
                    email: affiliate.User.email
                },
                period: {
                    start: startDate,
                    end: endDate
                },
                stats: await this.getAffiliateStats(affiliateId),
                transactions: await Commission.findAll({
                    where: {
                        affiliateId,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        }
                    },
                    include: [{
                        model: Transaction,
                        as: 'transaction'
                    }]
                }),
                payouts: await AffiliatePayout.findAll({
                    where: {
                        affiliateId,
                        createdAt: {
                            [Op.between]: [startDate, endDate]
                        }
                    }
                })
            };

            return report;
        } catch (error) {
            console.error('Error generating affiliate report:', error);
            throw error;
        }
    }
}

module.exports = new AffiliateService();
