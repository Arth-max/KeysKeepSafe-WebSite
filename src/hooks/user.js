//Arquivo de conexão do front-end com o back-end(API)
import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8081'
})

//Intercepta o token enviado pelo backend no login
API.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem("token")

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

//verifica se o token expirou
API.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token')
            if (window.location.pathname !== '/login') {
                window.location.assign('/login')
            }
        }
        return Promise.reject(error)
    }
)

//Função para buscar logs
export async function buscarLogs() {
    const response = await API.get('/usuario/logs');
    return response.data;
}

//Abre e fecha inputs
export function OpenCloseInputs(id, tipo) {
    const ID = document.getElementById(id)
    if (!ID) return

    ID.style.display = tipo === 'close' ? 'none' : 'block'
}

//Mensagens de sucesso ou erro
export function setMsg(id, mensagem, tipo) {
    const msg = document.getElementById(id)
    if (!msg) return

    msg.style.color = tipo === 'sucesso' ? 'darkgreen' : 'darkred'
    msg.textContent = mensagem
}

//função para validar senha conforme regras
export function validarSenha(senha) {
    return (
      /\d/.test(senha) && /[A-Z]/.test(senha) && /[a-z]/.test(senha)
      && /[!@#$%^&*()\-_=+[{\]}|;:'"<>.,/?~]/.test(senha)
    )
  }

//Abre e fecha divs
export function OpenCloseDiv(id, tipo) {
    const ID = document.getElementById(id)
    if (!ID) return

    ID.style.display = tipo === 'close' ? 'none' : 'flex'
}

//Limpa mensagens
export function clearMsg(id) {
    const Cmsg = document.getElementById(id)
    if (!Cmsg) return

    Cmsg.textContent = ''
}

//Limpa inputs
export function clearInputs(id) {
    const Cinput = document.getElementById(id)
    if (!Cinput) return

    Cinput.value = ''
}

export default API