package com.readingtracker.backend.controller;

import com.readingtracker.backend.model.Quote;
import com.readingtracker.backend.model.Story;
import com.readingtracker.backend.repository.StoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*") 
public class StoryController {

    @Autowired
    private StoryRepository storyRepository;

    @GetMapping
    public List<Story> getAllStories() {
        return storyRepository.findAll();
    }

    @PostMapping
    public Story createStory(@RequestBody Story story) {
        return storyRepository.save(story);
    }

    @PostMapping("/{id}/quotes")
    public Story addQuote(@PathVariable String id, @RequestBody Quote quote) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Story not found"));
        
        story.getQuotes().add(quote);
        return storyRepository.save(story);
    }
}