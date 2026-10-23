//Arquivo de conexão do front-end com o back-end(API)
import axios from 'axios'

const API = axios.create({
    baseURL: 'http://localhost:8081'
})

//Mensagens de sucesso ou erro
export function setMsg(id, mensagem, tipo) {
    const msg = document.getElementById(id)
    if (!msg) return

    msg.style.color = tipo === 'sucesso' ? 'seagreen' : 'darkred'
    msg.textContent = mensagem
}

//função para validar senha conforme regras
export function validarSenha(senha) {
    return (
      /[0-9]/.test(senha) && /[A-Z]/.test(senha) && /[a-z]/.test(senha)
      && /[!@#$%^&*()\-_=+[{\]}|;:'"<>.,/?~]/.test(senha)
    )
  }

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
API.interceptors.request.use(
    (response) => {
        return response
    },
    (error) => {
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token')
            window.location.href = '/'
        }
        return Promise.reject(error)
    }
)

//Restringe urls para apenas requisições http e https
export function validarImagem(url) {
        try {
            const parseUrl = new URL(url)

            return (
                parseUrl.protocol === 'http:' || parseUrl.protocol === 'https:' 
            )
        } catch (error) {
            return "URL inválida " + error
        }
    }

//Abre e fecha inputs
export function OpenCloseInputs(id, tipo) {
    const ID = document.getElementById(id)
    if (!ID) return

    ID.style.display = tipo === 'close' ? 'none' : 'block'
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