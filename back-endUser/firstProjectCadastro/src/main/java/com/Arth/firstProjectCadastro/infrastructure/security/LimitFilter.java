package com.Arth.firstProjectCadastro.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class LimitFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(LimitFilter.class);
    private record Rule (String nome, int max, long janelaMs) {}

    public static class Window {
        final long inicio;
        final long duracao;
        int contagem;
        Window(long inicio, long duracao) {
            this.inicio = inicio;
            this.duracao = duracao;
        }
    }

    private static final Rule geral = new Rule("geral", 100, 60_000);

    private static final Map<String, Rule> REGRAS = Map.of(
            "POST /usuario/login",           new Rule("login", 5, 60_000),
            "POST /usuario",                 new Rule("cadastro", 5, 3_600_000),
            "POST /usuario/recuperar-senha", new Rule("recuperar", 3, 600_000),
            "POST /usuario/imagem",          new Rule("imagem", 10, 600_000),
            "PUT /usuario/atualizarSenha", new Rule("atualizar", 5, 600_000)
    );

    private final Map<String, Window> windows = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if ("OPTIONS".equals(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        Rule regra = REGRAS.getOrDefault(request.getMethod() + " " + request.getRequestURI(), geral);
        String chave = request.getRemoteAddr() + "|" + regra.nome();
        long now = System.currentTimeMillis();

        Window j = windows.compute(chave, (k, atual) -> {
            if (atual == null || now - atual.inicio >= atual.duracao) {
                Window nova = new Window(now, regra.janelaMs());
                nova.contagem = 1;
                return nova;
            }
            atual.contagem++;
            return atual;
        });

        cleanExpiradas(now);

        if (j.contagem > regra.max()) {
            long restanteSeg = Math.max(1, (j.inicio + j.duracao - now + 999)/1000);
            log.warn("Limite excedido (regra={}, Id={})", regra.nome(), request.getRemoteAddr());

            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(restanteSeg));
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                    "{\"erro\":\"Muitas requisições. Tente novamente em " + restanteSeg + " segundos.\"}"
            );
            return;
        }
        filterChain.doFilter(request, response);
     }

     private void cleanExpiradas(long now) {
        if (windows.size() > 10_000) {
            windows.entrySet().removeIf(e -> now - e.getValue().inicio >= e.getValue().duracao);
        }
     }
}
