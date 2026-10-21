//importações de imagens, arquivos e funções
import './tela.css'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Config from '../../assets/Config.png'
import Edit from '../../assets/Edit.png'
import Sun from '../../assets/Sol.png'
import Moon from '../../assets/Lua.png'
import Lixeira from '../../assets/Lixeira.png'
import desverSenha from '../../assets/desverSenha.png'
import verSenha from '../../assets/verSenha.png'
import Logo from '../../assets/senha.png'
import API, { validarImagem, setMsg, OpenCloseInputs, clearMsg, clearInputs } from '../../hooks/user.js'
import { useState, useRef, useEffect } from 'react'
import Footer from '../../components/Footer/Footer.jsx'

function Tela() {
    const Location = useLocation() //Estado local
    const navigate = useNavigate() //navegador

    //Estados globais do usuário (nome, email, Imagem)
    const inicialUser = Location.state?.usuario || {}
    const [usuario, setUsuario] = useState(inicialUser)
    const [nome, setNome] = useState(inicialUser.nome ?? '')
    const [email, setEmail] = useState(inicialUser.email ?? '')
    const [backgroundImg, setBackgroundImg] = useState(inicialUser.urlImg || '')

    //Estados da tela (cards, botões, inputs, senhas, etc)
    const [loading, setLoading] = useState(false)
    const [temaClaro, setTemaClaro] = useState(false)
    const [OpenPerfil, setOpenPerfil] = useState(false)
    const [OpenConfig, setOpenConfig] = useState(false)
    const [tela, setTela] = useState(false)
    const [gerador, setGerador] = useState(false)
    const [senhasSalvas, setSenhasSalvas] = useState(false)
    const [changeTheme, setChangeTheme] = useState(false)
    const [VerSenha, setMostrarSenha] = useState(false)
    const [Sol, setSun] = useState(false)
    const [img, setImg] = useState('')
    const [senha, setSenha] = useState('')
    const [pass, setSavePass] = useState([])
    const [senhaVisivel, setSenhaVisivel] = useState(null)

    //Estados dos inputs
    const inputConfirmSenha = useRef()
    const inputDescricao = useRef()
    const [valor, setValor] = useState(8)
    const [useNumeros, setUseNumeros] = useState(false)
    const [useEspeciais, setUseEspeciais] = useState(false)
    const [useMaiusculas, setUseMaiusculas] = useState(false)
    const [useMinusculas, setUseMinusculas] = useState(false)

    //Funções relacionadas aos estados da tela\\
    //Função que atualizar o range do gerador de senhas
    const handleRange = (event) => {
        setValor(Number(event.target.value))
    }
    //Função para Deslogar o usuário
    function voltar() {
        setImg('')
        navigate('/')
        sessionStorage.removeItem('token')
    }
    //Função para mudar o tema principal do site
    function changeColor() {
        setTemaClaro(prev => !prev)
        setSun(prev => !prev)
    }
    //Abrir tela para mudar a imagem de fundo do site
    function mudarTema() {
        setChangeTheme(prev => !prev)
        setOpenConfig(false)
        clearMsg('msgImg')
    }
    //Abrir tela para editar o perfil
    function infoPerfil() {
        setOpenPerfil(true)
        setOpenConfig(false)
        setTela(false)
        setGerador(false)
    }
    //Fechar tela para editar o perfil
    function fecharInfo() {
        clearMsg('msg')
        setOpenPerfil(false)
    }
    //Abrir tela de configurações
    function abrirConfig() {
        if (OpenConfig) {
            setOpenConfig(false)
        } else {
            setOpenConfig(true)
            fecharInfo()
            setChangeTheme(false)
        }
    }
    //Abrir tela para confirmar senha do usuário
    function infoConfirmSenhas() {
        setTela(prev => !prev)
        setGerador(false)
        setOpenConfig(false)
    }
    //Função para voltar da tela de confirmar senha para tela principal
    function voltarSGSenhas() {
        clearInputs('Csenha')
        clearMsg('msgCS')
        setTela(false)
    }
    //Abrir tela do gerador de senha
    function createS() {
        setGerador(prev => !prev)
        setOpenConfig(false)
        setOpenPerfil(false)
    }
    //Função para voltar do gerador de senhas para tela principal
    function voltarGS() {
        setUseMaiusculas(false)
        setUseMinusculas(false)
        setUseEspeciais(false)
        setUseNumeros(false)
        setSenha('')
        setValor(8)
        clearInputs('Dsenha')
        clearMsg('msgGS')
        setGerador(false)
    }

    //Função para mostrar ou esconder a senha
    function mostrarSenha() {
        setMostrarSenha(!VerSenha)
    }
    //Função para mostrar ou esconder as senhas exclusivamente da tela Senhas Salvas
    function mostrarSenhas(id) {
        setSenhaVisivel(senhaVisivel === id ? null : id)
    }
    //Função para voltar da tela Senhas Salvas para tela principal
    function voltarSS() {
        setSenhasSalvas(false)
        clearInputs('Csenha')
        OpenCloseInputs('msgCS', 'open')
        clearMsg('msgCS')
    }

    //Funções relacionadas a API\\
    //Função para mudar a imagem de fundo(API)
    async function changeImg() {
        const imageUrl = encodeURIComponent(img)

        if (!img.trim()) { return; }

        if (!validarImagem(img)) {
            setMsg('msgImg', 'URL inválida', 'erro')
            return
        }

        ///verifica se a url é válida
        try {
            new URL(img)
        } catch (error) {
            setMsg('msgImg', 'URL inválida', 'erro')
            return
        }
        try {
            await API.post(`/usuario/image?imagemUrl=${imageUrl}`)
            setBackgroundImg(img)
            setUsuario({
                ...usuario,
                urlImg: img
            })
            setImg('')
            setMsg('msgImg', 'Imagem de fundo aplicada com sucesso', 'sucesso')
        } catch (error) {
            setMsg('msgImg', 'Erro ao aplicar imagem de fundo, por favor tente novamente', 'erro')
        }
    }

    //Função para remover a imagem de fundo(API)
    async function removeImg() {
        try {
            await API.delete(`/usuario/image`)
            setBackgroundImg('')
            setImg('')
            setMsg('msgImg', 'Imagem de fundo removida com sucesso', 'sucesso')
        } catch (error) {
            setMsg('msgImg', 'Erro ao remover imagem de fundo, tente novamente', 'erro')
        }
    }

    //Função para editar o perfil do usuário(API)
    async function editarPerfil() {
        setLoading(true)
        try {
            const novoNome = nome
            const novoEmail = email

            if (novoNome === usuario.nome && novoEmail === usuario.email) {
                OpenCloseInputs('msg', 'open')
                setMsg('msg', 'Nenhuma alteração foi feita no seu perfil', 'erro')
                setLoading(false)
                return
            }
            if (novoNome === '' || novoEmail === '') {
                OpenCloseInputs('msg', 'open')
                setMsg('msg', 'Por favor preencha todos os campos', 'erro')
                setLoading(false)
                return
            }

            setLoading(true)
            const response = await API.put(`/usuario`, {
                email: novoEmail,
                nome: novoNome
            })

            if (response.data.token) {
                sessionStorage.setItem('token', response.data.token)
            }

            OpenCloseInputs('msg', 'open')
            setMsg('msg', 'Perfil atualizado com sucesso', 'sucesso')
            setUsuario({
                ...usuario,
                nome: novoNome,
                email: novoEmail
            })
        } catch (error) {
            OpenCloseInputs('msg', 'open')
            setMsg('msg', 'Erro ao atualizar perfil, por favor tente novamente', 'erro')
        } finally {
            setLoading(false)
        }
    }

    //Função para deletar o usuário(API)
    async function deleteUsers() {
        const confirmDelete = window.confirm("Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.")

        if (!confirmDelete) {
            return
        } else {
            try {
                await API.delete(`/usuario`)
                alert("Usuário deletado com sucesso!")
                navigate('/')
            } catch (error) {
                setMsg('msg', 'Erro ao deletar usuário, por favor tente novamente', 'erro')
            }
        }
    }
    
    //Função para confirmar a senha do usuário e Mostra-las na tela de Senhas Salvas(API)
    async function confirmSenha() {
        setLoading(true)
        const senha = inputConfirmSenha.current.value

        if (senha === "") {
            setMsg('msgCS', 'Por favor digite a sua senha do site', 'erro')
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            await API.post(`/usuario/confirmar-senha`, {
                senha: senha
            })
            setMsg('msgCS', 'Validado com sucesso', 'sucesso')

            const SenhaResponse = await API.get(`/usuario/buscar-senhas`)
            setSavePass(SenhaResponse.data)
            
            setTela(false)
            setSenhasSalvas(true)
            if (SenhaResponse.data.length === 0) {
                setMsg('msgSS', 'Você não possui nenhuma senha salva', 'erro')
                return
            }
            clearMsg('msgCS')
        } catch (error) {
            setMsg('msgCS', 'Senha incorreta', 'erro')
        } finally {
            setLoading(false)
        }
    }

    //Função para gerar a senha(API)
    async function gerarSenha() {
        setLoading(true)
        try {
            const response = await API.post(`/usuario/gerar-senha`, {
                tamanho: valor,
                numeros: useNumeros,
                especiais: useEspeciais,
                maiusculas: useMaiusculas,
                minusculas: useMinusculas
            })

            setSenha(response.data)

            setMsg('msgGS', 'Senha gerada com sucesso!', 'sucesso')
        } catch (error) {
            setMsg('msgGS', 'Erro ao gerar senha, por favor tente novamente', 'erro')
        } finally {
            setLoading(false)
        }
    }

    //Função para salvar a senha(API)
    async function salvarSenha() {
        setLoading(true)
        const descricao = inputDescricao.current.value

        if (descricao === "") {
            setMsg('msgGS', 'Por favor digite uma descrição', 'erro')
            setLoading(false)
            return
        }
        if (senha === "") {
            setMsg('msgGS', 'Por favor gere ou crie uma senha', 'erro')
            setLoading(false)
            return
        }

        setLoading(true)
        try {
            await API.post(`/usuario/salvar-senha`, {
                senha: senha,
                descricao: descricao
            })

            setUseMaiusculas(false)
            setUseMinusculas(false)
            setUseEspeciais(false)
            setUseNumeros(false)
            setSenha('')
            setValor(8)
            clearInputs('Dsenha')
            setMsg('msgGS', 'Senha salva com sucesso', 'sucesso')
        } catch (error) {
            setMsg('msgGS', 'Erro ao salvar senha, por favor tente novamente', 'erro')
        } finally {
            setLoading(false)
        }
    }

    //Função para deletar a senha criada/gerada(API)
    async function deletarSenha(id) {
        setLoading(true)
        const confirm = window.confirm("Deseja realmente deletar essa senha?")

        if (!confirm) { 
            setLoading(false)
            return 
        }

        setLoading(true)
        try {
            await API.delete(`/usuario/deletar-senha?id=${encodeURIComponent(id)}`)
            setSavePass(prev => {
                const novasSenhas = prev.filter(item => item.id !== id)

                if (novasSenhas.length === 0) {
                    setMsg('msgSS', 'Você não possui nenhuma senha salva', 'erro')
                } else {
                    setMsg('msgSS', 'Senha deletada com sucesso', 'sucesso')
                }
                return novasSenhas
            })

            setSenhaVisivel(null)

        } catch (error) {
            setMsg('msgSS', 'Erro ao deletar senha, por favor tente novamente', 'erro')
        } finally {
            setLoading(false)
        }
    } 

    //mantém os dados atualizados mesmo após sofrer efeitos por navegador
    useEffect(() => {
        const token = sessionStorage.getItem('token')
        if (!token) {
            navigate('/')
            return
        }

        async function loadUser() {
            try {
                const response = await API.get(`/usuario`)
                setUsuario(response.data)
                setNome(response.data.nome ?? '')
                setEmail(response.data.email ?? '')
                setBackgroundImg(response.data.urlImg ?? '')
        } catch (error) {
            console.error("Erro ao carregar o usuário: ", error)
        }
    }
        loadUser()
    }, [])

    return (
        <div id="main" className={temaClaro ? 'AppBlank' : 'App'} style={{ backgroundImage: backgroundImg ? `url("${backgroundImg}")` : 'none' }}>
            {/* Cabeçalho */}
            <header className="cabecalho">
                <img className="cImg" src={Logo} alt="" /> 
                <h1>KeysKeepSafe</h1>
                <div className="botoes">
                    <button className="editButton" onClick={mudarTema}><img src={Edit} alt="Mudar Tema"/></button>
                    <button className="configButton" onClick={abrirConfig}><img src={Config} alt="Configurações"/></button>
                </div>
            </header>

            {/* Configurações */}
            <div id="Config" className="configurations" style={{ display: OpenConfig ? 'flex' : 'none' }}>
                <h2> Configurações </h2>
                <button className="themeButton" onClick={changeColor}> <img src={Sol ? Sun : Moon}/> Mudar Tema </button>
                <button className="deleteButton" onClick={deleteUsers}> <img src={Lixeira} alt=""/> Deletar Conta </button>
            </div>

            {/* Mudar imagem de fundo */}
            <div id="changeTheme" className="configurations" style={{ display: changeTheme ? 'flex' : 'none' }}>
                <label htmlFor="imgUrl">Mudar Imagem de fundo</label>
                <input id="imgUrl" type="url" placeholder="Url da imagem" value={img} onChange={(e) => setImg(e.target.value)} />
                {img.trim() !== '' && <button id="ApImg" className="imgButton" onClick={changeImg}> Aplicar </button>}
                {backgroundImg && <button id="DelImg" className="delImgButton" onClick={removeImg}> Remover Imagem </button>}
                <p id="msgImg"></p>
            </div>

            {/* Site */}
            <main className="principal">
                <h1>Bem-Vindo(a) {usuario.nome || 'Usuário'}</h1>

                {/* Card de informações do usuário */}
                <section className="cards">
                    <div className="card">
                        <h2>🙋‍♂️ Seu Perfil</h2>
                        <p> Visualize e edite suas informações de usuário </p>
                        <button onClick={infoPerfil}> Visualizar </button>
                    </div>
                
                    {/* Card para visualizar ou criar/gerar senhas */}
                    <div className="card">
                        <h2>🔑 Gerador de Senhas</h2>
                        <p> Crie ou gere suas senhas aqui </p>
                        <button onClick={createS}> Ir gerar/criar Senhas </button>
                    </div>

                    {/* Card Visualizar Senhas */}
                     <div className="card">
                        <h2>👁️‍🗨️ Visualizar Senhas Salvas </h2>
                        <p> Visualize as suas senhas no site aqui </p>
                        <button onClick={infoConfirmSenhas}> Visualizar senhas salvas </button>
                    </div>
                </section>

            {/* Telas advindas dos cards */}
            {/* ------------ */}
                {/* Informações do Usuário */}
                {OpenPerfil && (
                    <div className="overlay">
                        <div id="informaçõesPerfil" className="informacoes" style={{ display: OpenPerfil ? 'flex' : 'none' }}>
                            <h1>Suas informações</h1>
                            <label htmlFor="nome">Nome</label>
                            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
                            <label htmlFor="email">Email</label>
                            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                            <div className="botoes">
                                <button onClick={editarPerfil} disabled={loading}> {loading ? "Editando..." : "Editar"}</button>
                                <button onClick={fecharInfo}> Fechar </button>
                            </div>
                            <p id="msg" className="beforeCodigo"></p>
                        </div>
                    </div>
                )}

                {/* Tela Gerador de Senhas */}
                    {gerador && (
                        <div className="overlay">
                            <div className="geradorSenha" style={{display: gerador ? 'flex' : 'none'}}>
                                <h1>Gerador de Senhas</h1>
                                <div className="opcoesSenha">
                                    <label htmlFor="myRange"> Tamanho da Senha: </label>
                                    <input id="myRange" type="range" min="8" max="20" value={valor} onChange={handleRange}/>

                                    <label></label>

                                    <label> <span>{valor}</span> </label>

                                    <label> <input type="checkbox" checked={useMaiusculas} onChange={(e) => {setUseMaiusculas(e.target.checked)}} value="letrasM" id="Maiusculas" />Maiúsculas </label>
                                    
                                    <label> <input type="checkbox" checked={useMinusculas} onChange={(e) => {setUseMinusculas(e.target.checked)}} value="letrasm" id="Minusculas" />Minúsculas</label>
                                    
                                    <label> <input type="checkbox" checked={useNumeros} onChange={(e) => {setUseNumeros(e.target.checked)}} value="numeros" id="numeros" />Números </label>
                                    
                                    <label> <input type="checkbox" checked={useEspeciais} onChange={(e) => {setUseEspeciais(e.target.checked)}} value="simbolos" id="simbolos" />Simbolos </label>
                                </div>
                                <input id="Dsenha" type="text" name="senha" placeholder="Descrição da sua senha" ref={inputDescricao}></input>
                                <input id="Gsenha" type="text" name="senha" placeholder="Sua senha gerada/criada aqui" value={senha} onChange={(e) => setSenha(e.target.value)}></input>
                                <div className="botoes">
                                    <button className="imgButton" onClick={gerarSenha} disabled={loading}> {loading ? "Gerando..." : "Gerar Senha"} </button>
                                    <button className="saveButton" onClick={salvarSenha}> Salvar Senha </button>
                                    <button onClick={voltarGS}> Voltar </button>
                                </div>
                                <p id="msgGS"></p>
                            </div>
                        </div>
                    )}
                    

                {/* Tela para confirmar senha */}
                {tela && (
                    <div className="overlay">
                        <div className="confirmSenha" style={{display: tela ? 'flex' : 'none'}}>
                            <p>Digite a sua senha do site (Etapa de segurança)</p>
                            <div className='senhas'>
                                <input id="Csenha" type={VerSenha ? 'text' : 'password'} name="senha" placeholder="Sua senha" ref={inputConfirmSenha}></input>
                                <button type="button" className='divSenhas' onClick={mostrarSenha}><img className="LCEImg" src={VerSenha ? desverSenha : verSenha} alt="" /></button>
                            </div>
                            <div className="botoes">
                                <button className="imgButton" onClick={confirmSenha} disabled={loading}> {loading ? "Verificando..." : "Confirmar Senha"} </button>
                                <button onClick={voltarSGSenhas}> Voltar </button>
                            </div>
                            <p id="msgCS"></p>
                        </div>
                    </div>
                )}

                {/* Tela Senhas Salvas */}
                {senhasSalvas && (
                    <div className="overlay">
                        <div className="senhasSalvas" style={{display: senhasSalvas ? 'flex' : 'none'}}>
                            <h1> Suas Senhas Salvas </h1>
                            <div id="divSenhas">
                                {pass.map((item) => (
                                    <div className="senhaSalva" key={item.id}>
                                        <div className="campoSenha">
                                            <label>{item.descricao}</label>
                                        <input type={senhaVisivel === item.id ? 'text' : 'password'} value={item.senha} readOnly />
                                        <button type="button" onClick={() => mostrarSenhas(item.id)}>
                                            <img src={senhaVisivel === item.id ? desverSenha : verSenha}/>
                                        </button>
                                        <button type="button" onClick={() => deletarSenha(item.id)}>
                                            <img src={Lixeira} alt="Deletar Senha"/>
                                        </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={voltarSS}> Voltar </button>
                            <p id="msgSS"></p>
                        </div>
                    </div>
                )}

                <button className="logout" onClick={voltar}> Sair </button>
            </main>
            <Footer />
        </div>
    )
}

export default Tela