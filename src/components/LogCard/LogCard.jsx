import "../LogCard/LogCard.css";
import { ACOES, ACAO_PADRAO } from "../../hooks/logConfig";

function formatarAcao(acao) {
    const text = (acao ?? "Ação").replaceAll("_", " ").toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
}
function LogCard({ log }) {
    const cfg = ACOES[log.acao] ?? ACAO_PADRAO;
    const data = log.horario ? new Date(log.horario) : null
    const hora = data && !isNaN(data) ? data.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Horário desconhecido";

    return (
        <article className={`log-card tom-${cfg.tom}`}>
            <div className="log-icon" aria-hidden="true">
                {cfg.icone && <img src={cfg.icone} alt="" />}
            </div>
            <div className="log-info">
                <h3>{cfg.rotulo ?? formatarAcao(log.acao)}</h3>
                {log.descricao && <p>{log.descricao}</p>}

               <p className="log-time">{hora}</p>
            </div>
        </article>
    )
}
export default LogCard