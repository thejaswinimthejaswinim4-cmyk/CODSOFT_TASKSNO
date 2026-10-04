const { Op } = require('sequelize');
const { Contact } = require('../models');

/**
 * Contact Controller handling CRUD, search, sorting, and pagination
 */

/**
 * @route   POST /api/contacts
 * @desc    Create a new contact
 */
const createContact = async (req, res, next) => {
    try {
        const { name, email, phone, address, company } = req.body;

        const trimmedName = name.trim();
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedPhone = phone.trim();
        const trimmedAddress = address !== undefined && address !== null ? address.trim() : null;
        const trimmedCompany = company !== undefined && company !== null ? company.trim() : null;

        // Check for duplicate email
        const existingEmail = await Contact.findOne({ where: { email: trimmedEmail } });
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: 'A contact with this email already exists.'
            });
        }

        // Check for duplicate phone
        const existingPhone = await Contact.findOne({ where: { phone: trimmedPhone } });
        if (existingPhone) {
            return res.status(409).json({
                success: false,
                message: 'A contact with this phone number already exists.'
            });
        }

        const newContact = await Contact.create({
            name: trimmedName,
            email: trimmedEmail,
            phone: trimmedPhone,
            address: trimmedAddress,
            company: trimmedCompany
        });

        return res.status(201).json({
            success: true,
            message: 'Contact created successfully.',
            data: newContact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/contacts
 * @desc    Get all contacts with search, sorting, and pagination
 */
const getAllContacts = async (req, res, next) => {
    try {
        const { search, name, email, phone, company, page, limit, sortBy, order } = req.query;

        const where = {};
        const andConditions = [];

        // Global search across name, email, phone, and company
        if (search && search.trim()) {
            const term = `%${search.trim()}%`;
            andConditions.push({
                [Op.or]: [
                    { name: { [Op.like]: term } },
                    { email: { [Op.like]: term } },
                    { phone: { [Op.like]: term } },
                    { company: { [Op.like]: term } }
                ]
            });
        }

        // Specific field filters
        if (name && name.trim()) {
            andConditions.push({ name: { [Op.like]: `%${name.trim()}%` } });
        }
        if (email && email.trim()) {
            andConditions.push({ email: { [Op.like]: `%${email.trim().toLowerCase()}%` } });
        }
        if (phone && phone.trim()) {
            andConditions.push({ phone: { [Op.like]: `%${phone.trim()}%` } });
        }
        if (company && company.trim()) {
            andConditions.push({ company: { [Op.like]: `%${company.trim()}%` } });
        }

        if (andConditions.length > 0) {
            where[Op.and] = andConditions;
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
        const offset = (pageNum - 1) * limitNum;

        // Sorting
        const allowedSortFields = ['id', 'name', 'email', 'phone', 'address', 'company', 'createdAt', 'updatedAt'];
        const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        const sortOrder = (order && order.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

        const { count, rows } = await Contact.findAndCountAll({
            where,
            order: [[sortField, sortOrder]],
            limit: limitNum,
            offset
        });

        const totalPages = Math.ceil(count / limitNum) || 1;

        return res.status(200).json({
            success: true,
            count: rows.length,
            total: count,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: pageNum,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            },
            data: rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/contacts/:id
 * @desc    Get single contact by ID
 */
const getContactById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found.`
            });
        }

        return res.status(200).json({
            success: true,
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/contacts/:id
 * @desc    Update a contact by ID
 */
const updateContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, address, company } = req.body;

        const contact = await Contact.findByPk(id);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found.`
            });
        }

        // Check for duplicate email if updating email
        if (email !== undefined) {
            const trimmedEmail = email.trim().toLowerCase();
            const existingEmail = await Contact.findOne({
                where: {
                    email: trimmedEmail,
                    id: { [Op.ne]: id }
                }
            });

            if (existingEmail) {
                return res.status(409).json({
                    success: false,
                    message: 'A contact with this email already exists.'
                });
            }
        }

        // Check for duplicate phone if updating phone
        if (phone !== undefined) {
            const trimmedPhone = phone.trim();
            const existingPhone = await Contact.findOne({
                where: {
                    phone: trimmedPhone,
                    id: { [Op.ne]: id }
                }
            });

            if (existingPhone) {
                return res.status(409).json({
                    success: false,
                    message: 'A contact with this phone number already exists.'
                });
            }
        }

        const updates = {};
        if (name !== undefined) updates.name = name.trim();
        if (email !== undefined) updates.email = email.trim().toLowerCase();
        if (phone !== undefined) updates.phone = phone.trim();
        if (address !== undefined) updates.address = address !== null ? address.trim() : null;
        if (company !== undefined) updates.company = company !== null ? company.trim() : null;

        await contact.update(updates);

        return res.status(200).json({
            success: true,
            message: 'Contact updated successfully.',
            data: contact
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/contacts/:id
 * @desc    Delete a contact by ID
 */
const deleteContact = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contact = await Contact.findByPk(id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: `Contact with ID ${id} not found.`
            });
        }

        await contact.destroy();

        return res.status(200).json({
            success: true,
            message: 'Contact deleted successfully.',
            data: { id: parseInt(id, 10) }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createContact,
    getAllContacts,
    getContactById,
    updateContact,
    deleteContact
};
