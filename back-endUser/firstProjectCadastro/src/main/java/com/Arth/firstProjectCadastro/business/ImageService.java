package com.Arth.firstProjectCadastro.business;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Iterator;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class ImageService {
    private static final long MAX_BYTES = 2 * 1024 * 1024;
    private static final int MAX_LADO = 4000;
    private static final Pattern NOME_VALIDO = Pattern.compile("^[0-9a-f-]{36}\\.(png|jpg)$");
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private final Path pasta;

    public ImageService(@Value("${app.upload.dir}") String dir) throws IOException {
        this.pasta = Path.of(dir).toAbsolutePath().normalize();
        Files.createDirectories(pasta);
    }

    public String salvar(MultipartFile file) throws IOException {
        if (file.isEmpty() || file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem inválida");
        }

        try (ImageInputStream in = ImageIO.createImageInputStream(file.getInputStream())) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(in);
            if (!readers.hasNext()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo não é uma imagem");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                String formato = reader.getFormatName().toLowerCase();
                if (!formato.equals("png") && !formato.equals("jpeg")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use imagens PNG ou JPG");
                }
                if (reader.getWidth(0) > MAX_LADO || reader.getHeight(0) > MAX_LADO) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Imagem muito grande");
                }

                BufferedImage img;
                try {
                    img = reader.read(0);
                } catch (IOException e) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não foi possível ler a imagem");
                }
                String ext = formato.equals("png") ? "png" : "jpg";
                String nome = UUID.randomUUID() + "." + ext;

                ImageIO.write(img, ext, pasta.resolve(nome).toFile());
                if (!ImageIO.write(img, ext, pasta.resolve(nome).toFile())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Formato não suportado");
                }
                return nome;
            } finally {
                reader.dispose();
            }
        }
    }

    public Resource carregar(String nome) {
        if (nome == null || !NOME_VALIDO.matcher(nome).matches()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        Path arquivo = pasta.resolve(nome).normalize();
        if (!arquivo.startsWith(pasta) || !Files.exists(arquivo)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        return new FileSystemResource(arquivo);
    }

    public void apagar(String nome) {
        if (nome == null || !NOME_VALIDO.matcher(nome).matches()) return;
        try {
            Files.deleteIfExists(pasta.resolve(nome).normalize());
        } catch(IOException e) {
            log.warn("Erro ao deletar a imagem");
        }
    }
}
