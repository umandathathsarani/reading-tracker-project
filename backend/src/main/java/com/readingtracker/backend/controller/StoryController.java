package com.readingtracker.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.readingtracker.backend.model.Story;
import com.readingtracker.backend.repository.StoryRepository;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*") // Allows HTML frontend to talk to this backend.
public class StoryController {

    @Autowired
    private StoryRepository storyRepository;

    @GetMapping
    public List<Story> getAllStories() {
        return storyRepository.findAll(); 
    }

    @PostMapping
    public Story addStory(@RequestBody Story story) {
        return storyRepository.save(story);
    }

    @DeleteMapping("/{id}")
    public void deleteStory(@PathVariable String id) {
        storyRepository.deleteById(id);
    }
}