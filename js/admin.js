// --- UI Elements ---
const loginSection = document.getElementById('login-section');
const adminFormSection = document.getElementById('admin-form-section');
const loginForm = document.getElementById('login-form');
const movieForm = document.getElementById('movie-form');
const adminMovieList = document.getElementById('admin-movie-list');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

const ADMIN_EMAIL = 'barkhad@example.com'; // Admin email allowed

// --- Auth Logic ---

// Check session on load
async function checkSession() {
    if (!supabaseClient) return;
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (session && session.user.email === ADMIN_EMAIL) {
        showAdminPanel();
    } else {
        showLoginPage();
    }
}

// Login Function
if (loginForm) {
    loginForm.onsubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        loginError.textContent = 'Soo gelaya...';

        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            loginError.textContent = 'Khalad: ' + error.message;
            return;
        }

        if (data.user.email !== ADMIN_EMAIL) {
            await supabaseClient.auth.signOut();
            loginError.textContent = 'Ma laguu ogola inaad gasho boggan.';
            return;
        }

        showAdminPanel();
    };
}

// Logout Function
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        await supabaseClient.auth.signOut();
        window.location.reload();
    };
}

function showAdminPanel() {
    if (loginSection) loginSection.style.display = 'none';
    if (adminFormSection) adminFormSection.style.display = 'block';
    fetchAdminMovies();
}

function showLoginPage() {
    if (loginSection) loginSection.style.display = 'block';
    if (adminFormSection) adminFormSection.style.display = 'none';
}

// --- Movie Management Logic ---

async function fetchAdminMovies() {
    if (!supabaseClient) return;

    const { data, error } = await supabaseClient
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }

    renderAdminMovies(data);
}

function renderAdminMovies(movies) {
    if (!adminMovieList) return;
    
    if (movies.length === 0) {
        adminMovieList.innerHTML = '<p>Ma jiraan filimaan la helay.</p>';
        return;
    }

    adminMovieList.innerHTML = movies.map(movie => `
        <div class="manage-item">
            <div class="item-info">
                <strong>${movie.title}</strong> <span>(${movie.category})</span>
            </div>
            <button class="delete-btn" onclick="deleteMovie('${movie.id}')">Tirtir</button>
        </div>
    `).join('');
}

// Add New Movie
if (movieForm) {
    movieForm.onsubmit = async (e) => {
        e.preventDefault();

        const movieData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            thumbnail: document.getElementById('thumbnail').value,
            video_url: document.getElementById('video').value,
        };

        const { error } = await supabaseClient
            .from('movies')
            .insert([movieData]);

        if (error) {
            alert('Khalad ayaa dhacay: ' + error.message);
        } else {
            alert('Filimka si guul leh ayaa loo daabacay!');
            movieForm.reset();
            fetchAdminMovies();
        }
    };
}

// Delete Movie
window.deleteMovie = async (id) => {
    if (!confirm('Ma hubtaa inaad tirtirto filimkan?')) return;

    const { error } = await supabaseClient
        .from('movies')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Khalad: ' + error.message);
    } else {
        fetchAdminMovies();
    }
};

// Initialize
checkSession();
