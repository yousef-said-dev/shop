import { account } from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
    // If already logged in, redirect to admin
    try {
        await account.get();
        window.location.href = 'admin.html';
        return;
    } catch (err) {
        // Not logged in, show form
    }

    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const spinner = loginBtn.querySelector('.spinner');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            loginError.style.display = 'none';
            btnText.classList.add('hidden');
            spinner.classList.remove('hidden');
            loginBtn.style.pointerEvents = 'none';

            try {
                // Log the user in
                await account.createEmailPasswordSession(email, password);

                // Redirect on success
                window.location.href = 'admin.html';
            } catch (error) {
                console.error("Login failed:", error);
                loginError.textContent = error.message;
                loginError.style.display = 'block';
            } finally {
                btnText.classList.remove('hidden');
                spinner.classList.add('hidden');
                loginBtn.style.pointerEvents = 'all';
            }
        });
    }
});
