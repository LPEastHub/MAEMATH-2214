// js/app.js

// 1. Import your Supabase client
import { supabase } from './supabaseClient.js';

// --- LOGOUT LOGIC ---
const logoutBtn = document.getElementById('logout-btn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        // Tell Supabase to end the session
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error("Error logging out:", error.message);
        } else {
            // Kick them back to the login page securely
            window.location.replace('index.html');
        }
    });
}

// --- FETCH ANNOUNCEMENTS ---
async function loadAnnouncements() {
    const container = document.getElementById('announcements-container');
    if (!container) return; // Exit if we aren't on the dashboard page

    // Fetch data from the 'announcements' table, newest first
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        container.innerHTML = `<p style="color: red;">Error loading announcements: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<p style="color: #718096;">No announcements at this time.</p>';
        return;
    }

    // Map through the data and create HTML for each announcement
    container.innerHTML = data.map(item => `
        <div class="feed-item" style="border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h3 style="font-size: 1.05rem; color: #2b6cb0; margin-bottom: 0.25rem;">${item.title}</h3>
            <p style="font-size: 0.95rem; color: #4a5568; margin-bottom: 0.5rem;">${item.content}</p>
            <small style="color: #a0aec0; font-size: 0.8rem;">
                Posted: ${new Date(item.created_at).toLocaleDateString()}
            </small>
        </div>
    `).join('');
}

// --- FETCH CLASS SCHEDULE ---
async function loadSchedule() {
    const container = document.getElementById('schedule-container');
    if (!container) return;

    // Fetch data from the 'class_schedule' table, sorting by date
    const { data, error } = await supabase
        .from('class_schedule')
        .select('*')
        .order('date', { ascending: true });

    if (error) {
        container.innerHTML = `<p style="color: red;">Error loading schedule: ${error.message}</p>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<p style="color: #718096;">No upcoming classes scheduled.</p>';
        return;
    }

    // Map through the data and create HTML for each class
    container.innerHTML = data.map(item => `
        <div class="feed-item" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;">
            <div>
                <strong style="color: #2d3748; display: block;">${new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</strong>
                <span style="color: #4a5568; font-size: 0.95rem;">${item.topic}</span>
            </div>
            <a href="${item.meeting_link}" target="_blank" class="btn primary-btn" style="width: auto; padding: 0.5rem 1rem; font-size: 0.85rem; text-decoration: none;">Join</a>
        </div>
    `).join('');
}


// --- FETCH USER DETAILS ---
async function loadUser() {
    const welcomeHeader = document.getElementById('welcome-user');
    if (!welcomeHeader) return;

    // Ask Supabase for the currently logged-in user
    const { data: { user }, error } = await supabase.auth.getUser();

    if (user) {
        // Extract the part of the email before the "@" symbol
        const emailPrefix = user.email.split('@')[0];
        
        // Update the HTML
        welcomeHeader.textContent = `Welcome - ${emailPrefix}`;
    } else {
        welcomeHeader.textContent = `Welcome to Numerical Analysis`;
    }
}
// --- INITIALIZE THE DASHBOARD ---
// Run these functions as soon as the DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    loadUser();          // <--- Add this line!
    loadAnnouncements();
    loadSchedule();
});