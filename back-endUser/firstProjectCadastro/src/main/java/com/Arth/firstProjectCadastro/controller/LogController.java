package com.Arth.firstProjectCadastro.controller;

import com.Arth.firstProjectCadastro.business.LogService;
import com.Arth.firstProjectCadastro.infrastructure.DTOs.LogsDTO;
import com.Arth.firstProjectCadastro.infrastructure.entitys.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/usuario/logs")
public class LogController {
    private LogService logService;

    public LogController(LogService logService) {
        this.logService = logService;
    }

    @GetMapping
    public ResponseEntity<List<LogsDTO>> buscarLogs(@AuthenticationPrincipal User usuario) {
        List<LogsDTO> logs = logService.buscarLogs(usuario.getId()).stream().map(LogsDTO::new).toList();
        return ResponseEntity.ok(logs);
    }
}
