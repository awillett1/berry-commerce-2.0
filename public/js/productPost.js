// productPost.js
// Get every product from the database and post it to the "Shop All" page.
// To be used in products.html.

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
const db = getDatabase();

// get every single product from the database
const productsRef = ref(db, 'products');  
get(productsRef).then((snapshot) => {
    snapshot.forEach((userSnapshot) => {
        const userId = userSnapshot.key;  // Seller's userId
        const products = userSnapshot.val();  // all products for that seller

        // get seller data based on UID
        const sellerRef = ref(db, `sellers/${userId}`);
        get(sellerRef).then((sellerSnapshot) => {
            if (sellerSnapshot.exists()) {
                const sellerData = sellerSnapshot.val();
                const sellerName = sellerData.businessName || 'Unknown Seller';

                // Loop through each product for the seller
                Object.keys(products).forEach((productId) => {
                    const productData = products[productId];
                   // console.log('Product Data:', productData);  // debugging 

                    // make a product url slug for the listing page. combination of the user's id and product id to make sure it does not get mixed up with other products
                    // this is so listing.html / listingPost.js can find the right product
                    const productUrl = `listing.html?userId=${userId}&productId=${productId}`;

                    // create a product card for each product
                    const productCard = document.createElement('div');
                    productCard.classList.add('product-card');

                    productCard.innerHTML = `
                        <a href="${productUrl}" class="product-link">
                            <div class="product-image">
                                <img src="${productData.imageUrl || 'images/placeholder.png'}" alt="${productData.productName}">
                            </div>
                            <h3 class="seller-title-products">${sellerName}</h3> 
                            <h3 class="product-name">${productData.productName}</h3>
                            <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
                            <p class="product-description">${productData.productDesc || 'No description available.'}</p>
                        </a>
                    `;

                    // check that product container exists before adding
                    const productContainer = document.querySelector('#product-container'); 
                    if (productContainer) {
                        productContainer.appendChild(productCard);
                    } else {
                        console.error('Product container not found.');
                    }
                });
            } else {
                console.error('Seller not found for userId:', userId);
            }
        }).catch((error) => {
            console.error("Error fetching seller data:", error);
        });
    });
}).catch((error) => {
    console.error('Error fetching products:', error);
});
