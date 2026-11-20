package com.Arth.firstProjectCadastro.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ErrorController {
    private static final Logger log = LoggerFactory.getLogger(ErrorController.class);

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handle (RuntimeException e) {
        log.error("Erro não tratado", e);
        return ResponseEntity.badRequest().body(e.getMessage());
    }
}
