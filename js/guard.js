// js/guard.js

import { supabase } from './supabaseClient.js';

async function enforceAuthentication() {
    // Check if there is an active logged-in session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        // If no session exists, or if there's an error, boot them to the login page.
        // We use .replace() so they can't hit the "Back" button to bypass it.
        window.location.replace('index.html'); 
    } else {
        // Optional: You can log this to the console for testing
        console.log("User is authenticated. Access granted.");
    }
}

// Run the check immediately
enforceAuthentication();