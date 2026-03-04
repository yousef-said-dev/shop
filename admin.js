import { databases, account, DATABASE_ID, COLLECTION_ID } from './app.js';

document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('bookingsTableBody');
    const adminError = document.getElementById('adminError');

    // Check Authentication
    try {
        const user = await account.get();
        // Authorized: Proceed
    } catch (err) {
        // Not authorized: redirect to login
        window.location.href = 'admin-login.html';
        return;
    }

    // Check if configuration is missing
    if (DATABASE_ID.includes('REPLACE')) {
        showError("Appwrite configuration missing. Please update your Project ID, Database ID, and Collection ID inside app.js.", "error");
        renderEmptyState("Missing DB config");
        return;
    }

    try {
        // Fetch document list from Appwrite Database
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_ID
        );

        const documents = response.documents || [];

        if (documents.length === 0) {
            renderEmptyState("No sessions booked yet.");
            return;
        }

        // Generate rows
        let rowsHtml = '';

        const sortedDocs = documents.sort((a, b) => new Date(b.$createdAt) - new Date(a.$createdAt));

        sortedDocs.forEach(doc => {
            const dateStr = new Date(doc.$createdAt).toLocaleString(undefined, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            rowsHtml += `
                <tr>
                    <td style="font-weight: 500;">${escapeHTML(doc.name)}</td>
                    <td style="font-family: monospace; letter-spacing: 1px;">${escapeHTML(doc.phone_number)}</td>
                    <td style="color: var(--text-muted);">${dateStr}</td>
                    <td>
                        <button class="btn-icon" title="Delete Session" onclick="deleteSession('${doc.$id}')">
                            <i class="ph ph-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = rowsHtml;

    } catch (error) {
        console.error("Failed to load sessions:", error);
        showError(`Error loading data: ${error.message}`, "error");
        renderEmptyState("Could not load sessions");
    }

    // Helper to safely display user inputs
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g,
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    function renderEmptyState(message) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="ph ph-calendar-blank"></i>
                    <p>${message}</p>
                </td>
            </tr>
        `;
    }

    function showError(message, type) {
        adminError.innerHTML = `
            <i class="ph ph-warning-circle" style="margin-right:0.5rem"></i> ${message}
        `;
        adminError.className = `alert show ${type}`;
        adminError.style.display = 'block';
    }

});

window.logout = async () => {
    try {
        await account.deleteSession('current');
        window.location.href = 'admin-login.html';
    } catch (err) {
        alert("Failed to logout: " + err.message);
    }
}

// We need to attach this to Window because we are using an ES module and inline handlers 'onclick' can't access it
window.deleteSession = async (documentId) => {
    if (!confirm('Are you sure you want to permanently delete this booking?')) return;

    try {
        await databases.deleteDocument(
            DATABASE_ID,
            COLLECTION_ID,
            documentId
        );
        alert("Session deleted successfully");
        location.reload(); // Refresh table
    } catch (error) {
        console.error("Failed deleting session:", error);
        alert(`Failed to delete session: ${error.message}`);
    }
};
