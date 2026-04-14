// --- UI Elements ---
const header = document.querySelector('.header');
const logoutBtn = document.getElementById('logout-btn');
const playHeroBtn = document.getElementById('play-hero');
const videoModal = document.getElementById('video-modal');
const playerContainer = document.getElementById('player-container');
const closeModal = document.querySelector('.close-modal');

// Category Lists
const categoryLists = {
    recap: document.getElementById('recap-list'),
    action: document.getElementById('action-list'),
    musalsal: document.getElementById('musalsal-list'),
    hindi: document.getElementById('hindi-list')
};

// --- Auth Check ---
async function checkUserSession() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        // Not logged in, redirect to auth page
        window.location.href = 'auth.html';
        return;
    }
    
    // User is logged in, fetch data
    fetchDashboardMovies();
}

// --- Fetch & Display Logic ---
async function fetchDashboardMovies() {
    const { data, error } = await supabaseClient
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching movies:', error);
        return;
    }

    displayCategorizedMovies(data);
}

function displayCategorizedMovies(movies) {
    // Clear lists first
    Object.values(categoryLists).forEach(list => {
        if (list) list.innerHTML = '';
    });

    if (!movies || movies.length === 0) return;

    // Set Hero (Latest movie)
    updateHero(movies[0]);

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        const category = movie.category.toLowerCase();
        
        // Match category to list
        if (categoryLists[category]) {
            categoryLists[category].appendChild(movieCard);
        } else {
            // Fallback for categories not explicitly in our list but in DB
            // We could add a 'Others' row or ignore
        }
    });

    // Check for empty categories and show message
    Object.keys(categoryLists).forEach(key => {
        const list = categoryLists[key];
        if (list && list.children.length === 0) {
            list.innerHTML = '<p class="empty-msg">Halkan weli filim laguma soo darin.</p>';
        }
    });
}

function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'movie-card dashboard-card';
    div.innerHTML = `
        <img src="${movie.thumbnail}" alt="${movie.title}">
        <div class="movie-info">
            <div class="card-play-icon">▶</div>
            <h3>${movie.title}</h3>
        </div>
    `;
    div.onclick = () => openPlayer(movie.video_url);
    return div;
}

function updateHero(movie) {
    const title = document.getElementById('hero-title');
    const desc = document.getElementById('hero-desc');
    const hero = document.getElementById('hero');
    
    if (title) title.textContent = movie.title;
    if (desc) desc.textContent = movie.description;
    if (hero) hero.style.backgroundImage = `url('${movie.thumbnail}')`;
    
    if (playHeroBtn) {
        playHeroBtn.onclick = () => openPlayer(movie.video_url);
    }
}

// --- Player Logic ---
function openPlayer(url) {
    let embedUrl = url;
    
    if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1].split('&')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    if (playerContainer) {
        playerContainer.innerHTML = `
            <iframe src="${embedUrl}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen></iframe>
        `;
    }
    
    if (videoModal) {
        videoModal.style.display = 'block';
        document.body.style.overflow = 'hidden'; 
    }
}

if (closeModal) {
    closeModal.onclick = () => {
        videoModal.style.display = 'none';
        playerContainer.innerHTML = ''; 
        document.body.style.overflow = 'auto'; 
    };
}

// --- Logout ---
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await supabaseClient.auth.signOut();
        window.location.href = 'index.html';
    };
}

// --- Header Scroll Effect ---
window.onscroll = () => {
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

// Initialize
checkUserSession();
