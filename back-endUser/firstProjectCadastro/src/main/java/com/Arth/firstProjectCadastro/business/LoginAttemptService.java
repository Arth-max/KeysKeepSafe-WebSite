package com.Arth.firstProjectCadastro.business;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginAttemptService {
    private static final int MAX_FALHAS = 5;
    private static final long Bloqueio_Ms = 15 * 60_000;

    private record Tentativa(int falhas, long primeiraFalha) {}
    private final Map<String, Tentativa> tentativa = new ConcurrentHashMap<>();

    public boolean bloqueado(String id) {
        Tentativa t = tentativa.get(id);
        if (t == null) return false;

        if (System.currentTimeMillis() - t.primeiraFalha() >= Bloqueio_Ms) {
            tentativa.remove(id);
            return false;
        }
        return t.falhas() >= MAX_FALHAS;
    }

    public void failed(String id) {
        long now = System.currentTimeMillis();
        tentativa.merge(id, new Tentativa(1, now), (a, b)
                -> new Tentativa(a.falhas() + 1, a.primeiraFalha()));
    }
    public void succed(String id) { tentativa.remove(id); }
}
