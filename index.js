const express = require("express");
const app = express();
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const port = 5000;
require("dotenv").config();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nexck.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

client.connect((err) => {
  const appointmentcollections = client
    .db("doctorsPortal")
    .collection("appointment");
  const doctorCollection = client
    .db(`${process.env.DB_NAME}`)
    .collection("doctors");
  console.log("connected");

  app.post("/addappointment", (req, res) => {
    const appointment = req.body;

    appointmentcollections
      .insertOne(appointment)
      .then((result) => res.send(result.insertedCount > 0));
  });
  app.post("/appointmentByDate", (req, res) => {
    const date = req.body.date;
    const email = req.body.email;

    doctorCollection.find({ email: email }).toArray((err, doctors) => {
      const filter = { appointmentOn: date };
      if (doctors.length === 0) {
        filter.patient_email = email;
      }
      appointmentcollections.find(filter).toArray((err, documents) => {
        console.log(documents);
        res.send(documents);
      });
    });
  });
  app.get("/allPatient", (req, res) => {
    appointmentcollections.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/adddoctor", (req, res) => {
    const newDoctor = req.body;
    doctorCollection
      .insertOne(newDoctor)
      .then((result) => res.send(result.insertedCount > 0));
  });
  app.get("/getdoctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post("/isDoctor", (req, res) => {
    const email = req.body.email;
    doctorCollection
      .find({ email: req.body.email })
      .toArray((err, documents) => {
        res.send(documents.length > 0);
      });
  });
});

app.listen(port);
