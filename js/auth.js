// js/auth.js

// 1. Import your Supabase client
import { supabase } from './supabaseClient.js';

// 2. Grab the HTML elements we need to interact with
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message'); // Fixed typo here!

// --- UI TOGGLE LOGIC ---

// Switch to Register Form
showRegisterBtn.addEventListener('click', () => {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
    authMessage.textContent = ''; // Clear any old messages
});

// Switch to Login Form
showLoginBtn.addEventListener('click', () => {
    registerSection.style.display = 'none';
    loginSection.style.display = 'block';
    authMessage.textContent = ''; 
});

// Helper function to show success/error messages
function displayMessage(text, isError = false) {
    authMessage.textContent = text;
    authMessage.style.color = isError ? '#d9534f' : '#5cb85c'; // Red for error, Green for success
}

// --- SUPABASE REGISTRATION LOGIC (With Whitelist Check) ---

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop the page from refreshing
    
    // Grab the values and force the name to uppercase to match the database
    const fullName = document.getElementById('register-full-name').value.trim().toUpperCase();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    displayMessage('Verifying name against official class list...', false);

    try {
        // Step 1: Check if the name exists in the allowed_students table
        const { data: allowedUser, error: checkError } = await supabase
            .from('allowed_students')
            .select('full_name')
            .eq('full_name', fullName)
            .single();

        // If no user is found, or an error occurs during the check, block registration
        if (checkError || !allowedUser) {
            displayMessage('❌ Registration Denied: Name not found on the official class list. Ensure it matches exactly (e.g., SURNAME, FIRST NAME M.).', true);
            return; // Stop the function here
        }

        // Step 2: If the name is valid, proceed with Supabase Sign Up
        displayMessage('Name verified! Creating account...', false);
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName // Save the verified name to their user profile
                }
            }
        });

        if (error) throw error;

        // Success!
        displayMessage('Registration successful! You can now log in.', false);
        registerForm.reset();
        
        // Automatically switch them back to the login view after 2 seconds
        setTimeout(() => {
            registerSection.style.display = 'none';
            loginSection.style.display = 'block';
            authMessage.textContent = '';
        }, 2000);

    } catch (err) {
        displayMessage(err.message, true);
    }
});

// --- SUPABASE LOGIN LOGIC ---

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    displayMessage('Logging in...', false);

    // Call Supabase to verify credentials
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        displayMessage("Error: " + error.message, true);
    } else {
        displayMessage('Login successful! Redirecting...', false);
        
        // Redirect the user to the protected dashboard
        window.location.href = 'dashboard.html';
    }
});

// --- AUTO-REDIRECT LOGIC ---
// If a classmate who is ALREADY logged in visits index.html, 
// send them straight to the dashboard so they don't have to log in again.
window.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.replace('dashboard.html');
    }
});