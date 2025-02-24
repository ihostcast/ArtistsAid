const { Coupon, CouponUsage, Product, User } = require('../models');
const { Op } = require('sequelize');

class CouponService {
    async createCoupon(data) {
        try {
            // Validar datos del cupón
            this.validateCouponData(data);

            // Generar código único si no se proporciona
            if (!data.code) {
                data.code = await this.generateUniqueCode();
            }

            // Crear cupón
            const coupon = await Coupon.create({
                code: data.code.toUpperCase(),
                type: data.type,
                value: data.value,
                maxUses: data.maxUses || null,
                usedCount: 0,
                minAmount: data.minAmount || 0,
                startDate: data.startDate || new Date(),
                endDate: data.endDate,
                status: 'active',
                applicableProducts: data.applicableProducts || [],
                applicableTypes: data.applicableTypes || [],
                excludedProducts: data.excludedProducts || [],
                stackable: data.stackable || false,
                oneTimeUse: data.oneTimeUse || false,
                description: data.description
            });

            return coupon;
        } catch (error) {
            console.error('Error creating coupon:', error);
            throw error;
        }
    }

    validateCouponData(data) {
        if (data.type === 'percentage' && (data.value < 0 || data.value > 100)) {
            throw new Error('Percentage discount must be between 0 and 100');
        }

        if (data.type === 'fixed' && data.value <= 0) {
            throw new Error('Fixed discount must be greater than 0');
        }

        if (data.endDate && new Date(data.endDate) <= new Date()) {
            throw new Error('End date must be in the future');
        }
    }

    async generateUniqueCode(length = 8) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        let isUnique = false;

        while (!isUnique) {
            code = '';
            for (let i = 0; i < length; i++) {
                code += characters.charAt(Math.floor(Math.random() * characters.length));
            }

            // Verificar si el código ya existe
            const existing = await Coupon.findOne({ where: { code } });
            if (!existing) {
                isUnique = true;
            }
        }

