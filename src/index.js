//JSX

import React,{useState,useEffect} from 'react'
import {createRoot} from "react-dom/client"
import Axios from 'axios';
import CreateNewForm from './components/CreateNewForm'
import AnimalCard from './components/AnimalCard'

function App(){
    const [animals,setAnimals] = useState([])

    useEffect(()=>{
        async function go(){
            const response = await Axios.get("/api/animals")
            setAnimals(response.data)
        }
        go()
    },[])

    return(
        <div className='container'>
            <p><a href='/'>&laquo; Back to Public Homepage </a></p>
            <CreateNewForm setAnimals = {setAnimals} />

            <div className='animal-grid'> 
            {animals.map(function(a){
                return <AnimalCard key={a._id} name ={a.name} animal = {a.animal} photo ={a.photo} id = {a.id} setAnimals = {setAnimals} />
            })}
            </div>
        </div>

    )
}
const root = createRoot(document.querySelector("#app"))
root.render(<App />)




























// Making a src folder, which will contain the Javascript file or the source code for the client side in JSX.
//index.js - > build our React client side application
// Webpack is taking the contents of React in index.js and converting to js into main.js and browser is rendering that.

