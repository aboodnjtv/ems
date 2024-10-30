const mongoose = require("mongoose");
const Item = require("../models/item");

mongoose.connect("mongodb://localhost:27017/ems");

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const seedDB = async () => {
  await Item.deleteMany({});
  for (let i = 0; i < 5; i++) {
    const item = new Item({
      name: "item " + i,
      image:
        "https://images.unsplash.com/photo-1621659911279-b08ce9ff421f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1964&q=80",
      cost: 10 + i,
      description:
        "Wheatgrass is the freshly sprouted first leaves of the common wheat plant, used as a food, drink, or dietary supplement. Wheatgrass is served freeze dried or fresh, and so it differs from wheat malt, which is convectively dried. Wheatgrass is allowed to grow longer and taller than wheat malt",
      lastUpdate: new Date(),
    });
    await item.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
