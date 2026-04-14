// --- UI Elements ---
const header = document.querySelector('.header');
const recapList = document.getElementById('recap-movies');
const newList = document.getElementById('new-releases');
const videoModal = document.getElementById('video-modal');
const playerContainer = document.getElementById('player-container');
const closeModal = document.querySelector('.close-modal');
const playHeroBtn = document.getElementById('play-hero');

// --- Functions ---

// 1. Fetch Movies from Supabase
async function fetchMovies() {
    if (!supabaseClient) {
        console.warn("Supabase is not configured.");
        return;
    }

    const { data, error } = await supabaseClient
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching movies:', error);
        return;
    }

    displayMovies(data);
}

// 2. Display Movies in Category Rows
function displayMovies(movies) {
    if (!recapList || !newList) return;
    
    recapList.innerHTML = '';
    newList.innerHTML = '';

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        if (movie.category === 'recap') {
            recapList.appendChild(movieCard);
        } else if (movie.category === 'new') {
            newList.appendChild(movieCard);
        }
    });

    // Set Hero Featured Movie (First movie in list)
    if (movies && movies.length > 0) {
        updateHero(movies[0]);
    }
}

// 3. Create Movie Card Element
function createMovieCard(movie) {
    const div = document.createElement('div');
    div.className = 'movie-card';
    div.innerHTML = `
        <img src="${movie.thumbnail}" alt="${movie.title}">
        <div class="movie-info">
            <h3>${movie.title}</h3>
        </div>
    `;
    div.onclick = () => handlePlay(movie.video_url);
    return div;
}

// 4. Update Hero Section
function updateHero(movie) {
    const title = document.getElementById('hero-title');
    const desc = document.getElementById('hero-desc');
    const hero = document.getElementById('hero');
    
    if (title) title.textContent = movie.title;
    if (desc) desc.textContent = movie.description;
    if (hero) hero.style.backgroundImage = `url('${movie.thumbnail}')`;
    
    if (playHeroBtn) {
        playHeroBtn.setAttribute('data-video-url', movie.video_url);
    }
}

// --- NEW: Play Logic with Auth Check ---
async function handlePlay(url) {
    console.log("Play triggered for:", url);
    
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error("Supabase client not found!");
        window.location.href = 'auth.html?redirect=index.html';
        return;
    }

    try {
        // Use getSession but also wait a tiny bit if it's null initially
        let { data, error } = await supabaseClient.auth.getSession();
        let session = data?.session;
        
        if (error || !session) {
            console.log("No session found, redirecting to login.");
            // Store the URL the user wants to play so we can auto-play after login
            localStorage.setItem('pendingPlayUrl', url || '');
            window.location.href = 'auth.html?redirect=index.html';
        } else {
            console.log("Session found, opening player.");
            if (url) {
                openPlayer(url);
            } else {
                alert("Filimkan diyaar ma ahan hadda.");
            }
        }
    } catch (err) {
        console.error("Auth check error:", err);
        window.location.href = 'auth.html?redirect=index.html';
    }
}

// 5. Video Player Logic (YouTube Embed Support)
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

// 6. Close Modal
if (closeModal) {
    closeModal.onclick = () => {
        videoModal.style.display = 'none';
        playerContainer.innerHTML = ''; 
        document.body.style.overflow = 'auto'; 
    };
}

window.onclick = (event) => {
    if (event.target == videoModal) {
        videoModal.style.display = 'none';
        playerContainer.innerHTML = '';
        document.body.style.overflow = 'auto';
    }
};

// 7. Scroll Header Effect (Netflix style fade)
window.onscroll = () => {
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

// 8. Immediate Button Listener
if (playHeroBtn) {
    playHeroBtn.addEventListener('click', () => {
        const url = playHeroBtn.getAttribute('data-video-url');
        handlePlay(url);
    });
}

// Initialize
async function init() {
    await fetchMovies();
    
    // Check if there's a pending video to play after login
    const pendingUrl = localStorage.getItem('pendingPlayUrl');
    if (pendingUrl) {
        localStorage.removeItem('pendingPlayUrl');
        const { data } = await supabaseClient.auth.getSession();
        if (data?.session) {
            openPlayer(pendingUrl);
        }
    }
}

init();
