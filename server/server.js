const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Support both .env and config.env (as taught in the lectures)
if (fs.existsSync(path.resolve(__dirname, "../.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
} else if (fs.existsSync(path.resolve(__dirname, "../config.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../config.env") });
}

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const mongoose = require("mongoose");
const Menu = require("../models/Menu");

// Connect to MongoDB database
const DATABASE_URL = process.env.DATABASE_URL || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/restaurant";
mongoose.set("strictQuery", true);
mongoose.connect(DATABASE_URL);

const db = mongoose.connection;
db.on("error", (error) => console.error("Database connection error:", error));
db.once("open", () => console.log("Connected to Database:", DATABASE_URL));

// Load protobuf specification
const PROTO_PATH = path.resolve(__dirname, "../restaurant.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});
const restaurantProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// Helper to format Mongoose document to match Proto MenuItem
function formatMenuItem(item) {
    if (!item) return null;
    return {
        id: item._id ? item._id.toString() : (item.id || ""),
        name: item.name,
        price: Number(item.price)
    };
}

// Implement gRPC Service Functions with async/await calling MongoDB
server.addService(restaurantProto.RestaurantService.service, {
    // 1. Get All Menu Items
    getAllMenu: async (_, callback) => {
        try {
            const menuItems = await Menu.find();
            const menu = menuItems.map(formatMenuItem);
            callback(null, { menu });
        } catch (err) {
            console.error("Error in getAllMenu:", err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    // 2. Get Single Menu Item by ID
    get: async (call, callback) => {
        try {
            if (!call.request.id || !mongoose.Types.ObjectId.isValid(call.request.id)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Invalid ID format or Not found"
                });
            }
            const menuItem = await Menu.findById(call.request.id);
            if (menuItem) {
                callback(null, formatMenuItem(menuItem));
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Not found"
                });
            }
        } catch (err) {
            console.error("Error in get:", err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    // 3. Insert New Menu Item
    insert: async (call, callback) => {
        try {
            const newMenu = new Menu({
                name: call.request.name,
                price: call.request.price
            });
            const savedItem = await newMenu.save();
            console.log("New Menu created successfully in MongoDB:", savedItem._id.toString());
            callback(null, formatMenuItem(savedItem));
        } catch (err) {
            console.error("Error in insert:", err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    // 4. Update Menu Item by ID
    update: async (call, callback) => {
        try {
            if (!call.request.id || !mongoose.Types.ObjectId.isValid(call.request.id)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Invalid ID format or Not found"
                });
            }
            const updatedItem = await Menu.findByIdAndUpdate(
                call.request.id,
                {
                    name: call.request.name,
                    price: call.request.price
                },
                { new: true, runValidators: true }
            );

            if (updatedItem) {
                console.log("Menu Item updated successfully in MongoDB:", updatedItem._id.toString());
                callback(null, formatMenuItem(updatedItem));
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Not Found"
                });
            }
        } catch (err) {
            console.error("Error in update:", err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    },

    // 5. Remove Menu Item by ID
    remove: async (call, callback) => {
        try {
            if (!call.request.id || !mongoose.Types.ObjectId.isValid(call.request.id)) {
                return callback({
                    code: grpc.status.NOT_FOUND,
                    details: "Invalid ID format or Not found"
                });
            }
            const deletedItem = await Menu.findByIdAndDelete(call.request.id);
            if (deletedItem) {
                console.log("Menu Item removed successfully from MongoDB:", call.request.id);
                callback(null, {});
            } else {
                callback({
                    code: grpc.status.NOT_FOUND,
                    details: "NOT Found"
                });
            }
        } catch (err) {
            console.error("Error in remove:", err);
            callback({
                code: grpc.status.INTERNAL,
                details: err.message
            });
        }
    }
});

// Bind and start server
const GRPC_HOST = process.env.GRPC_HOST || "127.0.0.1";
const GRPC_PORT = process.env.GRPC_PORT || "30043";
const bindAddress = `${GRPC_HOST}:${GRPC_PORT}`;

server.bindAsync(bindAddress, grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error("Error binding gRPC server:", error);
        return;
    }
    console.log(`Server running at http://${bindAddress}`);
});

module.exports = server;
