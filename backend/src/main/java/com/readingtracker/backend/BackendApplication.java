package com.readingtracker.backend;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public MongoClient mongoClient() {
        // Automatically load the hidden .env file
        Dotenv dotenv = Dotenv.load();
        String databaseLink = dotenv.get("MONGO_URI");

        if (databaseLink == null || databaseLink.isEmpty()) {
            throw new IllegalStateException("SECURITY ALERT: MONGO_URI is missing from the .env file!");
        }

        return MongoClients.create(databaseLink);
    }
}