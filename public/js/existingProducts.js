// existingProducts.js
// Prepopulates table in seller-account.html to see your status on the products you have posted
// To be used in seller-account.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

const db = getDatabase();

// get table body element
const productTableBody = document.getElementById('product-table-body');

// fetch products for the current seller only
function fetchProducts() {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const currentUserId = user.uid;
            const userProductsRef = ref(db, `products/${currentUserId}`);

            get(userProductsRef).then((snapshot) => {
                if (!snapshot.exists()) {
                    console.log("No products found for this seller.");
                    productTableBody.innerHTML = '<tr><td colspan="5">You have not posted any products yet.</td></tr>';
                    return;
                }

                const products = snapshot.val();
                const productList = [];

                for (const productId in products) {
                    const productData = products[productId];
                    const productName = sanitizeInput(productData.productName || 'No name available');
                    const productDesc = sanitizeInput(productData.productDesc || 'No description available');
                    const price = (productData.price != null) ? `$${productData.price.toFixed(2)}` : 'N/A';
                    const status = (productData.status || 'unknown').toLowerCase();

                    productList.push({
                        userId: currentUserId,
                        productId,
                        productName,
                        productDesc,
                        price,
                        status
                    });
                }

                // sort products by status
                productList.sort((a, b) => {
                    if (a.status === "pending" && b.status !== "pending") return -1;
                    if (a.status !== "pending" && b.status === "pending") return 1;
                    if (a.status === "rejected" && b.status !== "rejected") return 1;
                    if (a.status !== "rejected" && b.status === "rejected") return -1;
                    return 0;
                });

                productTableBody.innerHTML = '';

                productList.forEach(({ userId, productId, productName, productDesc, price, status }) => {
                    const shortDesc = productDesc.length > 40 ? productDesc.slice(0, 40) + '...' : productDesc;

                    let statusMessage = "";
                    switch (status) {
                        case "pending":
                            statusMessage = sanitizeInput("Waiting to be approved...");
                            break;
                        case "approved":
                            statusMessage = sanitizeInput("Approved!");
                            break;
                        case "rejected":
                            statusMessage = sanitizeInput("Rejected!");
                            break;
                        default:
                            statusMessage = sanitizeInput("Unknown status");
                    }

                    const row = document.createElement('tr');

                    if (status === "rejected") {
                        row.classList.add("background-dark-gray");
                    }

                    row.innerHTML = `
                        <td>${productName}</td>
                        <td>${shortDesc}</td>
                        <td>${price}</td>
                        <td class="status-${status}">${statusMessage}</td>
                        <td>
                            <button class="btn btn-info" onclick="viewFormDataProducts('${userId}', '${productId}')">View Form Data</button>
                            <button class="btn btn-warning" onclick="editProduct('${userId}', '${productId}')" ${status === 'pending' ? 'disabled' : ''}>Edit</button>
                            <button class="btn btn-danger" onclick="deleteProduct('${userId}', '${productId}')" ${status === 'pending' ? 'disabled' : ''}>Delete</button>
                        </td>
                    `;

                    productTableBody.appendChild(row);
                });
            }).catch((error) => {
                console.error("Error fetching seller's products:", error);
            });

        } else {
            console.log("No user is signed in.");
            productTableBody.innerHTML = '<tr><td colspan="5">Please sign in to see your products.</td></tr>';
        }
    });
}


// get products when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

window.fetchProducts = fetchProducts;

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
}

// Function to view full product data
//TODO change write for security
function viewFormDataProducts(userId, productId) {
    const productRef = ref(db, `products/${userId}/${productId}`); // go to product ref
    get(productRef).then((snapshot) => {
        if (snapshot.exists()) {
            // get all the data and assign to vars
            const productData = snapshot.val();
            const productName = productData.productName;
            const imgURL = productData.imgURL;
            const productDesc = productData.productDesc;
            const price = productData.price;
            const status = productData.status;

            // create the content for popup
            const popupContent = `
                <html>
                    <head>
                        <title>Product Details</title>
                        <style>
                            body {
                                font-family: Arial, sans-serif;
                                margin: 20px;
                            }
                            h2 {
                                color: #333;
                            }
                            .product-details {
                                margin-bottom: 20px;
                            }
                            .product-details p {
                                margin: 8px 0;
                            }
                            .status {
                                font-weight: bold;
                                padding: 4px;
                                background-color: #f2f2f2;
                                border-radius: 4px;
                            }
                        </style>
                    </head>
                    <body>
                        <h2>Product: ${productName}</h2>
                        <img src="${productData.imgURL || 'images/placeholder.png'}" alt="${productName}" style="max-width: 100%; height: auto; margin-bottom: 20px;">
                        <div class="product-details">
                            <p><strong>Description:</strong></p>
                            <div class="description">${marked(productDesc)}</div>
                            <p><strong>Price:</strong> $${price.toFixed(2)}</p>
                            <p><strong>Status:</strong> <span class="status">${status}</span></p>
                        </div>
                    </body>
                </html>
            `;

            // put content in new window
            const popupWindow = window.open("", "_blank", "width=600,height=400");
            popupWindow.document.write(popupContent);
            popupWindow.document.close();
        } else {
            alert("Product not found!");
        }
    }).catch((error) => {
        console.error("Error fetching product data: ", error);
    });
}

window.viewFormDataProducts = viewFormDataProducts;

