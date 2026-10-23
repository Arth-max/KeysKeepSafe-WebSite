//importações de imagens, arquivos e funções
import verSenha from '../../assets/verSenha.png'
import desverSenha from '../../assets/desverSenha.png'
import Logo from '../../assets/senha.png'
import './Login.css'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import API, { validarSenha, OpenCloseInputs, OpenCloseDiv, setMsg, clearMsg, clearInputs } from '../../hooks/user.js'
import Footer from '../../components/Footer/Footer.jsx'

function Home() {
  const [tela, setTela] = useState('login') //estado da tela (login, cadastro, esqueciSenha)
  const [VerSenha, setMostrarSenha] = useState(false) //estado da visibilidade da senha
  const [loading, setLoading] = useState(false) //estado do botão
  const navigate = useNavigate() //navegador

  //login
  const inputName = useRef()
  const inputSenha = useRef()

  //cadastro
  const CinputName = useRef()
  const CinputEmail = useRef()
  const CinputSenha = useRef()

  //esqueci senha
  const codigo = useRef()
  const NinputSenha = useRef()
  const Email = useRef()

  //Funções relacionadas aos estados da tela\\
  //ativar tela login
  function telaLogin() {
    setTela('login')
    document.getElementById('btnLogin').classList.add('btn-clicked')
    document.getElementById('btnCadastro').classList.remove('btn-clicked')
    clearInputs('email')
    clearMsg('msgEsqueciSenha')
    clearMsg('msgCadastro')
    OpenCloseInputs('EnvEmail', 'open')
    OpenCloseInputs('pass', 'close')
  }
  //ativar tela cadastro
  function telaCadastro() {
    setTela('cadastro')
    document.getElementById('btnLogin').classList.remove('btn-clicked')
    document.getElementById('btnCadastro').classList.add('btn-clicked')
    clearMsg('msgLogin')
  }
  //ativar tela esqueci senha
  function forgotPassword() {
    setTela('esqueciSenha')
    clearMsg('msgLogin')
    clearMsg('msgCadastro')
    OpenCloseInputs('email', 'open')
  }
  //função para mostrar senha
  function mostrarSenha() {
    setMostrarSenha(!VerSenha)
  }

  //Funções relacionadas a API\\
  //função fazer login pela API
  async function findUsers() {
    setLoading(true)
    try {
      const nome = inputName.current.value
      const senha = inputSenha.current.value

      if (nome == '' || senha == '') {
        setMsg('msgLogin', 'Por favor digite todos os campos', 'erro')
        setLoading(false)
        return
      }
      setLoading(true)
      const response = await API.post('/usuario/login', {
        nome: nome,
        senha: senha
      })

      sessionStorage.setItem('token', response.data.token)
      
      setMsg('msgLogin', 'Validado com sucesso', 'sucesso')

      inputName.current.value = ''
      inputSenha.current.value = ''

      navigate('/tela', {
        state: {
          usuario: response.data
        }
      })
    } catch (error) {
      setMsg('msgLogin', 'Por favor revise se todos os campos estão corretos', 'erro')
    } finally {
      setLoading(false)
    }
  }

  //função criar usuários pela API
  async function createUsers() {
    setLoading(true)
    if (CinputName.current.value === "" || CinputEmail.current.value === "" || CinputSenha.current.value === "") {
      setMsg('msgCadastro', 'Por favor digite todos os campos', 'erro')
      setLoading(false)
      return
    }
    if (CinputSenha.current.value.length < 8) {
      setMsg('msgCadastro', 'Senha inválida, digite ao menos 8 caracteres', 'erro')
      setLoading(false)
      return
    }
    if (!validarSenha(CinputSenha.current.value)) {
      setMsg('msgCadastro', 'Senha inválida, por favor digite uma senha forte: (A-Z, a-z, 0-9, !)', 'erro')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
        await API.post('/usuario', {
          nome: CinputName.current.value,
          email: CinputEmail.current.value,
          senha: CinputSenha.current.value
        })
        setMsg('msgCadastro', 'Usuário cadastrado com sucesso', 'sucesso')

        CinputName.current.value = ''
        CinputEmail.current.value = ''
        CinputSenha.current.value = ''
        setLoading(false)
    } catch (error) {
        setMsg('msgCadastro', 'Usuário não cadastrado, por favor tente novamente', 'erro')
    } finally {
      setLoading(false)
    }
  }

  //função para enviar email para recuperar senha pela API
  async function setEmail() {
    setLoading(true)
    const email = Email.current.value;
    if (email === '') {
        setMsg('msgEsqueciSenha', 'por favor digite um email', 'erro')
        setLoading(false)
        return
    }
    setLoading(true)
    try {
        await API.post('/usuario/recuperar-senha?email=' + email)
        OpenCloseInputs('EnvEmail', 'close')
        OpenCloseInputs('email', 'close')
        OpenCloseInputs('codigo', 'open')
        OpenCloseInputs('Nsenha', 'open')
        OpenCloseInputs('UpPass', 'open')
        OpenCloseDiv('pass', 'open')

        setMsg('msgEsqueciSenha', 'Um código foi enviado para o seu email', 'sucesso')
    } catch (error) {
        setMsg('msgCadastro', 'email não cadastrado ou inválido', 'erro')
    } finally {
        setLoading(false)
    }
  }

  //função atualizar senha dos usuários pela API
  async function updatePassUsers() {
    const email = Email.current.value
    const cod = codigo.current.value
    const Nsenha = NinputSenha.current.value
    setLoading(true)

    if (cod === '') {
      setMsg('msgEsqueciSenha', 'Usuário não cadastrado, por favor digite o codigo', 'erro')
      setLoading(false)
      return
    }
    if (Nsenha.length < 8) {
      setMsg('msgEsqueciSenha', 'Senha inválida, por favor digite uma senha com ao menos 8 caracteres', 'erro')
      setLoading(false)
      return
    }
    if (!validarSenha(Nsenha)) {
      setMsg('msgEsqueciSenha', 'Senha inválida, por favor digite uma senha forte: (A-Z, a-z, 0-9, !)', 'erro')
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      await API.put(`/usuario/atualizarSenha?email=${email}&cod=${cod}`, { senha: Nsenha })

      Email.current.value = ''
      codigo.current.value = ''
      NinputSenha.current.value = ''

      OpenCloseInputs('EnvEmail', 'open')
      OpenCloseInputs('email', 'open')
      OpenCloseInputs('codigo', 'close')
      OpenCloseInputs('Nsenha', 'close')
      OpenCloseInputs('UpPass', 'close')
      setMsg('msgEsqueciSenha', 'Usuário atualizado com sucesso', 'sucesso')
    } catch (error) {
      setMsg('msgEsqueciSenha', 'Não foi possível atualizar a senha, por favor tente novamente', 'erro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='App'>
      {/* Botões de cadastro e Login */}
      <div className='botoes'>
        <button id="btnLogin" className='botoesPrincipais' onClick={telaLogin}>Fazer Login</button>
        <button id="btnCadastro" className='botoesPrincipais' onClick={telaCadastro}>Não possui conta?</button>
      </div>

      {/* Tela Login */}
      <form className='login' style={{ display: tela === 'login' ? 'flex' : 'none' }}>
        <div className='title'>
          <img className="logoImg" src={Logo} alt="" /> 
          <h1>KeysKeepSafe</h1>
        </div>
        <div className="divider"></div>
        <h2>Login</h2>
        <input name="name" type="text" placeholder='Nome' ref={inputName} />

        <div className='senhas'>
          <input name="senha" type={VerSenha ? 'text' : 'password'} placeholder='Senha' ref={inputSenha} />
          <button type="button" className='divSenhas' onClick={mostrarSenha}><img className="LCEImg" src={VerSenha ? desverSenha : verSenha} alt="" /></button>
        </div>
        <a onClick={forgotPassword} className='a-forgotPass' role="button">Esqueci minha senha</a>
        <button type="button" className='btn-login' onClick={findUsers} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <p id="msgLogin"></p>
      </form>

      {/* Tela Cadastro */}
      <form className='cadastro' style={{ display: tela === 'cadastro' ? 'flex' : 'none' }}>
        <div className='title'>
          <img className="logoImg" src={Logo} alt="" /> 
          <h1>KeysKeepSafe</h1>
        </div>
        <div className="divider"></div>
        <h2>Faça seu Cadastro!</h2>
        <input name="name" type="text" placeholder='Nome' ref={CinputName} />
        <input name="Email" type="email" placeholder='Email' ref={CinputEmail} />

        <div className='senhas'>
          <input name="senha" type={VerSenha ? 'text' : 'password'} placeholder='Senha' ref={CinputSenha} />
          <button type="button" className='divSenhas' onClick={mostrarSenha}><img className="LCEImg" src={VerSenha ? desverSenha : verSenha} alt="" /></button>
        </div>
        <button className="btn-cadastro" type="button" onClick={createUsers} disabled={loading}>{loading ? 'Cadastrando...' : 'Cadastrar'}</button>
        <p id="msgCadastro"></p>
      </form>

      {/* Tela Esqueci Senha */}
      <form className='forgotPass' style={{ display: tela === 'esqueciSenha' ? 'flex' : 'none' }}>
        <div className='title'>
          <img className="logoImg" src={Logo} alt="" /> 
          <h1>KeysKeepSafe</h1>
        </div>
        <div className="divider"></div>
        <h2>Redefinir senha</h2>
        <input id='email' name="Email" type="email" placeholder='Digite seu Email' ref={Email} />

        <input id='codigo' className='beforeCodigo' type="number" placeholder='Digite o código enviado pelo email' ref={codigo} />
        
        {/* Div para criar nova senha */}
        <div id="pass" className='senhasBC'>
          <input id='Nsenha' className='beforeCodigo' type={VerSenha ? 'text' : 'password'} placeholder='Digite sua nova senha' ref={NinputSenha} />
          <button type="button" className='divSenhas' onClick={mostrarSenha}><img className="LCEImg" src={VerSenha ? desverSenha : verSenha} alt="" /></button>
        </div>

        <button className='btn-forgotPass' id="UpPass" type="button" onClick={updatePassUsers} disabled={loading}>{loading ? 'Alterando...' : 'Alterar Senha'}</button>
        <button id="EnvEmail" type="button" onClick={setEmail} disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
        <button type="button" onClick={telaLogin}>Voltar</button>
        <p id="msgEsqueciSenha" style={{ color: 'seagreen' }}></p>
      </form>
      <Footer />
    </div>
  )
}
export default Home