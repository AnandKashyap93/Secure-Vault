const { User } = require('../models');
const bcrypt = require('bcrypt');

const seedAdmin = async () => {
    try {
        const adminEmail = "anandkumarkashyap9956@gmail.com";
        const adminPassword = "Pasword@1234";

        const existingAdmin = await User.findOne({ email: adminEmail });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                name: "Admin User",
                role: "ADMIN"
            });
            console.log("Admin account seeded successfully.");
        } else {
            let updated = false;
            // Ensure password matches the required one
            const isMatch = await bcrypt.compare(adminPassword, existingAdmin.password);
            if (!isMatch) {
                existingAdmin.password = await bcrypt.hash(adminPassword, 10);
                updated = true;
            }
            if (existingAdmin.role !== "ADMIN") {
                existingAdmin.role = "ADMIN";
                updated = true;
            }
            if (updated) {
                await existingAdmin.save();
                console.log("Admin account synchronized.");
            }
        }
    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
};

module.exports = seedAdmin;
