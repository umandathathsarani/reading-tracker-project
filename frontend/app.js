const API_URL = "http://localhost:8080/api/stories";

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    document.getElementById(pageId).style.display = 'block';

    if (pageId === 'library') {
        fetchStories();
    }
}

async function fetchStories() {
    try {
        const response = await fetch(API_URL);
        const stories = await response.json();
        const list = document.getElementById('story-list');
        list.innerHTML = ''; 

        stories.forEach(story => {
            const card = document.createElement('div');
            card.className = 'story-card'; 
            card.innerHTML = `
                <h3>${story.title}</h3>
                <p><strong>Author:</strong> ${story.author}</p>
                <p><strong>Platform:</strong> ${story.platform}</p>
                <p><strong>Status:</strong> ${story.status}</p>
            `;
            list.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching stories:", error);
    }
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

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(story)
    });

    if (response.ok) {
        alert("Story added successfully!");
        document.getElementById('add-story-form').reset();
        showPage('library'); 
    }
});