        return code;
    }

    async validateCoupon(code, userId, cart) {
        try {
            const coupon = await Coupon.findOne({
                where: {
                    code: code.toUpperCase(),
                    status: 'active'
                }
            });

            if (!coupon) {
                throw new Error('Invalid coupon code');
            }

            // Validaciones
            await this.validateCouponRestrictions(coupon, userId, cart);

            return {
                valid: true,
                coupon,
                discount: this.calculateDiscount(coupon, cart)
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    async validateCouponRestrictions(coupon, userId, cart) {
        // Verificar fecha de validez
        const now = new Date();
        if (coupon.startDate > now || (coupon.endDate && coupon.endDate < now)) {
            throw new Error('Coupon has expired or is not yet valid');
        }

        // Verificar límite de usos
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new Error('Coupon has reached maximum uses');
        }

        // Verificar uso por usuario
        if (coupon.oneTimeUse) {
            const used = await CouponUsage.findOne({
                where: { couponId: coupon.id, userId }
            });
            if (used) {
                throw new Error('Coupon has already been used by this user');
            }
        }

        // Verificar monto mínimo
        const cartTotal = this.calculateCartTotal(cart);
        if (cartTotal < coupon.minAmount) {
            throw new Error(`Order total must be at least ${coupon.minAmount}`);
        }

        // Verificar productos aplicables
        if (coupon.applicableProducts.length > 0) {
            const validProducts = cart.items.some(item => 
                coupon.applicableProducts.includes(item.productId)
            );
            if (!validProducts) {
                throw new Error('Coupon is not valid for these products');
            }
        }

        // Verificar tipos de productos aplicables
        if (coupon.applicableTypes.length > 0) {
            const products = await Product.findAll({
                where: {
                    id: cart.items.map(item => item.productId)
                }
            });

            const validTypes = products.some(product =>
                coupon.applicableTypes.includes(product.type)
            );
            if (!validTypes) {
                throw new Error('Coupon is not valid for these product types');
            }
        }

        // Verificar productos excluidos
        if (coupon.excludedProducts.length > 0) {
            const hasExcluded = cart.items.some(item =>
                coupon.excludedProducts.includes(item.productId)
            );
            if (hasExcluded) {
                throw new Error('Coupon cannot be used with some products in cart');
            }
        }
    }

    calculateDiscount(coupon, cart) {
        const cartTotal = this.calculateCartTotal(cart);
        let discount = 0;

        if (coupon.type === 'percentage') {
            discount = (cartTotal * coupon.value) / 100;
        } else if (coupon.type === 'fixed') {
            discount = coupon.value;
        }

        // Asegurar que el descuento no exceda el total
        return Math.min(discount, cartTotal);
    }

    calculateCartTotal(cart) {
        return cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }

    async applyCoupon(couponId, userId, orderId) {
        try {
            const coupon = await Coupon.findByPk(couponId);
            if (!coupon) throw new Error('Coupon not found');

            // Registrar uso del cupón
            await CouponUsage.create({
                couponId,
                userId,
                orderId,
                usedAt: new Date()
            });

            // Actualizar contador de usos
            await coupon.increment('usedCount');

            return true;
        } catch (error) {
            console.error('Error applying coupon:', error);
            throw error;
        }
    }

    async generateBulkCoupons(template, quantity) {
        try {
            const coupons = [];
            for (let i = 0; i < quantity; i++) {
                const code = await this.generateUniqueCode();
                coupons.push({
                    ...template,
                    code
                });
            }

            return await Coupon.bulkCreate(coupons);
        } catch (error) {
            console.error('Error generating bulk coupons:', error);
            throw error;
        }
    }

    async deactivateCoupon(couponId) {
        try {
            const coupon = await Coupon.findByPk(couponId);
            if (!coupon) throw new Error('Coupon not found');

            await coupon.update({ status: 'inactive' });
            return coupon;
        } catch (error) {
            console.error('Error deactivating coupon:', error);
            throw error;
        }
    }

    async getCouponStats(couponId) {
        try {
            const coupon = await Coupon.findByPk(couponId, {
                include: [{
                    model: CouponUsage,
                    include: [{ model: User }]
                }]
            });

            if (!coupon) throw new Error('Coupon not found');

            const stats = {
                totalUses: coupon.usedCount,
                remainingUses: coupon.maxUses ? coupon.maxUses - coupon.usedCount : 'unlimited',
                totalDiscount: await this.calculateTotalDiscount(coupon),
                usageByDay: await this.getUsageByDay(coupon),
                topUsers: await this.getTopUsers(coupon)
            };

            return stats;
        } catch (error) {
            console.error('Error getting coupon stats:', error);
            throw error;
        }
    }

    async calculateTotalDiscount(coupon) {
        const usages = await CouponUsage.findAll({
            where: { couponId: coupon.id },
            include: [{
                model: Order,
                attributes: ['total', 'discount']
            }]
        });

        return usages.reduce((total, usage) => total + usage.Order.discount, 0);
    }

    async getUsageByDay(coupon) {
        const usages = await CouponUsage.findAll({
            where: { couponId: coupon.id },
            attributes: [
                [sequelize.fn('date', sequelize.col('usedAt')), 'date'],
                [sequelize.fn('count', '*'), 'count']
            ],
            group: [sequelize.fn('date', sequelize.col('usedAt'))]
        });

        return usages;
    }

    async getTopUsers(coupon) {
        const usages = await CouponUsage.findAll({
            where: { couponId: coupon.id },
            include: [{ model: User, attributes: ['id', 'name', 'email'] }],
            group: ['userId'],
            attributes: [
                'userId',
                [sequelize.fn('count', '*'), 'useCount']
            ],
            order: [[sequelize.fn('count', '*'), 'DESC']],
            limit: 10
        });

        return usages;
    }
}

module.exports = new CouponService();
