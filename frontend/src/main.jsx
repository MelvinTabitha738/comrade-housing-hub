import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "leaflet/dist/leaflet.css"
import { ApartmentProvider } from "./context/ApartmentContext";


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApartmentProvider>
      <App />
    </ApartmentProvider>
  </StrictMode>,
)
