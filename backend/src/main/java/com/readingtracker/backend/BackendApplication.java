package com.readingtracker.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

    @Bean
    public MongoClient mongoClient() {
        String databaseLink = System.getenv("MONGO_URI");

        if (databaseLink == null || databaseLink.isEmpty()) {
            throw new IllegalStateException("SECURITY ALERT: MONGO_URI environment variable is missing!");
        }

        return MongoClients.create(databaseLink);
    }
}