import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import LogCard from "../../components/LogCard/LogCard"
import { buscarLogs } from "../../hooks/user"
import { ACOES, ACAO_PADRAO, CATEGORIAS } from "../../hooks/logConfig"
import '../historico/historico.css'

function rotuloDia(iso) {
    const d = new Date(iso)
    if (isNaN(d)) return "Sem data"

    const hoje = new Date()
    const ontem = new Date()
    ontem.setDate(hoje.getDate() - 1)

    if (d.toDateString() === hoje.toDateString()) return "Hoje"
    if (d.toDateString() === ontem.toDateString()) return "Ontem"
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function Historico() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [logs, setLogs] = useState([])
    const [tentativa, setTentativa] = useState(0)
    const [categorias, setCategorias] = useState('ALL')
    const [apenasHoje, setApenasHoje] = useState(false)


    function voltar() {
        navigate('/tela')
        setTentativa(0)
        setError('')
    }

    useEffect(() => {
        setError('')
        let ativo = true

        async function getLogs() {
            try {
                const data = await buscarLogs()
                if (ativo) setLogs(data ?? [])
            } catch (err) {
                console.log(err)
                if (ativo) setError('Erro ao carregar histórico de ações. Tente novamente mais tarde.')
            } finally { if (ativo) setLoading(false) }
        }
        getLogs()
        return () => { ativo = false }
    }, [tentativa])

    const grupos = useMemo(() => {
        const today = new Date().toDateString()
        const filter = logs.filter((log) => {
            const cfgCategoria = ACOES[log.acao]?.categoria ?? ACAO_PADRAO.categoria
            if (categorias !== 'ALL' && cfgCategoria.toUpperCase() !== categorias) return false
            if (apenasHoje) {
                const dataLog = new Date(log.horario)

                if(isNaN(dataLog) || dataLog.toDateString() !== today) return false
            }       
            return true
        })

        const map = new Map()
        for (const log of filter) {
            const dia = rotuloDia(log.horario)
            if (!map.has(dia)) map.set(dia, [])
            map.get(dia).push(log)
        }
        return [...map.entries()]
    }, [logs, categorias, apenasHoje, navigate])

    const temFiltro = categorias !== 'ALL' || apenasHoje
    return (
        <div className="historico-container">
            <div className="filtros" role="group" aria-label="Filtrar atividades">
                {CATEGORIAS.map((c) => (
                    <button key={c.id}
                        type="button"
                        className={`chip ${categorias === c.id ? "ativo" : ""}`}
                        aria-pressed={categorias === c.id}
                        onClick={() => setCategorias(c.id)}>
                        {c.rotulo}
                    </button>
                ))}
                <button className="chip-voltar" onClick={voltar}>Voltar</button>
            </div>

            <main className="logs">
                <header>
                    <h1>Seu Histórico de ações</h1>
                    <p>Acompanhe as atividades realizadas na sua conta.</p>
                </header>

                <div className="logs-list" aria-live="polite">
                    <button type="button"
                        className={`chip chip-hoje ${apenasHoje ? "ativo" : ""}`}
                        aria-pressed={apenasHoje}
                        onClick={() => setApenasHoje((v) => !v)}>
                        Somente hoje
                    </button>

                    {loading && <p className="estado">Carregando histórico...</p>}

                    {!loading && error && (
                        <div className="estado erro" role="alert">
                            <p>{error}</p>
                            <button type="button" className="chip" onClick={() => setTentativa((t) => t + 1)}>
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!loading && !error && grupos.length === 0 && (
                        <p className="estado">
                            {temFiltro
                                ? "Nenhuma atividade encontrada para este filtro."
                                : "Você ainda não tem atividades registradas."}
                        </p>
                    )}

                    {!loading && !error && grupos.map(([dia, itens]) => (
                        <section key={dia} className="grupo">
                            <h2>{dia}</h2>
                            {itens.map((log) => <LogCard key={log.id} log={log} />)}
                        </section>
                    ))}
                </div>
            </main>
        </div> 
    )
}

export default Historico