const express = require('express');
const {MongoClient, ObjectId} = require("mongodb")
let db 

//Using multer for recieveing photo with data  from the client side
const multer = require ('multer')
const upload = multer();


const sanitizeHTML = require ('sanitize-html')

const fse = require('fs-extra')
const path = require('path')
const sharp = require ('sharp');
const { fchmodSync } = require('fs');


//When the app launches, make an folder public/uploaded-photos
fse.ensureDirSync(path.join("public", "uploaded-photos"))

const app = express(); //An instance of express
app.set("view engine", "ejs")
app.set("views","./views")

app.use(express.static("public"))

app.use(express.json()); 
app.use(express.urlencoded({extended: false}))



function passwordProtected(req,res,next){
    res.set("WWW-Authenticate", "Basic realm = 'Our MERN App'")
    if (req.headers.authorization == "Basic YWRtaW46YWRtaW4=")
        next();
    else{
        console.log(req.headers.authorization) 
        res.status(401).send("Try Again")
    }
}

//Routes
app.get("/",async (req,res)=>{
    const allAnimals = await db.collection("animals").find().toArray();
    res.render("home",{allAnimals})
})

app.use(passwordProtected)

app.get("/admin", (req,res)=>{
    res.render("admin")
})

app.get("/api/animals",async (req,res)=>{
    const allAnimals = await db.collection("animals").find().toArray();
    res.json(allAnimals)
})

app.post("/create-animal", upload.single("photo"), Cleanup,  async (req,res)=>{
    if(req.file){
        const photofilename = `${Date.now()}.jpg`
        await sharp(req.file.buffer).resize(844,546).jpeg({quality:60}).toFile(path.join("public","uploaded-photos", photofilename))
        req.cleanData.photo = photofilename
    }   

app.delete("animal/:id", async (req,res)=>{
    if(typeof req.params.id != "string") req.params.id = "";
    const doc = db.collection("animals").findOne({_id: new ObjectId(req.params.id)})
    if (doc.photo){
        fse.remove( path.join("public","uploaded-photos", doc.photo) )
    }
    db.collection("animals").deleteOne({id: new ObjectId(req.params.id)})
    res.send("Good Job");
})


    console.log(req.body);

    const info = await db.collection("animals").insertOne(req.cleanData);
    const newAnimal = await db.collection("animals").findOne({_id : new ObjectId(info.insertedId)});
    res.send(info);
})

function Cleanup(req,res,next){
    if(typeof req.body.name !="string") req.body.name = ""
    if(typeof req.body.animal !="string") req.body.animal = ""
    if(typeof req.body.name !="string") req.body._id = ""

    req.cleanData = {
        name : sanitizeHTML(req.body.name.trim(), {allowedTags : [], allowedAttributes : {}}),
        animal : sanitizeHTML(req.body.name.trim(), {allowedTags : [], allowedAttributes : {}}),
    }

    next()

}

//Connecting to the Zoo-mern-App database
async function startdb(){
    const client = new MongoClient("mongodb://root:root@localhost:27017/Zoo-Mern-App?&authSource=admin");
    await client.connect();
    db = client.db();
}
startdb();



app.listen(3000);
