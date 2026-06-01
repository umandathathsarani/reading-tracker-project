const API_URL = "http://localhost:8080/api/stories";
let allStories = []; 
let activeStoryIdForQuote = null; 
let activeQuoteIdForEdit = null;
let confirmActionCallback = null;

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
    
    if (pageId === 'library') fetchStories();

    if (pageId === 'reading-list') renderReadingList(); 
}

function showCustomAlert(title, message) {
    document.getElementById('custom-alert-title').innerText = title;
    document.getElementById('custom-alert-message').innerText = message;
    document.getElementById('custom-alert-modal').style.display = 'flex';
}
function closeAlertModal() { document.getElementById('custom-alert-modal').style.display = 'none'; }

function openConfirmModal(title, message, onConfirm) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    confirmActionCallback = onConfirm;
    document.getElementById('custom-confirm-modal').style.display = 'flex';
}
function closeConfirmModal() {
    document.getElementById('custom-confirm-modal').style.display = 'none';
    confirmActionCallback = null;
}
document.getElementById('confirm-action-btn').addEventListener('click', () => {
    if (confirmActionCallback) confirmActionCallback();
    closeConfirmModal();
});

function openEditModal(storyId) {
    const story = allStories.find(s => s.id === storyId);
    if (!story) return;
    document.getElementById('edit-id').value = story.id;
    document.getElementById('edit-title').value = story.title;
    document.getElementById('edit-author').value = story.author;
    document.getElementById('edit-platform').value = story.platform;
    document.getElementById('edit-genre').value = story.genre;
    document.getElementById('edit-status').value = story.status;
    document.getElementById('custom-edit-modal').style.display = 'flex';
}
function closeEditModal() { document.getElementById('custom-edit-modal').style.display = 'none'; }

function openQuoteModal(storyId) {
    activeStoryIdForQuote = storyId;
    document.getElementById('modal-quote-text').value = '';
    document.getElementById('modal-quote-page').value = '';
    document.getElementById('custom-quote-modal').style.display = 'flex';
}
function closeQuoteModal() { document.getElementById('custom-quote-modal').style.display = 'none'; }

function openEditQuoteModal(storyId, quoteId) {
    const story = allStories.find(s => s.id === storyId);
    const quote = story.quotes.find(q => q.id === quoteId);
    if(!quote) return;
    
    activeStoryIdForQuote = storyId;
    activeQuoteIdForEdit = quoteId;
    document.getElementById('modal-edit-quote-text').value = quote.text;
    document.getElementById('modal-edit-quote-page').value = quote.pageNumber;
    document.getElementById('custom-edit-quote-modal').style.display = 'flex';
}
function closeEditQuoteModal() { document.getElementById('custom-edit-quote-modal').style.display = 'none'; }

