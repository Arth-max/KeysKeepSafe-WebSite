import Login from "../assets/login.png"
import Perfil from "../assets/perfil.png"
import Salvar from "../assets/save.png"
import Lixeira from "../assets/lixeira.png"

export const ACOES = {
    LOGIN: { rotulo: "Login Realizado", categoria: "Login", icone: Login, tom: "amarelo" },
    LOGIN_BAD: { rotulo: "Login mal-sucedido", categoria: "Login", icone: Login, tom: "vermelho" },
    IMAGEM_ADICIONADA: { rotulo: "Imagem Adicionada", categoria: "Perfil", icone: Perfil, tom: "marrom" },
    IMAGEM_DELETADA: { rotulo: "Imagem Deletada", categoria: "Perfil", icone: Lixeira, tom: "vermelho" },
    ATUALIZACAO_DE_CONTA: { rotulo: "Atualização de Conta", categoria: "Perfil", icone: Perfil, tom: "azul" },
    SENHA_ATUALIZADA: { rotulo: "Senha Atualizada", categoria: "Senha", icone: Salvar, tom: "azul" },
    SENHA_SALVA: { rotulo: "Senha Salva", categoria: "Senha", icone: Salvar, tom: "verde" },
    SENHA_DELETADA: { rotulo: "Senha Deletada", categoria: "Senha", icone: Lixeira, tom: "vermelho" }
}

export const ACAO_PADRAO = { rotulo: "Ação Desconhecida", categoria: "Desconhecida", icone: null, tom: "cinza" }
export const CATEGORIAS = [
    { id: "ALL", rotulo: "Todas as atividades" },
    { id: "PERFIL", rotulo: "Perfil" },
    { id: "LOGIN", rotulo: "Logins" },
    { id: "SENHA", rotulo: "Senhas" },
]