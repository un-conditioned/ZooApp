const express = require('express');

const { MongoClient, ObjectId } = require("mongodb")
let db; //Creating a global variable for mongodb database 

//Using multer for recieveing photo with data  from the client side
const multer = require('multer')
const upload = multer();

//Using in our cleanup function to allow specific attributes
const sanitizeHTML = require('sanitize-html')

const fse = require('fs-extra') //directory and file management 
const path = require('path') //already exists in node making the path OS independent 
const sharp = require('sharp'); //image resizing tool


//Server Side React Rendering 
const React = require("react")
const ReactDOMServer = require("react-dom/server")
const AnimalCard = require("./src/components/AnimalCard").default // Using modern ES6 format, so default is used to import in common JS


//When the app launches, make an folder public/uploaded-photos exists
fse.ensureDirSync(path.join("public", "uploaded-photos")) //csv makes the path 

const app = express(); //An instance of express
app.set("view engine", "ejs"); // Using ejs as view engine for thee express app
app.set("views", "./views") //setting the location to find views 

//Using features of the express app
app.use(express.static("public")) //making public folder accessible to our express app

app.use(express.json());  // Access the json the data being sent to the server
app.use(express.urlencoded({ extended: false })) //Access the HTML data sending a HTML form 



function passwordProtected(req, res, next) {
    res.set("WWW-Authenticate", "Basic realm = 'Our MERN App'")
    if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=")
        next();
    else {
        console.log(req.headers.authorization)
        res.status(401).send("Try Again")
    }
}

//Route for root page
app.get("/", async (req, res) => {
    const allAnimals = await db.collection("animals").find().toArray();
    const generatedHTML = ReactDOMServer.renderToString(
        <div className='container'>
            <h1> Welcome to the Zoo </h1>
            {!allAnimals.length && <p>There are no animals yet, the admin needs to add a few.</p>}
            <div className='animal-grid mb-3'>
                {allAnimals.map(animal => (
                    <AnimalCard key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} id={animal._id} readOnly={true} />
                ))}
            </div>
            <p>
                <a href="/admin">Login / manage the animal listings.</a>
            </p>
        </div>
    )
    res.render("home", {generatedHTML});
    // (template as first argument, and objects as second template)
})

app.use(passwordProtected); //Routes below this will use the passwordProtection Authentication

//Route for admin page
app.get("/admin", (req, res) => {
    res.render("admin")
})


//Route to get the raw data from the database in the form of json 
app.get("/api/animals", async (req, res) => {
    const allAnimals = await db.collection("animals").find().toArray();
    res.json(allAnimals)
})

//Post request to receive the data sent by the client 
app.post("/create-animal", upload.single("photo"), Cleanup, async (req, res) => {
    if (req.file) {
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844, 546).jpeg({ quality: 60 }).toFile(path.join("public", "uploaded-photos", photofilename))
        req.cleanData.photo = photofilename
    }

    console.log(req.body);

    const info = await db.collection("animals").insertOne(req.cleanData);
    const newAnimal = await db.collection("animals").findOne({ _id: new ObjectId(info.insertedId) });
    res.send(newAnimal);
})

app.delete("/animal/:id", async (req, res) => {
    if (typeof req.params.id != "string") req.params.id = "";
    const doc = db.collection("animals").findOne({ _id: new ObjectId(req.params.id) })
    if (doc.photo) {
        fse.remove(path.join("public", "uploaded-photos", doc.photo))
    }
    db.collection("animals").deleteOne({ _id: new ObjectId(req.params.id) })
    res.send("Good Job");
})

app.post("/update-animal", upload.single("photo"), Cleanup, async (req, res) => {
    if (req.file) {
        // if they are uploading a new photo
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844, 456).jpeg({ quality: 60 }).toFile(path.join("public", "uploaded-photos", photofilename))
        req.cleanData.photo = photofilename
        const info = await db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
        if (info.value.photo) {
            fse.remove(path.join("public", "uploaded-photos", info.value.photo))
        }
        res.send(photofilename)
    } else {
        // if they are not uploading a new photo
        db.collection("animals").findOneAndUpdate({ _id: new ObjectId(req.body._id) }, { $set: req.cleanData })
        res.send(false)
    }
})


function Cleanup(req, res, next) {
    if (typeof req.body.name != "string") req.body.name = ""
    if (typeof req.body.species != "string") req.body.species = ""
    if (typeof req.body._id != "string") req.body._id = ""

    req.cleanData = {
        name: sanitizeHTML(req.body.name.trim(), { allowedTags: [], allowedAttributes: {} }),
        species: sanitizeHTML(req.body.species.trim(), { allowedTags: [], allowedAttributes: {} }),
    }

    next()

}

//Connecting to the Zoo-mern-App database
async function startdb() {
    const client = new MongoClient("mongodb://root:root@localhost:27017/ZooApp?&authSource=admin");
    await client.connect();
    db = client.db(); // Global variable to access our database, as we declared it at the top.
    app.listen(3000);
}
startdb();




