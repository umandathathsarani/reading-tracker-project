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

    @PutMapping("/{id}")
    public Story updateStory(@PathVariable String id, @RequestBody Story updatedStory) {
        Story story = storyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Story not found"));
        
        story.setTitle(updatedStory.getTitle());
        story.setAuthor(updatedStory.getAuthor());
        story.setPlatform(updatedStory.getPlatform());
        story.setGenre(updatedStory.getGenre());
        story.setStatus(updatedStory.getStatus());
        
        return storyRepository.save(story);
    }

    @DeleteMapping("/{id}")
    public void deleteStory(@PathVariable String id) {
        storyRepository.deleteById(id);
    }

    @PutMapping("/{storyId}/quotes/{quoteId}")
    public Story updateQuote(@PathVariable String storyId, @PathVariable String quoteId, @RequestBody Quote updatedQuote) {
        Story story = storyRepository.findById(storyId)
            .orElseThrow(() -> new RuntimeException("Story not found"));

        for (Quote q : story.getQuotes()) {
            if (q.getId() != null && q.getId().equals(quoteId)) {
                q.setText(updatedQuote.getText());
                q.setPageNumber(updatedQuote.getPageNumber());
                break;
            }
        }
        return storyRepository.save(story);
    }

    @DeleteMapping("/{storyId}/quotes/{quoteId}")
    public Story deleteQuote(@PathVariable String storyId, @PathVariable String quoteId) {
        Story story = storyRepository.findById(storyId)
            .orElseThrow(() -> new RuntimeException("Story not found"));

        story.getQuotes().removeIf(q -> q.getId() != null && q.getId().equals(quoteId));
        return storyRepository.save(story);
    }

}