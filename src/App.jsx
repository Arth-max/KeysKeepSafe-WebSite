import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/home/Login.jsx"
import Tela from "./pages/home/tela.jsx" 

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tela" element={<Tela />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App