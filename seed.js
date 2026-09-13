const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Support both .env and config.env
if (fs.existsSync(path.resolve(__dirname, ".env"))) {
    dotenv.config({ path: path.resolve(__dirname, ".env") });
} else if (fs.existsSync(path.resolve(__dirname, "config.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "config.env") });
}

const mongoose = require("mongoose");
const Menu = require("./models/Menu");

const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurant";

const initialMenu = [
    {
        name: "Tomyam Gung",
        price: 500
    },
    {
        name: "Somtam",
        price: 60
    },
    {
        name: "Pad-Thai",
        price: 120
    }
];

async function seedDatabase() {
    try {
        console.log("Connecting to MongoDB at:", DATABASE_URL);
        await mongoose.connect(DATABASE_URL);
        console.log("Connected to MongoDB successfully!");

        // Optional: clear existing menu collection
        await Menu.deleteMany({});
        console.log("Cleared existing menu collection.");

        const inserted = await Menu.insertMany(initialMenu);
        console.log(`Successfully seeded ${inserted.length} menu items:`);
        inserted.forEach((item, index) => {
            console.log(`  ${index + 1}. [${item._id}] ${item.name} - ${item.price} THB`);
        });

        await mongoose.connection.close();
        console.log("Database connection closed. Seeding completed!");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seedDatabase();
