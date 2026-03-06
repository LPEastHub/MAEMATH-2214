// js/dashboard.js
import { supabase } from './supabaseClient.js';

// 👉 Change this to match the admin email exactly!
const ADMIN_EMAIL = 'gerothornz05@gmail.com';

const userDisplay = document.getElementById('user-email-display');
const adminAnnounceBox = document.getElementById('admin-announcement-box');
const adminMeetingBox = document.getElementById('admin-meeting-box');
const announcementsContainer = document.getElementById('announcements-container');
const meetingsContainer = document.getElementById('meetings-container');

async function initDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // --- NEW: FIRST NAME EXTRACTION LOGIC ---
    let displayName = user.email.split('@')[0]; // Default fallback
    const rawFullName = user.user_metadata?.full_name;

    if (rawFullName && rawFullName.includes(',')) {
        // Example: "ERA, DINO ANTHONY M." -> " DINO ANTHONY M."
        const afterComma = rawFullName.split(',')[1].trim(); 
        
        // "DINO ANTHONY M." -> "DINO"
        const firstWord = afterComma.split(' ')[0]; 
        
        // "DINO" -> "Dino"
        displayName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    } else if (rawFullName) {
        // Just in case someone bypassed the comma format
        const firstWord = rawFullName.split(' ')[0];
        displayName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }

    // Set the welcome text to the shiny new first name
    if (userDisplay) {
        userDisplay.textContent = displayName;
    }

    // Show hidden admin tools if the logged in user is the professor
    if (user.email === ADMIN_EMAIL) {
        if (adminAnnounceBox) adminAnnounceBox.style.display = 'block';
        if (adminMeetingBox) adminMeetingBox.style.display = 'block';
    }

    loadAnnouncements();
    loadMeetings();
}

// LOAD DATA
async function loadAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (!data || data.length === 0) return announcementsContainer.innerHTML = '<p style="color: gray;">No announcements yet.</p>';
    
    announcementsContainer.innerHTML = data.map(a => `
        <div style="background: #ebf8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3182ce; margin-bottom: 15px;">
            <p style="margin: 0; color: #1a365d;">${a.content}</p>
            <small style="color: #718096; font-size: 0.8rem; display: block; margin-top: 8px;">Posted: ${new Date(a.created_at).toLocaleDateString()}</small>
        </div>
    `).join('');
}

async function loadMeetings() {
    const { data } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
    if (!data || data.length === 0) return meetingsContainer.innerHTML = '<p style="color: gray;">No scheduled meetings.</p>';

    meetingsContainer.innerHTML = data.map(m => `
        <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #38a169; margin-bottom: 15px;">
            <h3 style="margin: 0 0 5px 0; color: #22543d;">${m.title}</h3>
            <p style="margin: 0 0 10px 0; color: #2f855a; font-weight: bold;">⏰ ${m.schedule}</p>
            <a href="${m.link}" target="_blank" class="btn primary-btn" style="background-color: #38a169; text-decoration: none; padding: 5px 15px; font-size: 0.9rem;">Join Meeting</a>
        </div>
    `).join('');
}

// POST NEW DATA (Admin Only)
document.getElementById('post-announcement-btn')?.addEventListener('click', async () => {
    const text = document.getElementById('announcement-text').value;
    if (!text) return;
    await supabase.from('announcements').insert([{ content: text }]);
    document.getElementById('announcement-text').value = '';
    loadAnnouncements();
});

document.getElementById('post-meeting-btn')?.addEventListener('click', async () => {
    const title = document.getElementById('meeting-title').value;
    const time = document.getElementById('meeting-time').value;
    const link = document.getElementById('meeting-link').value;
    if (!title || !time || !link) return alert("Please fill all meeting fields");
    
    await supabase.from('meetings').insert([{ title: title, schedule: time, link: link }]);
    document.getElementById('meeting-title').value = '';
    document.getElementById('meeting-time').value = '';
    document.getElementById('meeting-link').value = '';
    loadMeetings();
});

document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
});

// Start the dashboard
initDashboard();