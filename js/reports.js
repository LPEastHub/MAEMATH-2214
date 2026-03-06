// js/reports.js
import { supabase } from './supabaseClient.js';

// 👉 Change this to match your admin email
const ADMIN_EMAIL = 'YOUR_PROF_EMAIL@gmail.com'; 

const groupsContainer = document.getElementById('groups-container');

// Modal Elements
const modal = document.getElementById('upload-modal');
const closeModalBtn = document.getElementById('close-modal');
const uploadForm = document.getElementById('report-upload-form');
const modalStudentName = document.getElementById('modal-student-name');
const hiddenStudentName = document.getElementById('hidden-student-name');
const hiddenGroupNumber = document.getElementById('hidden-group-number');
const submitBtn = document.getElementById('submit-report-btn');
const modalMessage = document.getElementById('modal-message');

// Editing State
let isEditing = false;
let editingReportId = null;

// --- THE RESTRUCTURED SYLLABUS DATA ---
const classGroups = [
    {
        number: 1, topic: "Introduction to Numerical Analysis and Error Analysis",
        objective: "To introduce graduate students to numerical methods and develop an understanding of approximation and error in numerical computation.",
        members: [
            { name: "CAINOS, SHERYL A.", role: "Leader" },
            { name: "CAOILE, MAVEL D.", role: "Asst Leader" },
            { name: "CELLO, LLANY C.", role: "Member" },
            { name: "CRISOSTOMO, RYAN G.", role: "Member" },
            { name: "DAGA, ROLINEMEL BENJA B.", role: "Member" }
        ]
    },
    {
        number: 2, topic: "Numerical Solutions of Equations and Interpolation",
        objective: "To develop students’ ability to apply numerical methods in solving equations and approximating functions...",
        members: [
            { name: "ERA, DINO ANTHONY M.", role: "Leader" },
            { name: "ERA, JESSA C.", role: "Asst Leader" },
            { name: "FEDERESO, JOMAR IVAN A.", role: "Member" },
            { name: "FELLO, RIZALYN C.", role: "Member" },
            { name: "FERNANDEZ, THELMA L.", role: "Member" },
            { name: "GOSIM, RHENALYN J.", role: "Member" }
        ]
    },
    {
        number: 3, topic: "Numerical Differentiation, Integration, and Differential Equations",
        objective: "To enable students to approximate derivatives, integrals, and solutions of differential equations...",
        members: [
            { name: "MACACNA, FARHANAH B.", role: "Leader" },
            { name: "OXALES, PENE G.", role: "Asst Leader" },
            { name: "PAITON, CHERWIN E.", role: "Member" },
            { name: "PALACIO, LYNNIE P.", role: "Member" },
            { name: "PENSON, AIDA M.", role: "Member" },
            { name: "PLASABAS, EDGARDO A.", role: "Member" }
        ]
    },
    {
        number: 4, topic: "Technology Integration and Pedagogical Applications",
        objective: "To equip students with the ability to integrate technology in numerical analysis instruction...",
        members: [
            { name: "SALAS, JEROME C.", role: "Leader" },
            { name: "TAMBUYAT, JEROME C.", role: "Asst Leader" },
            { name: "TAN, ARIELLE T.", role: "Member" },
            { name: "VALENCIA, GERALD B.", role: "Member" },
            { name: "VILLAFLORES, AIZA MARIE R.", role: "Member" },
            { name: "ZARA, EDLYN D.", role: "Member" }
        ]
    }
];

