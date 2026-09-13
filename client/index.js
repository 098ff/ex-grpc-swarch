const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Support both .env and config.env
if (fs.existsSync(path.resolve(__dirname, "../.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../.env") });
} else if (fs.existsSync(path.resolve(__dirname, "../config.env"))) {
    dotenv.config({ path: path.resolve(__dirname, "../config.env") });
}

const express = require("express");
const bodyParser = require("body-parser");
const client = require("./client");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ----------------------------------------------------
// Web UI Routes (from lecture slides)
// ----------------------------------------------------

// 1. Home Page: list all menus
app.get("/", (req, res) => {
    client.getAllMenu(null, (err, data) => {
        if (!err) {
            res.render("menu", {
                results: data.menu
            });
        } else {
            console.error("Error fetching menu items:", err);
            res.status(500).send("Error fetching menu items: " + err.details);
        }
    });
});

// 2. Save new menu item
app.post("/save", (req, res) => {
    const newMenuItem = {
        name: req.body.name,
        price: parseInt(req.body.price, 10)
    };
    client.insert(newMenuItem, (err, data) => {
        if (err) {
            console.error("Error inserting menu item:", err);
        } else {
            console.log("New Menu created successfully:", data);
        }
        res.redirect("/");
    });
});

// 3. Update existing menu item
app.post("/update", (req, res) => {
    const updateMenuItem = {
        id: req.body.id,
        name: req.body.name,
        price: parseInt(req.body.price, 10)
    };
    console.log("Update Item: %s %s %d", updateMenuItem.id, updateMenuItem.name, updateMenuItem.price);
    client.update(updateMenuItem, (err, data) => {
        if (err) {
            console.error("Error updating menu item:", err);
        } else {
            console.log("Menu Item updated successfully:", data);
        }
        res.redirect("/");
    });
});

// 4. Remove menu item
app.post("/remove", (req, res) => {
    client.remove({ id: req.body.menuItem_id }, (err, _) => {
        if (err) {
            console.error("Error removing menu item:", err);
        } else {
            console.log("Menu Item removed successfully");
        }
        res.redirect("/");
    });
});

// ----------------------------------------------------
// REST API Endpoints (Helper for Postman / API Demo)
// ----------------------------------------------------

app.get("/api/menu", (req, res) => {
    client.getAllMenu(null, (err, data) => {
        if (err) return res.status(500).json({ error: err.details });
        res.json({ success: true, data: data.menu });
    });
});

app.get("/api/menu/:id", (req, res) => {
    client.get({ id: req.params.id }, (err, data) => {
        if (err) return res.status(err.code === 5 ? 404 : 500).json({ error: err.details });
        res.json({ success: true, data });
    });
});

app.post("/api/menu", (req, res) => {
    const newMenuItem = {
        name: req.body.name,
        price: parseInt(req.body.price, 10)
    };
    client.insert(newMenuItem, (err, data) => {
        if (err) return res.status(500).json({ error: err.details });
        res.status(201).json({ success: true, data });
    });
});

app.put("/api/menu/:id", (req, res) => {
    const updateMenuItem = {
        id: req.params.id,
        name: req.body.name,
        price: parseInt(req.body.price, 10)
    };
    client.update(updateMenuItem, (err, data) => {
        if (err) return res.status(err.code === 5 ? 404 : 500).json({ error: err.details });
        res.json({ success: true, data });
    });
});

app.delete("/api/menu/:id", (req, res) => {
    client.remove({ id: req.params.id }, (err, data) => {
        if (err) return res.status(err.code === 5 ? 404 : 500).json({ error: err.details });
        res.json({
            success: true,
            message: "Menu item deleted successfully",
            deletedId: req.params.id
        });
    });
});

app.delete("/api/menu", (req, res) => {
    res.status(400).json({
        success: false,
        error: "Missing menu ID in URL. Please provide an ID, e.g. /api/menu/<id>"
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("Client Web Application running at http://localhost:%d", PORT);
});
