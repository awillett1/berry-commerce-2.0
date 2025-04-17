// businessApproval.js
// Grabs all businesses with "pending" status and autopopulates the admin table.
// Admins can approve/reject and view form data
// To be used with admin-account.html

import { getDatabase, ref, onValue, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getFirestore, collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase 
const db = getDatabase(); // rdb
const fs = getFirestore(); 
const sellerApplicationsRef = ref(db, 'sellerApplications');
const tableBody = document.getElementById('business-approvals').querySelector('table tbody');

// listen for data from FB
onValue(sellerApplicationsRef, (snapshot) => {
  tableBody.innerHTML = ''; // clear table
  snapshot.forEach((childSnapshot) => {
    const data = childSnapshot.val();
    const id = childSnapshot.key;

    const row = document.createElement('tr');
    const shortened = shortenDescription(data.businessDescription);

    row.innerHTML = `
      <td>${sanitizeInput(data.businessName || '')}</td>
      <td>${sanitizeInput(shortened)}</td>
      <td>${data.businessEmail ? `<a href="mailto:${sanitizeInput(data.businessEmail)}">${sanitizeInput(data.businessEmail)}</a>` : ''}</td>
      <td class="status-${data.status || 'pending'}">${capitalize(data.status || 'pending')}</td>
      <td>
        ${data.status === 'pending' ? ` 
          <button class="btn btn-success" onclick="confirmAction('${id}', 'approved')">Approve</button>
          <button class="btn btn-danger" onclick="confirmAction('${id}', 'rejected')">Reject</button>
        ` : ` 
          <button class="btn btn-success" disabled>Approved</button>
          <button class="btn btn-danger" disabled>Rejected</button>
        `}
        <button class="btn btn-info" onclick="viewFormDataBusiness('${id}')">View Form Data</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
});

// confirm before updating the status
window.confirmAction = function (id, newStatus) {
  const confirmation = window.confirm(`Are you sure you want to ${newStatus} this business?`);
  if (confirmation) {
    updateStatus(id, newStatus);
  }
};

// update application status and send email if approved
function updateStatus(id, newStatus) {
  const appRef = ref(db, `sellerApplications/${id}`);
  update(appRef, { status: newStatus }).then(() => {
    if (newStatus === 'approved') {
      sendApprovalEmail(id);
    }
    if (newStatus === 'rejected') {
      sendRejectionEmail(id);
    }
  }).catch((error) => {
    console.error("Error updating status:", error);
  });
}

// send product approval email
async function sendApprovalEmail(id) {
  const appRef = ref(db, `sellerApplications/${id}`);
  onValue(appRef, async (snapshot) => {
    const data = snapshot.val();
    const businessName = data.businessName
    const businessEmail = data.businessEmail;

    const noSpaces = businessName.replace(/\s+/g, '').toLowerCase();
    const pageUrl = `https://berry-commerce-20.web.app/${(noSpaces)}.html`;

    const mailRef = collection(fs, "mail");
    await addDoc(mailRef, {
      to: [businessEmail],
      message: {
        subject: `Your business has been approved`,
        html: `
          <p>Hi ${businessName},</p>
          <p>Your business <strong>${businessName}</strong> has been approved. 
          Please visit your new business site at <a href="${pageUrl}">${pageUrl}</a>.</p>
          <p>You will recieve your seller account login information shortly.</p>
          <p>If you have any questions, feel free to contact us at <a href="mailto:berrycommerce@berry.edu">berrycommerce@berry.edu</a>.</p>
        `
      }
    });
  });
}

// send product rejection email
async function sendRejectionEmail(id) {
  const appRef = ref(db, `sellerApplications/${id}`);
  onValue(appRef, async (snapshot) => {
    const data = snapshot.val();
    const businessName = data.businessName;
    const businessEmail = data.businessEmail;

    const mailRef = collection(fs, "mail");
    await addDoc(mailRef, {
      to: [businessEmail],
      message: {
        subject: `Your business has been rejected`,
        html: `
          <p>Hi ${businessName},</p>
          <p>Your business <strong>${businessName}</strong> has been rejected. 
          <p>If you have any questions, feel free to contact us at <a href="mailto:berrycommerce@berry.edu">berrycommerce@berry.edu</a>.</p>
          <p>Thank you for using Berry Commerce!</p>
          <p>- Berry Commerce Team</p>
        `
      }
    });
  });
}

// capitalize first letter for the statuses (honestly just might go back and make them capital in the db)
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// open a new window with form data
window.viewFormDataBusiness = function(id) {
  const appRef = ref(db, `sellerApplications/${id}`);
  onValue(appRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
          // create the content to display in the popup
          const popupContent = `
              <html>
                  <head>
                      <title>Seller Application Info</title>
                      <style>
                          body {
                              font-family: Arial, sans-serif;
                              padding: 20px;
                              max-width: 600px;
                              margin: auto;
                              overflow-wrap: break-word;
                          }
                          h2 {
                              text-align: center;
                          }
                          .info {
                              margin-bottom: 15px;
                              border-bottom: 1px solid #ccc;
                              padding-bottom: 10px;
                          }
                          strong {
                              display: inline-block;
                              width: 160px;
                              vertical-align: top;
                          }
                          a {
                              color: #007bff;
                              text-decoration: none;
                          }
                          a:hover {
                              text-decoration: underline;
                          }
                      </style>
                  </head>
                  <body>
                      <h2>Application Details</h2>
                      <div class="info"><strong>Business Name:</strong> ${sanitizeInput(data.businessName || '')}</div>
                      <div class="info"><strong>Business Email:</strong> <a href="mailto:${sanitizeInput(data.businessEmail)}">${sanitizeInput(data.businessEmail)}</a></div>
                      <div class="info"><strong>Description:</strong> ${sanitizeInput(sanitizeMsg(data.businessDescription || ''))}</div>
                      <div class="info"><strong>Why Join:</strong> ${sanitizeInput(data.whyJoin || '')}</div>
                      <div class="info"><strong>Products Sold:</strong> ${sanitizeInput(data.productsSell || '')}</div>
                      <div class="info"><strong>Status:</strong> ${capitalize(data.status || 'pending')}</div>
                      <div class="info"><strong>Role:</strong> ${sanitizeInput(data.role || '')}</div>
                      <div class="info"><strong>Terms Accepted:</strong> ${data.termsAccepted ? 'Yes' : 'No'}</div>
                      <div class="info"><strong>Timestamp:</strong> ${sanitizeInput(data.timestamp || '')}</div>
                  </body>
              </html>
          `;

          // open popup and put content into body
          const popupWindow = window.open("", "_blank", "width=600,height=400");
          popupWindow.document.body.innerHTML = popupContent;
          popupWindow.document.close();
      } else {
          alert("Application not found!");
      }
  }, { onlyOnce: true });
};
window.viewFormDataBusiness = viewFormDataBusiness;

// sanitize input using DOMPurify
function sanitizeInput(input) {
  return DOMPurify.sanitize(input);
}

// sanitize and convert markdown to HTML
function sanitizeMsg(message) {
  const htmlMsg = marked(message); // markdown to html
  return DOMPurify.sanitize(htmlMsg, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'], // allowed tags
      ALLOWED_ATTR: ['href'] // allowed attributes
  });
}

// make description > 40 characters shorter
function shortenDescription(description) {
  if (description && description.length > 40) {
    return description.substring(0, 40) + '...';
  }
  return description;
}