// --- RENDER FUNCTION ---
async function loadGroups() {
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserEmail = user.email;

    const { data: submissions, error } = await supabase.from('report_submissions').select('*');
    if (error) console.error("Error fetching submissions:", error);

    const subsList = submissions || [];

    groupsContainer.innerHTML = classGroups.map(group => `
        <section class="card" style="margin-bottom: 2rem;">
            <div class="card-header" style="background-color: #1a365d; color: white; padding: 15px;">
                <h2 style="margin: 0;">Group ${group.number}: ${group.topic}</h2>
            </div>
            <div class="card-content" style="padding: 20px;">
                <h4 style="margin-bottom: 5px; color: #4a5568;">🎯 Group Objective:</h4>
                <p style="font-size: 0.95rem; margin-bottom: 20px;">${group.objective}</p>
                <hr style="border: 0; border-top: 2px solid #e2e8f0; margin: 20px 0;">
                <h3 style="color: #2b6cb0; margin-bottom: 15px;">👥 Individual Member Reports</h3>

                <div style="display: grid; gap: 15px;">
                    ${group.members.map(member => {
                        const memberSub = subsList.find(s => s.student_name === member.name);
                        const isOwnerOrAdmin = memberSub && (memberSub.submitted_by_email === currentUserEmail || currentUserEmail === ADMIN_EMAIL);
                        
                        return `
                        <div style="border: 1px solid #cbd5e0; border-radius: 8px; padding: 15px; background-color: ${memberSub ? '#f0fff4' : '#f7fafc'};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <h4 style="margin: 0; color: #1a202c; font-size: 1.05rem;">👤 ${member.name}</h4>
                                <span style="background-color: ${member.role.includes('Leader') ? '#bee3f8' : '#e2e8f0'}; color: ${member.role.includes('Leader') ? '#2b6cb0' : '#4a5568'}; padding: 3px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: bold;">${member.role}</span>
                            </div>

                            ${memberSub ? `
                                <p style="font-size: 0.85rem; color: #2f855a; margin-bottom: 10px;"><strong>✅ Topic:</strong> ${memberSub.sub_topic}</p>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                    <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #c6f6d5;">
                                        <strong>📝 Description:</strong><br><span style="font-size: 0.8rem;">${memberSub.description}</span>
                                    </div>
                                    <div style="background: white; padding: 10px; border-radius: 5px; border: 1px solid #c6f6d5; display: flex; flex-direction: column; gap: 5px; align-items: center; justify-content: center;">
                                        <a href="${memberSub.file_url}" target="_blank" download class="btn primary-btn" style="text-decoration: none; width: 100%; text-align: center; font-size: 0.85rem;">📂 Download</a>
                                        
                                        <div style="display: flex; gap: 5px; width: 100%;">
                                            ${isOwnerOrAdmin ? `
                                                <button onclick="openEditModal('${memberSub.id}', '${member.name}', ${group.number}, '${memberSub.sub_topic.replace(/'/g, "\\'")}', '${memberSub.description.replace(/'/g, "\\'")}')" class="btn-outline" style="flex: 1; font-size: 0.75rem; padding: 5px;">✏️ Edit</button>
                                                <button onclick="deleteReport('${memberSub.id}')" class="btn-outline" style="flex: 1; font-size: 0.75rem; padding: 5px; border-color: #e53e3e; color: #e53e3e;">🗑️ Delete</button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            ` : `
                                <p style="font-size: 0.85rem; color: #a0aec0; margin-bottom: 10px;"><em>Topic pending...</em></p>
                                <div style="display: flex; justify-content: space-between; align-items: center; background: #edf2f7; padding: 10px; border-radius: 5px; border: 1px dashed #a0aec0;">
                                    <span style="color: #718096; font-size: 0.85rem;">[Awaiting submission]</span>
                                    <button onclick="openModal('${member.name}', ${group.number})" class="btn-outline" style="font-size: 0.8rem; padding: 5px 10px;">Upload Report</button>
                                </div>
                            `}
                        </div>`;
                    }).join('')}
                </div>
            </div>
        </section>
    `).join('');
}

// --- DELETE FUNCTION ---
window.deleteReport = async function(reportId) {
    if (!confirm("Are you sure you want to delete this report? This cannot be undone.")) return;

    try {
        const { error } = await supabase
            .from('report_submissions')
            .delete()
            .eq('id', reportId);

        if (error) throw error;

        alert("Report deleted successfully.");
        loadGroups(); // Refresh the UI
    } catch (err) {
        alert("Error deleting report: " + err.message);
    }
}

// --- MODAL CONTROLS ---
window.openModal = function(studentName, groupNumber) {
    isEditing = false;
    editingReportId = null;
    modalStudentName.textContent = studentName;
    hiddenStudentName.value = studentName;
    hiddenGroupNumber.value = groupNumber;
    
    document.getElementById('sub-topic').value = "";
    document.getElementById('report-description').value = "";
    document.getElementById('report-file').required = true;
    submitBtn.textContent = 'Upload Report';
    
    modal.style.display = "block";
}

window.openEditModal = function(id, name, groupNum, topic, desc) {
    isEditing = true;
    editingReportId = id;
    
    modalStudentName.textContent = `Editing: ${name}`;
    hiddenStudentName.value = name;
    hiddenGroupNumber.value = groupNum;
    
    document.getElementById('sub-topic').value = topic;
    document.getElementById('report-description').value = desc;
    
    document.getElementById('report-file').required = false;
    submitBtn.textContent = 'Save Changes';
    
    modal.style.display = "block";
}

closeModalBtn.onclick = function() { modal.style.display = "none"; }
window.onclick = function(event) { if (event.target == modal) modal.style.display = "none"; }

function showMessage(text, isError = false) {
    modalMessage.textContent = text;
    modalMessage.style.color = isError ? '#d9534f' : '#5cb85c';
}

// --- HANDLE FORM SUBMISSION ---
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentName = hiddenStudentName.value;
    const groupNum = hiddenGroupNumber.value;
    const subTopic = document.getElementById('sub-topic').value;
    const desc = document.getElementById('report-description').value;
    const file = document.getElementById('report-file').files[0];

    if (!isEditing && !file) return;

    submitBtn.disabled = true;
    submitBtn.textContent = isEditing ? 'Updating...' : 'Uploading...';
    showMessage(isEditing ? 'Updating record...' : 'Uploading to database...', false);

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const uploaderEmail = user.email;
        let fileUrl = null;

        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `Group${groupNum}_${studentName.replace(/[^a-zA-Z0-9]/g, '')}_${Date.now()}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage.from('report_files').upload(fileName, file);
            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('report_files').getPublicUrl(fileName);
            fileUrl = publicUrlData.publicUrl;
        }

        const reportData = {
            student_name: studentName,
            group_number: groupNum,
            sub_topic: subTopic,
            description: desc,
            submitted_by_email: uploaderEmail
        };

        if (fileUrl) {
            reportData.file_url = fileUrl;
        }

        if (isEditing) {
            const { error: dbError } = await supabase
                .from('report_submissions')
                .update(reportData)
                .eq('id', editingReportId);
            if (dbError) throw dbError;
        } else {
            const { error: dbError } = await supabase
                .from('report_submissions')
                .insert([reportData]);
            if (dbError) throw dbError;
        }

        uploadForm.reset();
        
        setTimeout(() => {
            modal.style.display = "none";
            modalMessage.textContent = "";
            loadGroups(); 
        }, 1500);

    } catch (error) {
        showMessage(`Error: ${error.message}`, true);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = isEditing ? 'Save Changes' : 'Upload Report';
    }
});

// Load everything on start
window.addEventListener('DOMContentLoaded', loadGroups);

// Logout logic
document.getElementById('logout-btn')?.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.replace('index.html');
});