package com.readingtracker.backend.model;

public class Quote {
    private String text;
    private int pageNumber;

    public Quote() {}

    public Quote(String text, int pageNumber) {
        this.text = text;
        this.pageNumber = pageNumber;
    }

    // Getters and Setters
    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public int getPageNumber() { return pageNumber; }
    public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
}