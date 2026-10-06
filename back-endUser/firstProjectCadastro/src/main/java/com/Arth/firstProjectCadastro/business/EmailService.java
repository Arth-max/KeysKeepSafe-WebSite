package com.Arth.firstProjectCadastro.business;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender emailSender;

    @Value("${spring.mail.username}")
    private String remetente;

    public EmailService(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    public String enviarEmail(String destinatario, String assunto, String mensagem) {
        try {
            SimpleMailMessage email = new SimpleMailMessage();
            email.setFrom(remetente);
            email.setTo(destinatario);
            email.setSubject(assunto);
            email.setText(mensagem);
            emailSender.send(email);

            System.out.println("EMAIL ENVIADO!");
            return "email enviado!";
        } catch(Exception e) {
            System.out.println("EMAIL NÃO ENVIADO!");
            e.printStackTrace();
            return "erro ao enviar o email" + e.getLocalizedMessage();
        }
    }
}
