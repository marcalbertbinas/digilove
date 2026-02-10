import './index.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './Pages/LandingPage.jsx'
import CreateLetter from './Pages/CreateLetter.jsx'
import ViewLetter from './Pages/ViewLetter.jsx'
import CreateAnonymous from './Pages/CreateAnonymous.jsx' // Import your new page

function App() {

  
  return (
   <div>
    
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/create' element={<CreateLetter />} />
      <Route path='/letter/:id' element={<ViewLetter />} />
      <Route path='/create-anonymous' element={<CreateAnonymous />} />
    </Routes>

   </div> 
   
  )
}

export default App
