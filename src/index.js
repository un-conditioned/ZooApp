// React client side application in JSX

//Output to /public main.js file using the webpack extension, as the browser will understand just the javascript.
// React
//react-dom for the client side rendering 

// @babel/core 
// @babel/preset-react
//  babel-loader 
//  webpack  -> bundle our jsx and convert to js that browser understands
//  webpack-cli 
//  webpack-node-externals 
//  npm-run-all

import React, { useState, useEffect } from 'react'; //Use of destructuring to use the componets of React as shortcuts 
import { createRoot } from "react-dom/client" // Used to export the app to use it in a view 

import Axios from 'axios'; // Used to send or receive the data from Mongo DB

import CreateNewForm from './components/CreateNewForm'
import AnimalCard from './components/AnimalCard'

function App() {
    const [animals, setAnimals] = useState([]) //destructuring useState

    //Using useEffect with arrow function, with a list of dependencies(empty means that is will run only the first time when some changes happen)
    useEffect(() => {
        async function go() {
            const response = await Axios.get("/api/animals") //performing the get request with Axios
            setAnimals(response.data) // Assigning raw json data to the setAnimals 
        }
        go()
    }, [])

    return (
        <div className='container'>
            <p><a href='/'>&laquo; Back to Public Homepage </a></p>
            <CreateNewForm setAnimals={setAnimals} />

            <div className='animal-grid'>
                {animals.map(function (animal) {
                    return <AnimalCard key={animal._id} name={animal.name} species={animal.species} photo={animal.photo} id={animal._id} setAnimals={setAnimals} />
                })}
            </div>
        </div>

    )
}
const root = createRoot(document.querySelector("#app")) // admin.ejs : <div id="app"></div>
root.render(<App />)




























// Making a src folder, which will contain the Javascript file or the source code for the client side in JSX.
//index.js - > build our React client side application
// Webpack is taking the contents of React in index.js and converting to js into main.js and browser is rendering that.

