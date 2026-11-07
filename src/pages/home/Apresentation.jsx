import { useNavigate } from 'react-router-dom'
import Logo from '../../assets/senha.png'
import Footer from '../../components/Footer/Footer.jsx'
import './Apresentation.css'

const RECURSOS = [
    { icone: '🔑', rotulo: 'Gerador de Senhas', descricao: 'Crie senhas fortes e seguras à sua maneira com facilidade.' },
    { icone: '🔒', rotulo: 'Cofre de Senhas', descricao: 'Armazene suas senhas com segurança, identificando-as facilmente com uma descrição.' },
    { icone: '⏱️', rotulo: 'Historico de ações', descricao: 'Suas ações são salvas e podem ser consultadas em qualquer momento por você (informações privadas não incluidas).' }
]

const PASSOS = [
    'Crie sua conta com poucos segundos.',
    'Crie, Gere ou salve uma senha que você já usa ',
    'Acesse suas senhas sempre que você precisar, sem preocupações.'
]

function Apresentation() {
    const navigate = useNavigate()

    return (
        <div className="apresentation">
            <header className="apresentation-header">
                <div className="apresentation-logo">
                    <img src={Logo} alt="" />
                    <span>KeysKeepSafe</span>
                </div>

                <nav className="apresentation-nav">
                    <button type="button" className="ap-btn sec" onClick={() => navigate('/login')}>Entrar</button>
                    <button type="button" className="ap-btn pri" onClick={() => navigate('/login', { state: { tela: 'cadastro'}})}>Cadastrar</button>
                </nav>
            </header>

            <main>
                <section className="apresentation-hero">
                    <h1>Suas senhas, na palma da mão, com segurança, em um lugar só</h1>
                    <p> Gere, guarde e consulte suas senhas com facilidade com KeysKeepSafe</p>
                    <button type="button"
                        onClick={() => navigate('/login', { state: { tela: 'cadastro' } })}>
                        Começar agora
                    </button>
                </section>

                <section className="apresentation-recursos" aria-labelledby="t-recursos">
                    <h2 id="t-recursos">O que você pode fazer no site?</h2>
                    <div className="ap-cards">
                        {RECURSOS.map((r) => (
                            <article key={r.rotulo} className="ap-titulo">
                                <span className="ap-icone" aria-hidden="true">{r.icone}</span>
                                <h3>{r.rotulo}</h3>
                                <p>{r.descricao}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="apresentation-passos" aria-labelledby="t-passos">
                    <h2 id="t-passos">Como funciona?</h2>
                    <ol className="ap-passos">
                        {PASSOS.map((p, i) => (
                            <li key={i}><span className="ap-num">{i + 1}</span>{p}</li>
                        ))}
                    </ol>
                </section>

                <section className="apresentation-passos ap-cta">
                    <h2>Pronto para organizar suas senhas? Garantimos que não há melhor lugar (risos)</h2>
                    <button type="button" className="ap-btnLC" onClick={() => navigate('/login')}>
                        Entrar ou criar conta
                    </button>
                </section>
            </main>
            <Footer/>
        </div>
    )
}

export default Apresentation