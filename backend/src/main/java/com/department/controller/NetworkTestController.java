package com.department.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.InetSocketAddress;
import java.net.Socket;

@RestController
public class NetworkTestController {

    @GetMapping("/network-test")
    public String testConnection() {

        String host = "mysql-1f9ac745-saranshyadav789-8a68.k.aivencloud.com";
        int port = 11617;

        try (Socket socket = new Socket()) {

            socket.connect(new InetSocketAddress(host, port), 10000);

            return "SUCCESS: Render can reach Aiven MySQL at "
                    + host + ":" + port;

        } catch (Exception e) {

            return "FAILED: " + e.getClass().getName()
                    + " - " + e.getMessage();
        }
    }
}