async function fetchStories() {
    try {
        const response = await fetch(API_URL);
        allStories = await response.json(); 
        const list = document.getElementById('story-list');
        list.innerHTML = ''; 

        allStories.forEach(story => {
            const card = document.createElement('div');

            let quotesHtml = '<div class="quotes-section"><h4>Favorite Lines:</h4><ul>';
            if (story.quotes && story.quotes.length > 0) {
                story.quotes.forEach(q => {
                    quotesHtml += `
                        <li class="quote-item">
                            <span>"${q.text}" <em style="color: #64748b;">(Page ${q.pageNumber})</em></span>
                            <div class="quote-actions">
                                <button class="btn-icon btn-icon-edit" onclick="openEditQuoteModal('${story.id}', '${q.id}')">Edit</button>
                                <button class="btn-icon btn-icon-delete" onclick="deleteQuote('${story.id}', '${q.id}')">X</button>
                            </div>
                        </li>`;
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
                <button onclick="openQuoteModal('${story.id}')" style="margin-top: 12px; padding: 8px; width: 100%;">Add Quote</button>
                <div class="card-actions">
                    <button class="btn-edit" onclick="openEditModal('${story.id}')">Edit Story</button>
                    <button class="btn-delete" onclick="requestDeleteStory('${story.id}')">Delete Story</button>
                </div>
            `;
            list.appendChild(card);
        });

        updateDashboardStats();

    } catch (error) { console.error("Error fetching stories:", error); }
}

function updateDashboardStats() {
    const totalStories = allStories.length;

    const currentlyReading = allStories.filter(story => story.status === 'Currently Reading').length;

    const completed = allStories.filter(story => story.status === 'Completed').length;

    let totalQuotes = 0;
    allStories.forEach(story => {
        if (story.quotes) {
            totalQuotes += story.quotes.length;
        }
    });

    document.getElementById('stat-total-stories').innerText = totalStories;
    document.getElementById('stat-reading').innerText = currentlyReading;
    document.getElementById('stat-completed').innerText = completed;
    document.getElementById('stat-quotes').innerText = totalQuotes;
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
        showCustomAlert("Success 🎉", "Story successfully registered to your cloud library.");
        showPage('library'); 
    }
});

document.getElementById('edit-story-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const storyId = document.getElementById('edit-id').value;
    const updatedStory = {
        title: document.getElementById('edit-title').value,
        author: document.getElementById('edit-author').value,
        platform: document.getElementById('edit-platform').value,
        genre: document.getElementById('edit-genre').value,
        status: document.getElementById('edit-status').value
    };
    const response = await fetch(`${API_URL}/${storyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedStory)
    });
    if (response.ok) {
        closeEditModal();
        fetchStories(); 
    }
});

function requestDeleteStory(storyId) {
    openConfirmModal(
        "Delete Story", 
        "Are you sure you want to delete this story? This cannot be undone.", 
        async () => {
            const response = await fetch(`${API_URL}/${storyId}`, { method: 'DELETE' });
            if(response.ok) fetchStories();
        }
    );
}

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

document.getElementById('modal-edit-quote-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!activeStoryIdForQuote || !activeQuoteIdForEdit) return;
    const textValue = document.getElementById('modal-edit-quote-text').value;
    const pageValue = document.getElementById('modal-edit-quote-page').value;
    
    const response = await fetch(`${API_URL}/${activeStoryIdForQuote}/quotes/${activeQuoteIdForEdit}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textValue, pageNumber: parseInt(pageValue) || 0 })
    });
    if (response.ok) {
        closeEditQuoteModal();
        fetchStories(); 
    }
});

function deleteQuote(storyId, quoteId) {
    openConfirmModal(
        "Delete Quote", 
        "Remove this favorite line?", 
        async () => {
            const response = await fetch(`${API_URL}/${storyId}/quotes/${quoteId}`, { method: 'DELETE' });
            if(response.ok) fetchStories();
        }
    );
}

function renderReadingList() {
    const list = document.getElementById('reading-list-grid');
    list.innerHTML = ''; 

    const activeStories = allStories.filter(story => 
        story.status === 'Currently Reading' || story.status === 'Waiting for Update'
    );

    if (activeStories.length === 0) {
        list.innerHTML = '<p style="color: #94a3b8; grid-column: 1 / -1; font-style: italic;">Your reading list is empty. You are all caught up!</p>';
        return;
    }

    activeStories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card'; 

        const badgeColor = story.status === 'Currently Reading' ? '#dcfce7' : '#fef08a';
        const textColor = story.status === 'Currently Reading' ? '#166534' : '#854d0e';

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3 style="margin: 0;">${story.title}</h3>
                <span style="background: ${badgeColor}; color: ${textColor}; padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold;">
                    ${story.status}
                </span>
            </div>
            <p style="margin-top: 15px;"><strong>Author:</strong> ${story.author}</p>
            <p><strong>Platform:</strong> ${story.platform}</p>
            
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;">
            <button class="btn-secondary" onclick="showPage('library')" style="width: 100%;">Manage in Library</button>
        `;
        list.appendChild(card);
    });
}

// Fetch data immediately when the app opens
fetchStories();