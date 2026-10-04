require('dotenv').config();
const sequelize = require('./config/database');
const { Contact } = require('./models');

const sampleContacts = [
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@techcorp.com',
        phone: '+1-555-0101',
        address: '123 Silicon Valley Way, San Jose, CA',
        company: 'TechCorp Solutions'
    },
    {
        name: 'Bob Smith',
        email: 'bob.smith@globalsystems.io',
        phone: '+1-555-0102',
        address: '456 Innovation Blvd, Austin, TX',
        company: 'Global Systems'
    },
    {
        name: 'Charlie Brown',
        email: 'charlie.brown@nexusenterprises.com',
        phone: '+1-555-0103',
        address: '789 Market Street, New York, NY',
        company: 'Nexus Enterprises'
    },
    {
        name: 'Diana Prince',
        email: 'diana.prince@themysciradesign.org',
        phone: '+1-555-0104',
        address: '321 Elm Street, Seattle, WA',
        company: 'Themyscira Design'
    },
    {
        name: 'Evan Wright',
        email: 'evan.wright@peakanalytics.net',
        phone: '+1-555-0105',
        address: '654 Pine Road, Denver, CO',
        company: 'Peak Analytics'
    },
    {
        name: 'Fiona Gallagher',
        email: 'fiona.g@windycitymedia.com',
        phone: '+1-555-0106',
        address: '987 Oak Avenue, Chicago, IL',
        company: 'Windy City Media'
    }
];

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        await sequelize.sync();
        console.log('Database synchronized.');

        let createdCount = 0;
        for (const contact of sampleContacts) {
            const [record, created] = await Contact.findOrCreate({
                where: { email: contact.email },
                defaults: contact
            });

            if (created) {
                createdCount++;
                console.log(`[+] Created contact: ${record.name} (${record.email})`);
            } else {
                console.log(`[=] Contact already exists: ${record.name} (${record.email})`);
            }
        }

        console.log(`Seeding complete. Added ${createdCount} new contacts.`);
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error.message);
        process.exit(1);
    }
};

if (require.main === module) {
    seedDatabase();
}

module.exports = { sampleContacts, seedDatabase };
