package com.readingtracker.backend.model;

import java.util.UUID;

public class Quote {
    private String id;
    private String text;
    private int pageNumber;

    public Quote() {
        this.id = UUID.randomUUID().toString(); 
    }

    public Quote(String text, int pageNumber) {
        this.id = UUID.randomUUID().toString();
        this.text = text;
        this.pageNumber = pageNumber;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
}