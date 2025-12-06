package com.eventplatform.controller;

import com.eventplatform.service.QRCodeService;
import com.google.zxing.WriterException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/qrcode")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QRCodeController {

    private final QRCodeService qrCodeService;

    @GetMapping("/generate")
    public ResponseEntity<byte[]> generateQRCode(
            @RequestParam String data,
            @RequestParam(required = false, defaultValue = "300") int width,
            @RequestParam(required = false, defaultValue = "300") int height)
            throws WriterException, IOException {

        byte[] qrCode = qrCodeService.generateQRCodeImage(data);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentLength(qrCode.length);

        return new ResponseEntity<>(qrCode, headers, HttpStatus.OK);
    }

    @GetMapping("/generate-base64")
    public ResponseEntity<String> generateQRCodeBase64(@RequestParam String data)
            throws WriterException, IOException {

        String base64QRCode = qrCodeService.generateQRCodeBase64(data);
        return ResponseEntity.ok(base64QRCode);
    }
}