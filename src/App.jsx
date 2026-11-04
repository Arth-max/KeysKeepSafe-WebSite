import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/home/Login.jsx"
import Tela from "./pages/home/tela.jsx" 
import Historico from "./pages/historico/historico.jsx"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tela" element={<Tela />} />
                <Route path="/historico" element={<Historico />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App