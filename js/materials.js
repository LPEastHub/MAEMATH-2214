// js/materials.js
import { supabase } from './supabaseClient.js';

// 👉 Change this to the email address that should have Admin powers
const ADMIN_EMAIL = 'gerothornz05@gmail.com'; 

const uploadForm = document.getElementById('upload-form');
const fileInput = document.getElementById('file-input');
const titleInput = document.getElementById('file-title');
const uploadBtn = document.getElementById('upload-btn');
const uploadMessage = document.getElementById('upload-message');
const materialsContainer = document.getElementById('materials-container');

let currentUserEmail = '';

function showMessage(text, isError = false) {
    if(!uploadMessage) return; // safety check
    uploadMessage.textContent = text;
    uploadMessage.style.color = isError ? '#d9534f' : '#5cb85c';
}

// Helper function to figure out the file type and return an emoji
function getFileIcon(fileUrl) {
    if (!fileUrl) return '📎'; // Default icon if no file
    
    // Get the letters after the last dot (e.g., "pdf", "docx")
    const ext = fileUrl.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') return '📕';
    if (ext === 'docx' || ext === 'doc') return '📘';
    if (ext === 'pptx' || ext === 'ppt') return '📙';
    if (ext === 'xlsx' || ext === 'xls') return '📗';
    if (ext === 'mp4' || ext === 'mov') return '🎥';
    if (ext === 'jpg' || ext === 'png' || ext === 'jpeg') return '🖼️';
    
    return '📁'; // Default for anything else
}

// Upload logic
if(uploadForm) {
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const file = fileInput.files[0];
        const title = titleInput.value;
        if (!file) return;

        uploadBtn.textContent = 'Uploading...';
        uploadBtn.disabled = true;
        showMessage('Uploading...', false);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage.from('class_materials').upload(fileName, file);
            if (uploadError) throw uploadError;

            // Get public URL
            const { data: publicUrlData } = supabase.storage.from('class_materials').getPublicUrl(fileName);

            // Important: Make sure this table matches your database! (e.g., recordings_materials vs shared_documents)
            const { error: dbError } = await supabase.from('shared_documents').insert([
                { title: title, file_url: publicUrlData.publicUrl, uploaded_by: currentUserEmail }
            ]);
            if (dbError) throw dbError;

            showMessage('Success!', false);
            uploadForm.reset();
            loadMaterials();
        } catch (error) {
            showMessage(`Error: ${error.message}`, true);
        } finally {
            uploadBtn.textContent = 'Upload File';
            uploadBtn.disabled = false;
            setTimeout(() => { showMessage('', false); }, 3000);
        }
    });
}

// Load Materials & Reports
async function loadMaterials() {
    const { data: { user } } = await supabase.auth.getUser();
    currentUserEmail = user.email;

    // Fetch documents
    // Note: ensure 'shared_documents' matches your actual table name in Supabase
    const { data: generalDocs } = await supabase.from('shared_documents').select('*');
    const { data: reportDocs } = await supabase.from('report_submissions').select('*');

    const formattedDocs = (generalDocs || []).map(doc => ({ 
        id: doc.id,
        title: doc.title,
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at,
        file_url: doc.file_url,
        type: 'shared_documents' 
    }));

    const formattedReports = (reportDocs || []).map(report => ({
        id: report.id,
        title: `Group ${report.group_number} Report - ${report.student_name}`,
        uploaded_by: report.submitted_by_email,
        created_at: report.created_at,
        file_url: report.file_url,
        type: 'report_submissions'
    }));

    const allFiles = [...formattedDocs, ...formattedReports].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (allFiles.length === 0) {
        materialsContainer.innerHTML = '<p style="color: gray; text-align: center; padding: 20px;">No materials uploaded yet.</p>';
        return;
    }

    materialsContainer.innerHTML = allFiles.map(item => {
        // Only show delete button if it's their file OR they are the admin
        const canDelete = (item.uploaded_by === currentUserEmail) || (currentUserEmail === ADMIN_EMAIL);
        
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; margin-bottom: 1rem;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 1.8rem;">${getFileIcon(item.file_url)}</span>
                
                <div>
                    <h3 style="font-size: 1.05rem; color: #1a365d; margin-bottom: 0.25rem;">${item.title}</h3>
                    <small style="color: #718096;">Uploaded by: ${item.uploaded_by.split('@')[0]} | ${new Date(item.created_at).toLocaleDateString()}</small>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px;">
                ${canDelete ? `<button onclick="deleteFile('${item.id}', '${item.type}')" class="btn-outline" style="border-color: #e53e3e; color: #e53e3e; padding: 5px 10px;">Delete</button>` : ''}
                <a href="${item.file_url}" target="_blank" download class="btn-outline" style="padding: 5px 10px; text-decoration: none;">Download</a>
            </div>
        </div>
        `;
    }).join('');
}

// Global Delete Function
window.deleteFile = async function(id, table) {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        alert("File removed!");
        loadMaterials();
    } catch (error) {
        alert("Error deleting file: " + error.message);
    }
}

window.addEventListener('DOMContentLoaded', loadMaterials);
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
});