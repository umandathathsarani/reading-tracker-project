const API_URL = "http://localhost:8080/api/stories";
let allStories = []; 
let activeStoryIdForQuote = null; 
let activeQuoteIdForEdit = null;
let confirmActionCallback = null;

async function loadPage(pageId) {
    try {
        const response = await fetch(`${pageId}.html`);
        if (!response.ok) throw new Error("Page not found");
        const html = await response.text();
        document.getElementById('app-content').innerHTML = html;

        if (pageId === 'dashboard') {
            const savedName = localStorage.getItem('userName') || 'Umanda';
            document.getElementById('dashboard-welcome-msg').innerText = `Welcome back, ${savedName}!`;
            if (allStories.length === 0) await fetchStoriesData();
            updateDashboardStats();
        } else if (pageId === 'library') {
            document.getElementById('search-input').addEventListener('input', renderLibrary);
            document.getElementById('sort-select').addEventListener('change', renderLibrary);
            if (allStories.length === 0) await fetchStoriesData();
            renderLibrary();
        } else if (pageId === 'add') {
            document.getElementById('add-story-form').addEventListener('submit', handleAddStory);
        } else if (pageId === 'reading') {
            if (allStories.length === 0) await fetchStoriesData();
            renderReadingList();
        } else if (pageId === 'profile') {
            const savedName = localStorage.getItem('userName') || 'Umanda';
            document.getElementById('display-name').value = savedName;

            const themeToggle = document.getElementById('dark-mode-toggle');
            themeToggle.checked = localStorage.getItem('theme') === 'dark';
            themeToggle.addEventListener('change', handleThemeToggle);

            document.getElementById('profile-form').addEventListener('submit', handleProfileSave);
            document.getElementById('export-btn').addEventListener('click', handleExport);
        }
    } catch (error) {
        console.error("Error loading page:", error);
        document.getElementById('app-content').innerHTML = "<p style='color:red;'>Error loading page. Ensure you are running a local development server.</p>";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    loadPage('dashboard');
});

async function fetchStoriesData() {
    try {
        const response = await fetch(API_URL);
        allStories = await response.json(); 
    } catch (error) { console.error("Error fetching stories:", error); }
}

function updateDashboardStats() {
    const totalStories = allStories.length;
    const currentlyReading = allStories.filter(story => story.status === 'Currently Reading').length;
    const completed = allStories.filter(story => story.status === 'Completed').length;

    let totalQuotes = 0;
    allStories.forEach(story => {
        if (story.quotes) totalQuotes += story.quotes.length;
    });

    const elTotal = document.getElementById('stat-total-stories');
    const elReading = document.getElementById('stat-reading');
    const elCompleted = document.getElementById('stat-completed');
    const elQuotes = document.getElementById('stat-quotes');

    if(elTotal) elTotal.innerText = totalStories;
    if(elReading) elReading.innerText = currentlyReading;
    if(elCompleted) elCompleted.innerText = completed;
    if(elQuotes) elQuotes.innerText = totalQuotes;
}

function renderLibrary() {
    const list = document.getElementById('story-list');
    if(!list) return;
    list.innerHTML = ''; 

    const searchQuery = document.getElementById('search-input').value.toLowerCase();
    const sortValue = document.getElementById('sort-select').value;

    let filteredStories = allStories.filter(story => 
        story.title.toLowerCase().includes(searchQuery) || 
        story.author.toLowerCase().includes(searchQuery)
    );

    if (sortValue === 'title') {
        filteredStories.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortValue === 'author') {
        filteredStories.sort((a, b) => a.author.localeCompare(b.author));
    } else if (sortValue === 'status') {
        filteredStories.sort((a, b) => a.status.localeCompare(b.status));
    }

    if (filteredStories.length === 0) {
        list.innerHTML = '<p style="color: var(--muted-text); grid-column: 1 / -1; font-style: italic;">No stories found matching your search.</p>';
        return;
    }

    filteredStories.forEach(story => {
        const card = document.createElement('div');
        card.className = 'story-card'; 
        
        let quotesHtml = '<div class="quotes-section"><h4>Favorite Lines:</h4><ul>';
        if (story.quotes && story.quotes.length > 0) {
            story.quotes.forEach(q => {
                quotesHtml += `
                    <li class="quote-item">
                        <span>"${q.text}" <em style="color: var(--muted-text);">(Page ${q.pageNumber})</em></span>
                        <div class="quote-actions">
                            <button class="btn-icon btn-icon-edit" onclick="openEditQuoteModal('${story.id}', '${q.id}')">Edit</button>
                            <button class="btn-icon btn-icon-delete" onclick="deleteQuote('${story.id}', '${q.id}')">X</button>
                        </div>
                    </li>`;
            });
        } else {
            quotesHtml += '<li style="color: var(--muted-text); list-style: none; font-style: italic;">No lines saved yet.</li>';
        }
        quotesHtml += '</ul></div>';

        card.innerHTML = `
            <h3>${story.title}</h3>
            <p><strong>Author:</strong> ${story.author}</p>
            <p><strong>Platform:</strong> ${story.platform}</p>
            <p><strong>Status:</strong> ${story.status}</p>
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 15px 0;">
            ${quotesHtml}
            <button onclick="openQuoteModal('${story.id}')" style="margin-top: 12px; padding: 8px; width: 100%;">Add Quote</button>
            <div class="card-actions">
                <button class="btn-edit" onclick="openEditModal('${story.id}')">Edit Story</button>
                <button class="btn-delete" onclick="requestDeleteStory('${story.id}')">Delete Story</button>
            </div>
        `;
        list.appendChild(card);
    });
}

