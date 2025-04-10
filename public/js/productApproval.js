// productApproval.js
// Grabs all products with "pending" status and autopopulates the admin table.
// Admins can approve/reject and view form data, including the uploaded image. 
// To be used with admin-account.html

import { getDatabase, ref, get, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
// import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// firebase stuff
const db = getDatabase();
// const storage = getStorage(); // is this necess?? was keeping it for the image upload stuff 

// get table body element
const productsTableBody = document.getElementById('products-table-body');

// add product to the table
function addProductToTable(productData, productId) {
    const row = document.createElement('tr');

    const status = (productData.status || 'Unknown').toLowerCase();
    const statusClass = `status-${status}`; // e.g., status-pending, status-approved

    const productName = productData.productName || 'No product name available';
    const productDesc = productData.productDesc || 'No description available';
    const price = (productData.price != null) ? `$${productData.price.toFixed(2)}` : 'N/A';

    // add background color to row only if status is approved or rejected
    const backgroundClass = (status === 'approved' || status === 'rejected') 
        ? 'background-dark-gray' 
        : '';

    row.innerHTML = `
        <td>${productName}</td>
        <td>${productDesc}</td>
        <td>${price}</td>
        <td class="${statusClass}">${status}</td>
        <td>
            <button class="btn btn-success" id="approve-btn" onclick="approveProduct('${productId}')" ${status !== 'pending' ? 'disabled' : ''}>Approve</button>
            <button class="btn btn-danger" id="reject-btn" onclick="rejectProduct('${productId}')" ${status !== 'pending' ? 'disabled' : ''}>Reject</button>
            <button class="btn btn-info" id="view-data-btn" onclick="viewFormData('${productId}')">View Form Data</button>
        </td>
    `;
    // disable buttons if pending or rejected

    if (backgroundClass) {
        row.classList.add(backgroundClass); // add background color to row
    }

    productsTableBody.appendChild(row);
}

// fetch all products, pending first
function fetchAllProducts() {
    const productsRef = ref(db, 'products');

    get(productsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No products available.");
            return;
        }

        const pendingProducts = [];
        const otherProducts = [];

        snapshot.forEach((userSnapshot) => {
            console.log('User Snapshot:', userSnapshot.key);  // debugging
            const userProducts = userSnapshot.val();

            for (const productId in userProducts) {
                if (userProducts.hasOwnProperty(productId)) {
                    const productData = userProducts[productId];
                    const status = (productData.status || '').toLowerCase();
                    const productItem = { productData, productId };

                    if (status === 'pending') {
                        pendingProducts.push(productItem);
                    } else {
                        otherProducts.push(productItem);
                    }
                }
            }
        });

        // render all pending products first
        pendingProducts.forEach(({ productData, productId }) => {
            addProductToTable(productData, productId);
        });

        // then render approved/rejected/unknown
        otherProducts.forEach(({ productData, productId }) => {
            addProductToTable(productData, productId);
        });
    }).catch((error) => {
        console.error("Error fetching products: ", error);
    });
}

