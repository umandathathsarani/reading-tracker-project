package com.readingtracker.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.readingtracker.backend.model.Story;

@Repository
public interface StoryRepository extends MongoRepository<Story, String> {
    // Spring Boot automatically provides all standard database operations here!
}
