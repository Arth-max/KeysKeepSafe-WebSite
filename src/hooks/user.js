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

export function closeInputs() {
    document.getElementById('codigo').style.display = 'none'
    document.getElementById('Nsenha').style.display = 'none'
    document.getElementById('UpPass').style.display = 'none'
    document.getElementById('pass').style.display = 'none'
    document.getElementById('msgEsqueciSenha').textContent = ""
}

export default API