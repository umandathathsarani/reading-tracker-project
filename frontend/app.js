const API_URL = "http://localhost:8080/api/stories";

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    if (pageId === 'library') fetchStories();
}

async function fetchStories() {
    const response = await fetch(API_URL);
    const stories = await response.json();
    const list = document.getElementById('story-list');
    list.innerHTML = ''; 

    stories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card';
        card.innerHTML = `
            <h3>${story.title}</h3>
            <p>${story.author} | ${story.genre}</p>
            <button onclick="addQuote('${story.id}')">Add Quote</button>
        `;
        list.appendChild(card);
    });
}

document.getElementById('add-story-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const story = {
        title: document.getElementById('title').value,
        author: document.getElementById('author').value,
        platform: document.getElementById('platform').value,
        genre: document.getElementById('genre').value,
        status: document.getElementById('status').value
    };

    await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story)
    });
    alert("Story added!");
    showPage('library'); 
});

async function addQuote(storyId) {
    const text = prompt("Enter your favorite line:");
    const page = prompt("Enter page number:");
    
    await fetch(`${API_URL}/${storyId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, pageNumber: page })
    });
    alert("Quote saved!");
}