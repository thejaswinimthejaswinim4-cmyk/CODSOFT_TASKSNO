/**
 * Contact Validation Middleware
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PHONE_CHAR_REGEX = /^\+?[0-9\s\-()]{7,25}$/;

const isValidPhone = (phone) => {
    if (typeof phone !== 'string') return false;
    const trimmed = phone.trim();
    if (!PHONE_CHAR_REGEX.test(trimmed)) return false;
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

const isValidEmail = (email) => {
    if (typeof email !== 'string') return false;
    return EMAIL_REGEX.test(email.trim());
};

/**
 * Validate Contact Creation (POST /api/contacts)
 */
const validateCreateContact = (req, res, next) => {
    const { name, email, phone, address, company } = req.body;
    const errors = [];

    // Validate Name
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
        errors.push({ field: 'name', message: 'Name is required and cannot be empty.' });
    } else if (name.trim().length < 2 || name.trim().length > 100) {
        errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters.' });
    }

    // Validate Email
    if (!email || typeof email !== 'string' || email.trim().length === 0) {
        errors.push({ field: 'email', message: 'Email is required and cannot be empty.' });
    } else if (!isValidEmail(email)) {
        errors.push({ field: 'email', message: 'Please provide a valid email address (e.g. user@example.com).' });
    }

    // Validate Phone
    if (!phone || typeof phone !== 'string' || phone.trim().length === 0) {
        errors.push({ field: 'phone', message: 'Phone number is required and cannot be empty.' });
    } else if (!isValidPhone(phone)) {
        errors.push({ field: 'phone', message: 'Please provide a valid phone number (at least 7 digits, allowed characters: numbers, +, -, (), space).' });
    }

    // Validate Address (Optional)
    if (address !== undefined && address !== null) {
        if (typeof address !== 'string') {
            errors.push({ field: 'address', message: 'Address must be a string.' });
        } else if (address.length > 255) {
            errors.push({ field: 'address', message: 'Address must not exceed 255 characters.' });
        }
    }

    // Validate Company (Optional)
    if (company !== undefined && company !== null) {
        if (typeof company !== 'string') {
            errors.push({ field: 'company', message: 'Company must be a string.' });
        } else if (company.length > 100) {
            errors.push({ field: 'company', message: 'Company must not exceed 100 characters.' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate Contact Update (PUT /api/contacts/:id)
 */
const validateUpdateContact = (req, res, next) => {
    const { name, email, phone, address, company } = req.body;
    const errors = [];

    // Check if at least one valid field is provided
    const hasAtLeastOneField =
        name !== undefined ||
        email !== undefined ||
        phone !== undefined ||
        address !== undefined ||
        company !== undefined;

    if (!hasAtLeastOneField) {
        return res.status(400).json({
            success: false,
            message: 'At least one field (name, email, phone, address, company) must be provided for update.'
        });
    }

    // Validate Name if provided
    if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
            errors.push({ field: 'name', message: 'Name cannot be empty.' });
        } else if (name.trim().length < 2 || name.trim().length > 100) {
            errors.push({ field: 'name', message: 'Name must be between 2 and 100 characters.' });
        }
    }

    // Validate Email if provided
    if (email !== undefined) {
        if (typeof email !== 'string' || email.trim().length === 0) {
            errors.push({ field: 'email', message: 'Email cannot be empty.' });
        } else if (!isValidEmail(email)) {
            errors.push({ field: 'email', message: 'Please provide a valid email address.' });
        }
    }

    // Validate Phone if provided
    if (phone !== undefined) {
        if (typeof phone !== 'string' || phone.trim().length === 0) {
            errors.push({ field: 'phone', message: 'Phone number cannot be empty.' });
        } else if (!isValidPhone(phone)) {
            errors.push({ field: 'phone', message: 'Please provide a valid phone number.' });
        }
    }

    // Validate Address if provided
    if (address !== undefined && address !== null) {
        if (typeof address !== 'string') {
            errors.push({ field: 'address', message: 'Address must be a string.' });
        } else if (address.length > 255) {
            errors.push({ field: 'address', message: 'Address must not exceed 255 characters.' });
        }
    }

    // Validate Company if provided
    if (company !== undefined && company !== null) {
        if (typeof company !== 'string') {
            errors.push({ field: 'company', message: 'Company must be a string.' });
        } else if (company.length > 100) {
            errors.push({ field: 'company', message: 'Company must not exceed 100 characters.' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors
        });
    }

    next();
};

/**
 * Validate Contact ID Route Parameter (:id)
 */
const validateContactId = (req, res, next) => {
    const { id } = req.params;
    const parsedId = parseInt(id, 10);

    if (!/^\d+$/.test(id) || isNaN(parsedId) || parsedId <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid contact ID format. ID must be a positive integer.'
        });
    }

    next();
};

/**
 * Validate Query Parameters for Pagination and Sorting
 */
const validateQueryParams = (req, res, next) => {
    const { page, limit, sortBy, order } = req.query;
    const errors = [];

    if (page !== undefined) {
        const parsedPage = parseInt(page, 10);
        if (!/^\d+$/.test(page) || isNaN(parsedPage) || parsedPage < 1) {
            errors.push({ field: 'page', message: 'Page must be a positive integer starting from 1.' });
        }
    }

    if (limit !== undefined) {
        const parsedLimit = parseInt(limit, 10);
        if (!/^\d+$/.test(limit) || isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
            errors.push({ field: 'limit', message: 'Limit must be an integer between 1 and 100.' });
        }
    }

    const allowedSortFields = ['id', 'name', 'email', 'phone', 'address', 'company', 'createdAt', 'updatedAt'];
    if (sortBy !== undefined && !allowedSortFields.includes(sortBy)) {
        errors.push({
            field: 'sortBy',
            message: `Invalid sortBy field. Allowed fields: ${allowedSortFields.join(', ')}.`
        });
    }

    if (order !== undefined) {
        const upperOrder = order.toUpperCase();
        if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
            errors.push({ field: 'order', message: 'Order must be either ASC or DESC.' });
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid query parameters',
            errors
        });
    }

    next();
};

module.exports = {
    validateCreateContact,
    validateUpdateContact,
    validateContactId,
    validateQueryParams
};
