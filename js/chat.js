import { supabase } from './supabaseClient.js';

const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

let currentUserEmail = '';
let currentUserName = '';

async function initChat() {
    // 1. Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    currentUserEmail = user.email;
    currentUserName = user.email.split('@')[0].toUpperCase();

    // 2. Load existing messages (last 50)
    loadMessages();

    // 3. Subscribe to REALTIME updates
    const channel = supabase
        .channel('schema-db-changes')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages' },
            (payload) => {
                renderSingleMessage(payload.new);
                scrollToBottom();
            }
        )
        .subscribe();
}

async function loadMessages() {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) {
        chatWindow.innerHTML = `<p style="text-align: center; color: #e53e3e;">Error loading messages: ${error.message}</p>`;
        return;
    }

    chatWindow.innerHTML = ''; // Clear loading text
    
    if (data.length === 0) {
        chatWindow.innerHTML = `<p style="text-align: center; color: #94a3b8; font-size: 0.9rem; margin-top: 20px;">No messages yet. Start the conversation!</p>`;
    } else {
        data.forEach(msg => renderSingleMessage(msg));
        scrollToBottom();
    }
}

function renderSingleMessage(msg) {
    const isMine = msg.sender_email === currentUserEmail;
    
    // Format the timestamp to a readable format (e.g., 2:30 PM)
    let timeString = '';
    if (msg.created_at) {
        const date = new Date(msg.created_at);
        timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = `message-wrapper ${isMine ? 'mine' : 'others'}`;
    
    const senderName = isMine ? 'You' : msg.sender_name;
    
    // Build the new structure: Info on top, bubble on the bottom
    wrapperDiv.innerHTML = `
        <div class="message-info">
            <strong>${senderName}</strong>
            <span style="opacity: 0.7; font-weight: normal;">${timeString}</span>
        </div>
        <div class="message">${msg.content}</div>
    `;
    
    chatWindow.appendChild(wrapperDiv);
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Explicitly handle the "Enter" key
messageInput.addEventListener('keydown', (e) => {
    // Check if the key pressed is "Enter"
    if (e.key === 'Enter') {
        e.preventDefault(); // Stop any default browser behavior
        chatForm.dispatchEvent(new Event('submit')); // Trigger the form submission
    }
});

// Handle the actual sending logic
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;

    // Clear the input immediately for UI responsiveness
    messageInput.value = '';
    
    // Auto-focus back on the input so the user can keep typing immediately
    messageInput.focus();

    const { error } = await supabase.from('messages').insert([
        { 
            content: content, 
            sender_email: currentUserEmail, 
            sender_name: currentUserName 
        }
    ]);

    if (error) alert("Failed to send: " + error.message);
});

initChat();

// Logout Logic
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
});