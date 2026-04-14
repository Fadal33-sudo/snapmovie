// --- UI Elements ---
const header = document.querySelector('.header');
const recapList = document.getElementById('recap-movies');
const newList = document.getElementById('new-releases');
const musalsalList = document.getElementById('musalsal-movies');
const actionList = document.getElementById('action-movies');
const hindiList = document.getElementById('hindi-movies');
const protectedCategories = document.getElementById('protected-categories');
const navAuthContainer = document.getElementById('nav-auth-container');
const mainNav = document.getElementById('main-nav');
const videoModal = document.getElementById('video-modal');
const playerContainer = document.getElementById('player-container');
const closeModal = document.querySelector('.close-modal');
const playHeroBtn = document.getElementById('play-hero');
const toast = document.getElementById('toast');

// --- State ---
let currentUser = null;

// --- Functions ---

// 1. Fetch Movies from Supabase
async function fetchMovies() {
    if (typeof supabaseClient === 'undefined') {
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
    const lists = {
        recap: recapList,
        new: newList,
        musalsal: musalsalList,
        action: actionList,
        hindi: hindiList
    };

    // Clear all lists
    Object.values(lists).forEach(list => {
        if (list) list.innerHTML = '';
    });

    if (!movies || movies.length === 0) return;

    // Set Hero Featured Movie (First movie in list)
    updateHero(movies[0]);

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        const category = movie.category ? movie.category.toLowerCase() : '';
        
        if (lists[category]) {
            lists[category].appendChild(movieCard);
        } else if (category === 'recap') {
            recapList.appendChild(movieCard);
        } else {
            // Default to new releases if category unknown
            newList.appendChild(movieCard);
        }
    });
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

// 5. Auth State Handling
async function setupAuth() {
    if (typeof supabaseClient === 'undefined') return;

    // Listen for auth changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentUser = session?.user || null;
        updateUIForAuth(currentUser);
        
        if (event === 'SIGNED_IN') {
            showToast("Ku soo dhawaaw SnapMovie!");
            // Check for pending play
            const pendingUrl = localStorage.getItem('pendingPlayUrl');
            if (pendingUrl) {
                localStorage.removeItem('pendingPlayUrl');
                openPlayer(pendingUrl);
            }
        }
    });

    // Initial check
    const { data: { session } } = await supabaseClient.auth.getSession();
    currentUser = session?.user || null;
    updateUIForAuth(currentUser);
}

function updateUIForAuth(user) {
    if (user) {
        // Logged In State
        protectedCategories.style.display = 'block';
        
        // Update Navbar
        navAuthContainer.innerHTML = `
            <div class="user-profile">
                <span class="user-email">${user.email.split('@')[0]}</span>
                <button id="logout-btn" class="btn-logout-small">Ka Bax</button>
            </div>
        `;
        
        // Add dynamic nav links if not present
        if (!document.getElementById('nav-musalsal')) {
            const links = [
                { id: 'nav-musalsal', text: 'Musalsal', href: '#musalsal' },
                { id: 'nav-action', text: 'Action', href: '#action' },
                { id: 'nav-hindi', text: 'Hindi', href: '#hindi' }
            ];
            links.forEach(link => {
                const a = document.createElement('a');
                a.id = link.id;
                a.href = link.href;
                a.textContent = link.text;
                mainNav.appendChild(a);
            });
        }

        document.getElementById('logout-btn').onclick = async () => {
            await supabaseClient.auth.signOut();
            window.location.reload();
        };

    } else {
        // Logged Out State
        protectedCategories.style.display = 'none';
        navAuthContainer.innerHTML = `<a href="auth.html" class="nav-link" id="auth-link">GASHO</a>`;
        
        // Remove dynamic nav links
        ['nav-musalsal', 'nav-action', 'nav-hindi'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.remove();
        });
    }
}

// 6. Play Logic
async function handlePlay(url) {
    if (!currentUser) {
        // User not logged in, redirect to auth.html
        localStorage.setItem('pendingPlayUrl', url || '');
        window.location.href = `auth.html?redirect=index.html`;
    } else {
        // User logged in
        if (url) {
            openPlayer(url);
        } else {
            alert("Filimkan diyaar ma ahan hadda.");
        }
    }
}

// 7. Video Player Logic
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

// 8. UI Helpers
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

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

window.onscroll = () => {
    if (window.scrollY > 0) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

if (playHeroBtn) {
    playHeroBtn.addEventListener('click', () => {
        const url = playHeroBtn.getAttribute('data-video-url');
        handlePlay(url);
    });
}

// Initialize
async function init() {
    await setupAuth();
    await fetchMovies();
}

init();
