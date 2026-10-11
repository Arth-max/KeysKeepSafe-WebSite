//importações de imagens, arquivos e funções
import verSenha from '../../assets/verSenha.png'
import desverSenha from '../../assets/desverSenha.png'
import Logo from '../../assets/senha.png'
import './Login.css'
import { useState, useRef, useEffect } from 'react'
import API from '../../hooks/user.js'
import { useNavigate } from 'react-router-dom'
import { closeInputs } from '../../hooks/user.js'
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
    document.getElementById('email').value = ''
    document.getElementById('msgEsqueciSenha').textContent = ""
    document.getElementById('msgCadastro').textContent = ""
    document.getElementById('EnvEmail').style.display = 'block'
    document.getElementById('pass').style.display = 'none'
  }
  //ativar tela cadastro
  function telaCadastro() {
    setTela('cadastro')
    document.getElementById('btnLogin').classList.remove('btn-clicked')
    document.getElementById('btnCadastro').classList.add('btn-clicked')
    document.getElementById('msgLogin').textContent = ""
  }
  //ativar tela esqueci senha
  function forgotPassword() {
    setTela('esqueciSenha')
    document.getElementById('msgLogin').textContent = ""
    document.getElementById('msgCadastro').textContent = ""
    document.getElementById('email').style.display = 'block'
  }
  //função para mostrar senha
  function mostrarSenha() {
    setMostrarSenha(!VerSenha)
  }
  //função para validar senha conforme regras
  function validarSenha(senha) {
    return (
      /[0-9]/.test(senha) && /[A-Z]/.test(senha) && /[a-z]/.test(senha)
      && /[!@#$%^&*()\-_=+[{\]}|;:'"<>.,/?~]/.test(senha)
    )
  }

  //Funções relacionadas a API\\
  //função fazer login pela API
  async function findUsers() {
    setLoading(true)
    try {
      const nome = inputName.current.value
      const senha = inputSenha.current.value

      if (nome == '' || senha == '') {
        alert("Usuário nao encontrado, Por favor digite todos os campos")
        setLoading(false)
        return
      }
      setLoading(true)
      const response = await API.post('/usuario/login', {
        nome: nome,
        senha: senha
      })

      sessionStorage.setItem('token', response.data.token)
      
      document.getElementById('msgLogin').style.color = 'seagreen'
      document.getElementById('msgLogin').textContent = "validado com sucesso"

      inputName.current.value = ''
      inputSenha.current.value = ''

      navigate('/tela', {
        state: {
          usuario: response.data
        }
      })
    } catch (error) {
      document.getElementById('msgLogin').style.color = 'darkred'
      document.getElementById('msgLogin').textContent = "Por favor, revise se todos os campos estão corretos"
    } finally {
      setLoading(false)
    }
  }

  //função criar usuários pela API
  async function createUsers() {
    setLoading(true)
    if (CinputName.current.value === "" || CinputEmail.current.value === "" || CinputSenha.current.value === "") {
      document.getElementById('msgCadastro').style.color = 'darkred'
      document.getElementById('msgCadastro').textContent = "Por favor digite todos os campos"
      setLoading(false)
      return
    }
    if (CinputSenha.current.value.length < 8) {
      document.getElementById('msgCadastro').style.color = 'darkred'
      document.getElementById('msgCadastro').textContent = "Senha inválida, deve conter ao menos 8 caracteres"
      setLoading(false)
      return
    }
    if (!validarSenha(CinputSenha.current.value)) {
      document.getElementById('msgCadastro').style.color = 'darkred'
      document.getElementById('msgCadastro').textContent = "Senha inválida, por favor digite uma senha forte: (A-Z, a-z, 0-9, !)"
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
        document.getElementById('msgCadastro').style.color = 'seagreen'
        document.getElementById('msgCadastro').textContent = "Usuário cadastrado com sucesso!"

        CinputName.current.value = ''
        CinputEmail.current.value = ''
        CinputSenha.current.value = ''
        setLoading(false)
    } catch (error) {
        document.getElementById('msgCadastro').style.color = 'darkred'
        document.getElementById('msgCadastro').textContent = "Usuário não cadastrado, por favor tente novamente"
    } finally {
      setLoading(false)
    }
  }

  //função para enviar email para recuperar senha pela API
  async function setEmail() {
    setLoading(true)
    const email = Email.current.value;
    if (email === '') {
        document.getElementById('msgEsqueciSenha').textContent = "Por favor digite um email"
        setLoading(false)
        return
    }
    setLoading(true)
    try {
        await API.post('/usuario/recuperar-senha?email=' + email)
        document.getElementById('EnvEmail').style.display = 'none'
        document.getElementById('email').style.display = 'none'
        document.getElementById('codigo').style.display = 'block'
        document.getElementById('Nsenha').style.display = 'block'
        document.getElementById('UpPass').style.display = 'block'
        document.getElementById('pass').style.display = 'flex'

        document.getElementById('msgEsqueciSenha').style.color = 'seagreen'
        document.getElementById('msgEsqueciSenha').textContent = "Um codigo foi enviado para o seu email"
    } catch (error) {
        document.getElementById('msgEsqueciSenha').style.color = 'darkred'
        document.getElementById('msgEsqueciSenha').textContent = "email não cadastrado ou inválido"
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
      console.log("Usuário nao atualizado, Por favor digite o codigo")
      setLoading(false)
      return
    }
    if (Nsenha.length < 8) {
      document.getElementById('msgEsqueciSenha').textContent = "Digite uma senha com ao menos 8 caracteres"
      setLoading(false)
      return
    }
    if (!validarSenha(Nsenha)) {
      document.getElementById('msgEsqueciSenha').textContent = "Senha inválida, por favor digite uma senha forte: (A-Z, a-z, 0-9, !)"
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      await API.put(`/usuario/atualizarSenha?email=${email}&cod=${cod}`, { senha: Nsenha })

      Email.current.value = ''
      codigo.current.value = ''
      NinputSenha.current.value = ''

      closeInputs()
      document.getElementById('msgEsqueciSenha').style.color = 'seagreen'
      document.getElementById('msgEsqueciSenha').textContent = "Usuário atualizado com sucesso!"
    } catch (error) {
      document.getElementById('msgEsqueciSenha').style.color = 'darkred'
      document.getElementById('msgEsqueciSenha').textContent = "Não foi possível atualizar o usuário, por favor tente novamente"
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {

  }, [])

  return (
    <div className='App'>
      {/* Botões de cadastro e Login */}
      <div className='botoes'>
        <button id="btnLogin" className='botoesPrincipais' onClick={telaLogin}>Fazer Login</button>
        <button id="btnCadastro" className='botoesPrincipais' onClick={telaCadastro}>Criar Conta</button>
      </div>

      {/* Tela Login */}
      <form className='login' style={{ display: tela === 'login' ? 'flex' : 'none' }}>
        <div className='title'>
          <img className="logoImg" src={Logo} alt="" /> 
          <h1>KeysKeepSafe</h1>
        </div>
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
        <h2>Cadastro</h2>
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