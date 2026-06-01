const API_URL = "http://localhost:8080/api/stories";
let activeStoryIdForQuote = null;

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    document.getElementById(pageId).style.display = 'block';

    if (pageId === 'library') {
        fetchStories();
    }
}

function showCustomAlert(title, message) {
    document.getElementById('custom-alert-title').innerText = title;
    document.getElementById('custom-alert-message').innerText = message;
    document.getElementById('custom-alert-modal').style.display = 'flex';
}

function closeAlertModal() {
    document.getElementById('custom-alert-modal').style.display = 'none';
}

function openQuoteModal(storyId) {
    activeStoryIdForQuote = storyId;
    document.getElementById('modal-quote-text').value = '';
    document.getElementById('modal-quote-page').value = '';
    document.getElementById('custom-quote-modal').style.display = 'flex';
}

function closeQuoteModal() {
    document.getElementById('custom-quote-modal').style.display = 'none';
    activeStoryIdForQuote = null;
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
                    quotesHtml += `<li>"${q.text}" <em style="color: #64748b;">(Page ${q.pageNumber})</em></li>`;
                });
            } else {
                quotesHtml += '<li style="color: #94a3b8; list-style: none; font-style: italic;">No lines saved yet.</li>';
            }
            quotesHtml += '</ul></div>';

            card.innerHTML = `
                <h3>${story.title}</h3>
                <p><strong>Author:</strong> ${story.author}</p>
                <p><strong>Platform:</strong> ${story.platform}</p>
                <p><strong>Status:</strong> ${story.status}</p>
                <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
                ${quotesHtml}
                <button onclick="openQuoteModal('${story.id}')" style="margin-top: 12px; padding: 8px 14px; font-size: 14px; width: 100%;">Add Quote</button>
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
        document.getElementById('add-story-form').reset();
        showCustomAlert("Success 🎉", "Story successfully registered to your library.");
        showPage('library'); 
    }
});

document.getElementById('modal-quote-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!activeStoryIdForQuote) return;

    const textValue = document.getElementById('modal-quote-text').value;
    const pageValue = document.getElementById('modal-quote-page').value;
    
    const response = await fetch(`${API_URL}/${activeStoryIdForQuote}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textValue, pageNumber: parseInt(pageValue) || 0 })
    });

    if (response.ok) {
        closeQuoteModal();
        fetchStories(); 
    }
});