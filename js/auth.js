// --- UI Elements ---
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authError = document.getElementById('auth-error');
const toggleAuth = document.getElementById('toggle-auth');
const toggleText = document.getElementById('toggle-text');
const nameGroup = document.getElementById('name-group');

let isLogin = true; // Mode: Login or Register

// --- Toggle Logic ---
if (toggleAuth) {
    toggleAuth.onclick = (e) => {
        e.preventDefault();
        isLogin = !isLogin;
        
        if (isLogin) {
            authTitle.textContent = 'Gasho';
            authSubtitle.textContent = 'Ku soo dhawaaw SnapMovie! Fadlan gasho akoonkaaga.';
            authSubmitBtn.textContent = 'GASHO';
            nameGroup.style.display = 'none';
            toggleText.innerHTML = 'Ma haysatid akoon? <a href="#" id="toggle-auth">Is-diiwaangeli</a>';
        } else {
            authTitle.textContent = 'Is-diiwaangeli';
            authSubtitle.textContent = 'Ku soo biir SnapMovie! Bilow daawashada maanta.';
            authSubmitBtn.textContent = 'IS-DIIWAANGELI';
            nameGroup.style.display = 'block';
            toggleText.innerHTML = 'Hadda ma haysataa akoon? <a href="#" id="toggle-auth">Gasho</a>';
        }
        
        // Re-attach toggle click event
        const newToggle = document.getElementById('toggle-auth');
        if (newToggle) newToggle.onclick = toggleAuth.onclick;
        authError.textContent = '';
    };
}

// --- Auth Action ---
if (authForm) {
    authForm.onsubmit = async (e) => {
        e.preventDefault();
        
        if (!supabaseClient) {
            authError.textContent = 'Supabase laguma xirin si sax ah.';
            return;
        }

        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name') ? document.getElementById('auth-name').value : '';

        authError.textContent = 'Processing...';

        if (isLogin) {
            // Sign In
            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
            if (error) {
                authError.textContent = 'Khalad: ' + error.message;
            } else {
                redirectToHome();
            }
        } else {
            // Sign Up with Name
            const { error } = await supabaseClient.auth.signUp({ 
                email, 
                password,
                options: {
                    data: { full_name: name }
                }
            });
            if (error) {
                authError.textContent = 'Khalad: ' + error.message;
            } else {
                alert('Akoonka waa la abuuray! Fadlan hubi email-kaaga.');
                redirectToHome();
            }
        }
    };
}

function redirectToHome() {
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect') || 'index.html'; // Default to home page
    window.location.href = redirect;
}

// Check if already logged in
async function checkAuth() {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) {
        console.error("Supabase client not found on Auth page!");
        return;
    }
    
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        const session = data?.session;
        
        if (session) {
            console.log("Session found on Auth page, redirecting to home.");
            redirectToHome();
        }
    } catch (err) {
        console.error("Auth check error on Auth page:", err);
    }
}

checkAuth();
