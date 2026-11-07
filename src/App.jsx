import { BrowserRouter, Routes, Route } from "react-router-dom"
import Apresentation from "./pages/home/Apresentation.jsx"
import Login from "./pages/home/Login.jsx"
import Tela from "./pages/home/tela.jsx" 
import Historico from "./pages/historico/historico.jsx"

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Apresentation />} />
                <Route path="/login" element={<Login />} />
                <Route path="/tela" element={<Tela />} />
                <Route path="/historico" element={<Historico />} />
            </Routes>
        </BrowserRouter>
    )
}
export default App