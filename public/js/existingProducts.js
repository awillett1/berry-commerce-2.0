// existingProducts.js
// Prepopulates table in seller-account.html to see your status on the products you have posted
// To be used in seller-account.html

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const db = getDatabase();

// get table body element
const productTableBody = document.getElementById('product-table-body');

// fetch products from FRDB and populate the table
function fetchProducts() {
    const productsRef = ref(db, 'products');  

    get(productsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No products available.");
            return;
        }

        const allProducts = []; // array for all the products

        snapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;  // get UID
            const userProducts = userSnapshot.val();  // get products for the user

            // loop through products and add them to arr 
            for (const productId in userProducts) {
                const productData = userProducts[productId];
                const productName = productData.productName || 'No name available'; // defaults if not avail
                const productDesc = productData.productDesc || 'No description available';
                const price = (productData.price != null) ? `$${productData.price.toFixed(2)}` : 'N/A';
                const status = (productData.status || 'unknown').toLowerCase();

                allProducts.push({ 
                    userId, 
                    productId, 
                    productName, 
                    productDesc, 
                    price, 
                    status 
                });
            }
        });

        // sort products: pending first, then approved, then rejected
        allProducts.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            if (a.status === "rejected" && b.status !== "rejected") return 1;
            if (a.status !== "rejected" && b.status === "rejected") return -1;
            return 0;
        });

        // populate the table with sorted products
        allProducts.forEach((product) => {
            const { userId, productId, productName, productDesc, price, status } = product;

            // put each status with a cool message
            let statusMessage = "";
            switch (status) {
                case "pending":
                    statusMessage = "Waiting to be approved...";
                    break;
                case "approved":
                    statusMessage = "Approved!";
                    break;
                case "rejected":
                    statusMessage = "Rejected!";
                    break;
                default:
                    statusMessage = "Unknown status";
            }

            // create the row
            const row = document.createElement('tr');

            // if rejected, add dark gray background
            if (status === "rejected") {
                row.classList.add("background-dark-gray");
            }

            row.innerHTML = `
                <td>${productName}</td>
                <td>${productDesc}</td>
                <td>${price}</td>
                <td class="status-${status}">${statusMessage}</td>
                <td>
                    <button class="btn btn-warning" onclick="editProduct('${userId}', '${productId}')" ${status === 'pending' ? 'disabled' : ''}>Edit</button>
                    <button class="btn btn-danger" onclick="deleteProduct('${userId}', '${productId}')" ${status === 'pending' ? 'disabled' : ''}>Delete</button>
                </td>
            `;
            // buttons are disabled if pending or rejected
            productTableBody.appendChild(row);
        });
    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}

// editing product
function editProduct(userId, productId) {
    console.log(`Editing product ${productId} for user ${userId}`);
    //TODO
}

// deleting a product
function deleteProduct(userId, productId) {
    console.log(`Deleting product ${productId} for user ${userId}`);
    //TODO
    // make sure to do double confirm :)
}

// get products when the page loads
document.addEventListener('DOMContentLoaded', fetchProducts);
