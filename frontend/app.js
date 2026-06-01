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

            let quotesHtml = '<div class="quotes-section"><h4>Favorite Lines:</h4><ul>';
            if (story.quotes && story.quotes.length > 0) {
                story.quotes.forEach(q => {
                    quotesHtml += `<li>"${q.text}" <em>(Page ${q.pageNumber})</em></li>`;
                });
            } else {
                quotesHtml += '<li style="color: #94a3b8; list-style: none;">No quotes added yet.</li>';
            }
            quotesHtml += '</ul></div>';

            card.innerHTML = `
                <h3>${story.title}</h3>
                <p><strong>Author:</strong> ${story.author}</p>
                <p><strong>Platform:</strong> ${story.platform}</p>
                <p><strong>Status:</strong> ${story.status}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                ${quotesHtml}
                <button onclick="addQuote('${story.id}')" style="margin-top: 10px; padding: 8px 12px; font-size: 14px;">Add Quote</button>
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

async function addQuote(storyId) {
    const text = prompt("Enter your favorite line:");
    if (!text) return;

    const page = prompt("Enter page number (or chapter):");
    
    const response = await fetch(`${API_URL}/${storyId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, pageNumber: parseInt(page) || 0 })
    });

    if (response.ok) {
        fetchStories(); 
    }
}