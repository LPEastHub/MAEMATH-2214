// js/dashboard.js
import { supabase } from './supabaseClient.js';

// 👉 EXACT admin email address
const ADMIN_EMAIL = 'gerothornz05@gmail.com';

// UI Elements
const userDisplay = document.getElementById('user-email-display');
const adminPanel = document.getElementById('admin-panel');
const adminAnnounceBox = document.getElementById('admin-announcement-box');
const adminMeetingBox = document.getElementById('admin-meeting-box');
const adminVideoBox = document.getElementById('admin-video-box');

const announcementsContainer = document.getElementById('announcements-container');
const meetingsContainer = document.getElementById('meetings-container');
const videosContainer = document.getElementById('videos-container');

// --- INITIALIZE DASHBOARD ---
async function initDashboard() {
    // 1. Check if user is actually logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.replace('index.html');
        return;
    }

    const user = session.user;

    // 2. Format the user's First Name
    let displayName = user.email.split('@')[0]; 
    const rawFullName = user.user_metadata?.full_name;

    if (rawFullName && rawFullName.includes(',')) {
        const afterComma = rawFullName.split(',')[1].trim(); 
        const firstWord = afterComma.split(' ')[0]; 
        displayName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    } else if (rawFullName) {
        const firstWord = rawFullName.split(' ')[0];
        displayName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
    }

    if (userDisplay) userDisplay.textContent = displayName;

    // 3. Show Admin Tools if email matches
    if (user.email === ADMIN_EMAIL) {
        if (adminPanel) adminPanel.style.display = 'block';
        if (adminAnnounceBox) adminAnnounceBox.style.display = 'block';
        if (adminMeetingBox) adminMeetingBox.style.display = 'block';
        if (adminVideoBox) adminVideoBox.style.display = 'block';
    }

    // 4. Load all the data
    loadAnnouncements();
    loadMeetings();
    loadVideos();
}

// --- LOAD DATA FUNCTIONS ---

async function loadAnnouncements() {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    
    if (!data || data.length === 0) {
        if(announcementsContainer) announcementsContainer.innerHTML = '<p style="color: gray;">No announcements yet.</p>';
        return;
    }
    
    // Using white-space: pre-wrap to keep paragraph spaces and indentations!
    if(announcementsContainer) announcementsContainer.innerHTML = data.map(a => `
        <div style="background: #ebf8ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3182ce; margin-bottom: 15px;">
            <p style="margin: 0; color: #1a365d; white-space: pre-wrap; font-family: inherit; line-height: 1.5;">${a.content}</p>
            <small style="color: #718096; font-size: 0.8rem; display: block; margin-top: 10px;">Posted: ${new Date(a.created_at).toLocaleDateString()}</small>
        </div>
    `).join('');
}

async function loadMeetings() {
    const { data } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
    
    if (!data || data.length === 0) {
        if(meetingsContainer) meetingsContainer.innerHTML = '<p style="color: gray;">No scheduled meetings.</p>';
        return;
    }

    if(meetingsContainer) meetingsContainer.innerHTML = data.map(m => `
        <div style="background: #f0fff4; padding: 15px; border-radius: 8px; border-left: 4px solid #38a169; margin-bottom: 15px;">
            <h3 style="margin: 0 0 5px 0; color: #22543d;">${m.title}</h3>
            <p style="margin: 0 0 10px 0; color: #2f855a; font-weight: bold;">⏰ ${m.schedule}</p>
            <a href="${m.link}" target="_blank" style="display: inline-block; background-color: #38a169; color: white; text-decoration: none; padding: 8px 15px; border-radius: 4px; font-size: 0.9rem;">Join Meeting</a>
        </div>
    `).join('');
}