function renderReadingList() {
    const list = document.getElementById('reading-list-grid');
    if(!list) return;
    list.innerHTML = ''; 

    const activeStories = allStories.filter(story => 
        story.status === 'Currently Reading' || story.status === 'Waiting for Update'
    );

    if (activeStories.length === 0) {
        list.innerHTML = '<p style="color: var(--muted-text); grid-column: 1 / -1; font-style: italic;">Your reading list is empty. You are all caught up!</p>';
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
            
            <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 15px 0;">
            <button class="btn-secondary" onclick="loadPage('library')" style="width: 100%;">Manage in Library</button>
        `;
        list.appendChild(card);
    });
}

async function handleAddStory(e) {
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
        await fetchStoriesData();
        loadPage('library'); 
    }
}

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
        await fetchStoriesData();
        renderLibrary();
    }
});

function requestDeleteStory(storyId) {
    openConfirmModal(
        "Delete Story", 
        "Are you sure you want to delete this story? This cannot be undone.", 
        async () => {
            const response = await fetch(`${API_URL}/${storyId}`, { method: 'DELETE' });
            if(response.ok) {
                await fetchStoriesData();
                renderLibrary();
            }
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
        await fetchStoriesData();
        renderLibrary(); 
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
        await fetchStoriesData();
        renderLibrary(); 
    }
});

function deleteQuote(storyId, quoteId) {
    openConfirmModal(
        "Delete Quote", 
        "Remove this favorite line?", 
        async () => {
            const response = await fetch(`${API_URL}/${storyId}/quotes/${quoteId}`, { method: 'DELETE' });
            if(response.ok) {
                await fetchStoriesData();
                renderLibrary();
            }
        }
    );
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

function handleProfileSave(e) {
    e.preventDefault();
    const newName = document.getElementById('display-name').value;
    localStorage.setItem('userName', newName);
    showCustomAlert("Settings Saved", "Your display name has been updated.");
}

function handleThemeToggle(e) {
    if (e.target.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}

function handleExport() {
    if (!allStories || allStories.length === 0) {
        showCustomAlert("Export Unavailable", "Your library is empty. Please add items to track first!");
        return;
    }
    const chosenFormat = document.getElementById('export-format').value;
    if (chosenFormat === 'csv') exportToCSV();
    else if (chosenFormat === 'pdf') exportToPDF();
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Title,Author,Platform,Genre,Status,Saved Lines Count\n";

    allStories.forEach(story => {
        const quotesCount = story.quotes ? story.quotes.length : 0;
        const cleanTitle = story.title.replace(/"/g, '""');
        const cleanAuthor = story.author.replace(/"/g, '""');
        const cleanPlatform = story.platform.replace(/"/g, '""');
        const cleanGenre = story.genre.replace(/"/g, '""');
        const row = `"${cleanTitle}","${cleanAuthor}","${cleanPlatform}","${cleanGenre}","${story.status}",${quotesCount}`;
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_reading_library.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFont("times", "normal");
    doc.setFontSize(24);
    doc.text("My Reading Tracker Library", 20, 25);
    doc.setFontSize(10);
    doc.text(`Exported on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 33);
    doc.setLineWidth(0.5);
    doc.line(20, 37, 190, 37);
    
    let yPosition = 50;
    
    allStories.forEach((story, idx) => {
        if (yPosition > 260) {
            doc.addPage();
            yPosition = 25;
        }
        
        doc.setFont("times", "bold");
        doc.setFontSize(14);
        doc.text(`${idx + 1}. ${story.title}`, 20, yPosition);
        yPosition += 6;
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.text(`Author: ${story.author}  |  Platform: ${story.platform}  |  Genre: ${story.genre}  |  Status: ${story.status}`, 25, yPosition);
        yPosition += 8;
        
        if (story.quotes && story.quotes.length > 0) {
            doc.setFont("times", "italic");
            doc.setFontSize(10);
            doc.text("Favorite Lines:", 25, yPosition);
            yPosition += 5;
            story.quotes.forEach(quote => {
                if (yPosition > 260) { doc.addPage(); yPosition = 25; }
                doc.text(`  - "${quote.text}" (Page/Ch: ${quote.pageNumber})`, 28, yPosition);
                yPosition += 5;
            });
            yPosition += 3;
        }
        yPosition += 5; 
    });
    
    doc.save("my_reading_library.pdf");
}