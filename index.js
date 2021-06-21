const express = require("express");
const app = express();
const PORT = 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");
// CORS
// const cors = require("cors");

// const corsOptions = {
//   origin: "http://localhost:3000",
//   optionsSuccessStatus: 200,
// };

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

// app.use(cors(corsOptions));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("hello world");
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();

  res.send(resources);
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const resource = resources.find((item) => item.id === id);

  res.send(resource);
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  res.send(activeResource);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();

  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }

    return res.send("Data has been saved!!!");
  });
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((item) => item.id === id);

  const activeResoure = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    return res
      .status(422)
      .send("Cannot update because resource has been completed!");
  }

  resources[index] = req.body;

  /** Active resource related functionality */
  if (req.body.status === "active") {
    if (activeResoure) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }
  /** Active resource related functionality */

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }

    return res.send("Data has been updated!!!");
  });
});

app.listen(PORT, () => {
  console.log("Server is running on PORT:" + PORT);
});