// --- NEW & IMPROVED VIDEO HELPER FUNCTION ---
function getEmbedUrl(url) {
    if (!url) return '';
    
    try {
        let embedUrl = url;
        
        // 1. YouTube standard
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } 
        // 2. YouTube short
        else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // 3. YouTube Shorts
        else if (url.includes('youtube.com/shorts/')) {
            const videoId = url.split('shorts/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        // 4. ANY Google Drive or Google Docs Video Link
        else if (url.includes('google.com') && url.includes('/d/')) {
            // This grabs the ID directly between "/d/" and the next "/"
            const videoId = url.split('/d/')[1].split('/')[0];
            // Forces it into Google's universal preview player
            embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
        }
        
        return embedUrl;
    } catch (e) {
        return url; // If parsing fails, return original link
    }
}

async function loadVideos() {
    if (!videosContainer) return;

    const { data } = await supabase.from('videos').select('*').order('created_at', { ascending: false });

    if (!data || data.length === 0) {
        videosContainer.innerHTML = '<p style="color: gray;">No videos posted yet.</p>';
        return;
    }

    videosContainer.innerHTML = data.map(v => {
        const embedUrl = getEmbedUrl(v.video_url);
        let mediaContent = '';
        
        // Check if the link successfully converted into an embeddable format
        if (embedUrl.includes('youtube.com/embed') || embedUrl.includes('/preview')) {
            mediaContent = `
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; max-width: 100%; border-radius: 8px; margin: 15px 0; background: #000;">
                    <iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
                </div>
            `;
        } else {
            mediaContent = `
                <div style="background: #e9d8fd; padding: 10px; border-radius: 6px; margin: 10px 0; display: inline-block;">
                    <a href="${v.video_url}" target="_blank" style="color: #553c9a; font-weight: bold; text-decoration: none;">
                        🔗 Click here to open video link
                    </a>
                </div>
            `;
        }

        return `
            <div style="border-left: 4px solid #805ad5; margin-bottom: 20px; background-color: #faf5ff; padding: 15px; border-radius: 8px;">
                <strong style="font-size: 1.1em; color: #44337a; display: block;">${v.title}</strong>
                ${mediaContent}
                <small style="color: #718096; display: block; margin-top: 5px;">Posted by ${v.author_name} on ${new Date(v.created_at).toLocaleDateString()}</small>
            </div>
        `;
    }).join('');
}

// --- POSTING FUNCTIONS (ADMIN ONLY) ---

document.getElementById('post-announcement-btn')?.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const text = document.getElementById('announcement-text').value;
    if (!text) return;
    
    const { error } = await supabase.from('announcements').insert([{ content: text, author_id: user.id }]);

    if (error) alert("Failed to post: " + error.message);
    else {
        document.getElementById('announcement-text').value = '';
        loadAnnouncements();
    }
});

document.getElementById('post-meeting-btn')?.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const title = document.getElementById('meeting-title').value;
    const time = document.getElementById('meeting-time').value;
    const link = document.getElementById('meeting-link').value;
    
    if (!title || !time || !link) return alert("Please fill all meeting fields");
    
    const { error } = await supabase.from('meetings').insert([{ title: title, schedule: time, link: link, author_id: user.id }]);

    if (error) alert("Failed to post meeting: " + error.message);
    else {
        document.getElementById('meeting-title').value = '';
        document.getElementById('meeting-time').value = '';
        document.getElementById('meeting-link').value = '';
        loadMeetings();
    }
});

document.getElementById('post-video-btn')?.addEventListener('click', async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const title = document.getElementById('video-title').value;
    const url = document.getElementById('video-url').value;
    
    if (!title || !url) return alert("Please fill all video fields");

    const authorName = user.user_metadata?.full_name || "Admin";

    const { error } = await supabase.from('videos').insert([{ title: title, video_url: url, author_name: authorName }]);

    if (error) alert("Failed to post video: " + error.message);
    else {
        document.getElementById('video-title').value = '';
        document.getElementById('video-url').value = '';
        loadVideos();
    }
});

// --- LOGOUT LOGIC ---
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
});

// Start the dashboard
initDashboard();