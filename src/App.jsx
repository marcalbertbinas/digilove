import './index.css'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './Pages/LandingPage.jsx'
import CreateLetter from './Pages/CreateLetter.jsx'
import ViewLetter from './Pages/ViewLetter.jsx'

function App() {

  
  return (
   <div>
    
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/create' element={<CreateLetter />} />
      <Route path='/letter/:id' element={<ViewLetter />} />
    </Routes>

   </div> 
   
  )
}

export default App
