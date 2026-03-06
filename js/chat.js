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
        chatWindow.innerHTML = `<p>Error loading messages: ${error.message}</p>`;
        return;
    }

    chatWindow.innerHTML = ''; // Clear loading text
    data.forEach(msg => renderSingleMessage(msg));
    scrollToBottom();
}

function renderSingleMessage(msg) {
    const isMine = msg.sender_email === currentUserEmail;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isMine ? 'mine' : 'others'}`;
    
    msgDiv.innerHTML = `
        <span class="message-info">${isMine ? 'You' : msg.sender_name}</span>
        <div>${msg.content}</div>
    `;
    
    chatWindow.appendChild(msgDiv);
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Sending a message
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = messageInput.value.trim();
    if (!content) return;

    messageInput.value = '';

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