// view product data (form and images)
function viewFormData(productId) {
    const productsRef = ref(db, 'products');

    get(productsRef).then((snapshot) => {
        snapshot.forEach((userSnapshot) => {
            const userId = userSnapshot.key;  // Seller's userId
            const userProducts = userSnapshot.val();  // all products for this seller

            if (userProducts.hasOwnProperty(productId)) {
                const product = userProducts[productId];
                const productName = product.productName || 'N/A'; // default if not available
                const productDesc = product.productDesc || 'N/A';
                const price = (product.price != null) ? `$${parseFloat(product.price).toFixed(2)}` : 'N/A';
                const status = product.status || 'N/A';
                const imgURL = product.imgURL || 'images/placeholder.png'; // default

                // get seller data based on UID
                const sellerRef = ref(db, `sellers/${userId}`);
                get(sellerRef).then((sellerSnapshot) => {
                    if (sellerSnapshot.exists()) {
                        const sellerData = sellerSnapshot.val(); // get data from the snapshot
                        const sellerName = sellerData.businessName || 'Unknown Seller';

                        // create the popup window to display product and seller data, aka make it pretty
                        const popup = window.open('', '_blank', 'width=600,height=700');
                        popup.document.write(`
                            <html>
                                <head>
                                    <title>Product Details</title>
                                    <!-- Import styles from styles.css?? Might be too long of a file haha -->
                                </head>
                                <body>
                                    <div class="product-page-container">
                                        <div class="product-image-gallery">
                                            <div class="product-image-main">
                                                <img src="${imgURL}" alt="Product Image">
                                            </div>
                                            <!-- Thumbnails, etc. -->
                                        </div>

                                        <div class="product-info">
                                            <h1 class="product-name">Product Name: ${productName}</h1>
                                            <h2 class="price">Price: ${price}</h2>
                                            <p class="product-description">Description: ${productDesc}</p>
                                            <p class="product-status">Status: ${status}</p>

                                            <p class="seller-info">Seller: ${sellerName}</p>

                                            <!-- More info... -->
                                        </div>
                                    </div>
                                </body>
                            </html>
                        `);

                    } else {
                        console.log("Seller not found.");
                    }
                }).catch((error) => {
                    console.error("Error fetching seller data:", error);
                });

                return;  // exit the loop once the product is found and displayed
            }
        });
    }).catch((error) => {
        console.error("Error loading product data for view:", error);
    });
}

// update product status (approved or rejected) (abstracted)
function updateProductStatus(productId, newStatus) {
    console.log(`${newStatus} logic for ${productId} goes here.`);

    const productsRef = ref(db, 'products'); // ref to the product in the db

    // fetch the product data before updating the status
    get(productsRef).then((snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((userSnapshot) => {
                const userId = userSnapshot.key;  // Seller's userId
                const userProducts = userSnapshot.val();  // all products for this seller

                if (userProducts.hasOwnProperty(productId)) {
                    const productData = userProducts[productId];
                    
                    // ref to the specific product in the database
                    const productRef = ref(db, `products/${userId}/${productId}`);

                    // update the product's status
                    update(productRef, { status: newStatus })
                        .then(() => {
                            console.log(`Product ${productId} ${newStatus} successfully.`);

                            // fetch and log the updated status after approval/rejection
                            get(productRef).then((snapshot) => {
                                if (snapshot.exists()) {
                                    const updatedData = snapshot.val();
                                    console.log(`Updated status after ${newStatus}: ${updatedData.status}`); // debugging

                                    // fetch seller data
                                    const sellerRef = ref(db, `sellers/${userId}`);
                                    get(sellerRef).then((sellerSnapshot) => {
                                        if (sellerSnapshot.exists()) {
                                            const sellerData = sellerSnapshot.val();
                                            const sellerName = sellerData.businessName || 'Unknown Seller';

                                            // alert the admin with the product's updated status and seller info
                                            alert(`Product "${updatedData.productName}" from seller "${sellerName}" has been ${newStatus}.`);
                                            refreshProductTable();  // refresh the table
                                        } else {
                                            console.log("Error: Seller not found.");
                                        }
                                    }).catch((error) => {
                                        console.error("Error fetching seller data:", error);
                                    });
                                } else {
                                    console.log("Error: Product not found after status update.");
                                }
                            });
                        })
                        .catch((error) => {
                            console.error(`Error updating product status to ${newStatus}:`, error);
                        });
                    return;  // exit loop once found/updated
                }
            });
        } else {
            console.log("Error: Product not found.");
        }
    }).catch((error) => {
        console.error("Error fetching product data:", error);
    });
}

// approve product (calls updateProductStatus)
function approveProduct(productId) {
    updateProductStatus(productId, 'approved');
}

// reject product (calls updateProductStatus)
function rejectProduct(productId) {
    updateProductStatus(productId, 'rejected');
}

// refresh the product table
function refreshProductTable() {
    console.log("Refreshing the product table to reflect changes...");
    
    // clear the existing table contents
    productsTableBody.innerHTML = '';

    // fetch all products again and re-render the table
    fetchAllProducts();
}

// make them show up (global)
window.viewFormData = viewFormData;
window.approveProduct = approveProduct;
window.rejectProduct = rejectProduct;

// initialize the product list when the page loads
document.addEventListener('DOMContentLoaded', fetchAllProducts);
