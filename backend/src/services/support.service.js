const { Ticket, TicketReply, User, Department } = require('../models');
const { sendEmail } = require('../utils/email');
const { createNotification } = require('../utils/notification');

class SupportService {
    async createTicket(userId, data) {
        try {
            // Validar departamento y prioridad
            const department = await Department.findByPk(data.departmentId);
            if (!department) throw new Error('Invalid department');

            // Crear ticket
            const ticket = await Ticket.create({
                userId,
                departmentId: data.departmentId,
                subject: data.subject,
                message: data.message,
                priority: data.priority || 'medium',
                status: 'open',
                attachments: data.attachments || [],
                customFields: data.customFields || {},
                tags: data.tags || []
            });

            // Asignar automáticamente según reglas del departamento
            await this.autoAssignTicket(ticket);

            // Notificar al equipo de soporte
            await this.notifySupport(ticket);

            // Enviar confirmación al cliente
            await this.sendTicketConfirmation(ticket);

            return ticket;
        } catch (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
    }

    async autoAssignTicket(ticket) {
        try {
            const department = await Department.findByPk(ticket.departmentId, {
                include: [{
                    model: User,
                    as: 'staff',
                    where: { status: 'active' }
                }]
            });

            if (!department || !department.staff.length) return;

            // Encontrar el agente con menos tickets activos
            const staffWorkload = await Promise.all(
                department.staff.map(async (staff) => {
                    const activeTickets = await Ticket.count({
                        where: {
                            assignedTo: staff.id,
                            status: ['open', 'in_progress']
                        }
                    });
                    return { staff, activeTickets };
                })
            );

            const leastBusy = staffWorkload.reduce((prev, curr) => 
                prev.activeTickets <= curr.activeTickets ? prev : curr
            );

            await ticket.update({ assignedTo: leastBusy.staff.id });
        } catch (error) {
            console.error('Error auto-assigning ticket:', error);
            throw error;
        }
    }

    async replyToTicket(ticketId, userId, data) {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) throw new Error('Ticket not found');

            // Crear respuesta
            const reply = await TicketReply.create({
                ticketId,
                userId,
                message: data.message,
                attachments: data.attachments || [],
                internal: data.internal || false
            });

            // Actualizar estado del ticket
            const newStatus = this.determineTicketStatus(data.internal, userId, ticket);
            await ticket.update({ 
                status: newStatus,
                lastReplyAt: new Date()
            });

            // Notificar a las partes involucradas
            await this.notifyTicketReply(ticket, reply);

            return reply;
        } catch (error) {
            console.error('Error replying to ticket:', error);
            throw error;
        }
    }

    determineTicketStatus(isInternal, userId, ticket) {
        if (isInternal) return ticket.status;
        
        const isStaff = userId === ticket.assignedTo;
        return isStaff ? 'awaiting_client' : 'awaiting_response';
    }

    async closeTicket(ticketId, userId, reason) {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) throw new Error('Ticket not found');

            await ticket.update({
                status: 'closed',
                closedAt: new Date(),
                closedBy: userId,
                closeReason: reason
            });

            // Enviar encuesta de satisfacción
            await this.sendSatisfactionSurvey(ticket);

            return ticket;
        } catch (error) {
            console.error('Error closing ticket:', error);
            throw error;
        }
    }

    async reopenTicket(ticketId, userId, reason) {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) throw new Error('Ticket not found');

            await ticket.update({
                status: 'reopened',
                reopenedAt: new Date(),
                reopenedBy: userId,
                reopenReason: reason
            });

            // Notificar al equipo de soporte
            await this.notifySupport(ticket);

            return ticket;
        } catch (error) {
            console.error('Error reopening ticket:', error);
            throw error;
        }
    }

    async escalateTicket(ticketId, userId, data) {
        try {
            const ticket = await Ticket.findByPk(ticketId);
            if (!ticket) throw new Error('Ticket not found');

            await ticket.update({
                priority: 'high',
                escalatedAt: new Date(),
                escalatedBy: userId,
                escalationReason: data.reason,
                escalationNotes: data.notes
            });

            // Notificar a supervisores
            await this.notifySupervisors(ticket);

            return ticket;
        } catch (error) {
            console.error('Error escalating ticket:', error);
            throw error;
        }
    }

    async getTicketStats(departmentId = null) {
        try {
            const where = departmentId ? { departmentId } : {};

            const stats = {
                total: await Ticket.count({ where }),
                byStatus: {
                    open: await Ticket.count({ where: { ...where, status: 'open' } }),
                    inProgress: await Ticket.count({ where: { ...where, status: 'in_progress' } }),
                    awaitingClient: await Ticket.count({ where: { ...where, status: 'awaiting_client' } }),
                    closed: await Ticket.count({ where: { ...where, status: 'closed' } })
                },
                byPriority: {
                    low: await Ticket.count({ where: { ...where, priority: 'low' } }),
                    medium: await Ticket.count({ where: { ...where, priority: 'medium' } }),
                    high: await Ticket.count({ where: { ...where, priority: 'high' } })
                },
                averageResponseTime: await this.calculateAverageResponseTime(where),
                averageResolutionTime: await this.calculateAverageResolutionTime(where)
            };

            return stats;
        } catch (error) {
            console.error('Error getting ticket stats:', error);
            throw error;
        }
    }

    async calculateAverageResponseTime(where) {
        // Implementar cálculo de tiempo promedio de respuesta
    }

    async calculateAverageResolutionTime(where) {
        // Implementar cálculo de tiempo promedio de resolución
    }

    async notifySupport(ticket) {
        try {
            const department = await Department.findByPk(ticket.departmentId, {
                include: [{
                    model: User,
                    as: 'staff'
                }]
            });

            // Enviar notificaciones al personal del departamento
            for (const staff of department.staff) {
                await createNotification({
                    userId: staff.id,
                    type: 'new_ticket',
                    title: 'Nuevo Ticket de Soporte',
                    message: `Ticket #${ticket.id}: ${ticket.subject}`,
                    data: { ticketId: ticket.id }
                });

                await sendEmail({
                    to: staff.email,
                    template: 'new_ticket_staff',
                    data: { ticket }
                });
            }
        } catch (error) {
            console.error('Error notifying support:', error);
        }
    }

    async notifyTicketReply(ticket, reply) {
        try {
            const isStaffReply = reply.userId === ticket.assignedTo;
            
            if (isStaffReply) {
                // Notificar al cliente
                await createNotification({
                    userId: ticket.userId,
                    type: 'ticket_reply',
                    title: 'Nueva Respuesta en tu Ticket',
                    message: `Ticket #${ticket.id}: Hay una nueva respuesta`,
                    data: { ticketId: ticket.id }
                });

                await sendEmail({
                    to: ticket.User.email,
                    template: 'ticket_reply_client',
                    data: { ticket, reply }
                });
            } else {
                // Notificar al staff
                await createNotification({
                    userId: ticket.assignedTo,
                    type: 'ticket_reply',
                    title: 'Nueva Respuesta del Cliente',
                    message: `Ticket #${ticket.id}: El cliente ha respondido`,
                    data: { ticketId: ticket.id }
                });

                await sendEmail({
                    to: ticket.AssignedTo.email,
                    template: 'ticket_reply_staff',
                    data: { ticket, reply }
                });
            }
        } catch (error) {
            console.error('Error notifying ticket reply:', error);
        }
    }

    async sendSatisfactionSurvey(ticket) {
        try {
            await sendEmail({
                to: ticket.User.email,
                template: 'satisfaction_survey',
                data: {
                    ticket,
                    surveyUrl: `${process.env.APP_URL}/survey/${ticket.id}`
                }
            });
        } catch (error) {
            console.error('Error sending satisfaction survey:', error);
        }
    }
}

module.exports = new SupportService();
