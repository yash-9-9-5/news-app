document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const topicBtns = document.querySelectorAll('.topic-btn');
    const sortBy = document.getElementById('sort-by');
    const language = document.getElementById('language');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('error-message');
    const newsContainer = document.getElementById('news-container');
    const loadMoreBtn = document.getElementById('load-more');
    
    // API Configuration
    const apiKey = 'aeb319d8c0ec4419a81c0c10818ef4c8';
    const baseUrl = 'https://newsapi.org/v2/everything';
    
    // Pagination
    let currentPage = 1;
    let currentQuery = '';
    let currentSort = 'publishedAt';
    let currentLanguage = 'en';
    
    // Fetch news data
    async function fetchNews(query, page = 1, sortBy = 'publishedAt', language = 'en') {
        try {
            loading.classList.remove('hidden');
            errorMessage.classList.add('hidden');
            
            const response = await fetch(`${baseUrl}?q=${query}&apiKey=${apiKey}&page=${page}&pageSize=10&sortBy=${sortBy}&language=${language}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching news:', error);
            return null;
        } finally {
            loading.classList.add('hidden');
        }
    }
    
    // Display news articles
    function displayNews(articles) {
        if (!articles || articles.length === 0) {
            newsContainer.innerHTML = '';
            errorMessage.classList.remove('hidden');
            loadMoreBtn.classList.add('hidden');
            return;
        }
        
        articles.forEach(article => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';
            const publishedDate = new Date(article.publishedAt).toLocaleDateString();
            
            newsCard.innerHTML = `
                <img src="${imageUrl}" alt="${article.title}" class="news-image" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
                <div class="news-content">
                    <div class="news-source">
                        <span class="source-name">${article.source.name}</span>
                        <span>${publishedDate}</span>
                    </div>
                    <h3 class="news-title">${article.title}</h3>
                    <p class="news-desc">${article.description || 'No description available'}</p>
                    <a href="${article.url}" target="_blank" class="read-more">Read More →</a>
                </div>
            `;
            
            newsContainer.appendChild(newsCard);
        });
        
        loadMoreBtn.classList.remove('hidden');
    }
    
    // Handle search
    async function handleSearch() {
        const query = searchInput.value.trim();
        
        if (query) {
            currentQuery = query;
            currentPage = 1;
            currentSort = sortBy.value;
            currentLanguage = language.value;
            
            newsContainer.innerHTML = '';
            const data = await fetchNews(query, currentPage, currentSort, currentLanguage);
            
            if (data && data.articles) {
                displayNews(data.articles);
            } else {
                errorMessage.classList.remove('hidden');
                loadMoreBtn.classList.add('hidden');
            }
        }
    }
    
    // Load more news
    async function loadMoreNews() {
        currentPage++;
        const data = await fetchNews(currentQuery, currentPage, currentSort, currentLanguage);
        
        if (data && data.articles) {
            displayNews(data.articles);
            
            // Hide load more button if we've reached the end
            if (data.articles.length < 10) {
                loadMoreBtn.classList.add('hidden');
            }
        }
    }
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    topicBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            searchInput.value = this.dataset.topic;
            handleSearch();
        });
    });
    
    sortBy.addEventListener('change', function() {
        if (currentQuery) {
            currentSort = this.value;
            currentPage = 1;
            newsContainer.innerHTML = '';
            fetchNews(currentQuery, currentPage, currentSort, currentLanguage)
                .then(data => displayNews(data?.articles));
        }
    });
    
    language.addEventListener('change', function() {
        if (currentQuery) {
            currentLanguage = this.value;
            currentPage = 1;
            newsContainer.innerHTML = '';
            fetchNews(currentQuery, currentPage, currentSort, currentLanguage)
                .then(data => displayNews(data?.articles));
        }
    });
    
    loadMoreBtn.addEventListener('click', loadMoreNews);
    
    // Initial load with default topic (technology)
    searchInput.value = 'technology';
    handleSearch();
});