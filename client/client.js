const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Support both .env and config.env
if (fs.existsSync(path.resolve(__dirname, "../.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
} else if (fs.existsSync(path.resolve(__dirname, "../config.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../config.env") });
}

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.resolve(__dirname, "../restaurant.proto");
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

const RestaurantService = grpc.loadPackageDefinition(packageDefinition).RestaurantService;
const GRPC_HOST = process.env.GRPC_HOST || "localhost";
const GRPC_PORT = process.env.GRPC_PORT || "30043";
const targetAddress = `${GRPC_HOST}:${GRPC_PORT}`;

const client = new RestaurantService(targetAddress, grpc.credentials.createInsecure());

module.exports = client;
