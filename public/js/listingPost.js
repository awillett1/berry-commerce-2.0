// listingPost.js
// To be used with sellerPage.html (replace sellerPage with the businessName), products.html, and listing.html.
// Takes information from FRDB and displays it on the listing page.

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
const db = getDatabase();

// get userId and productId from query string
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const userId = urlParams.get('userId');
const productId = urlParams.get('productId');

if (userId && productId) {
    const productRef = ref(db, `products/${userId}/${productId}`);
    
    // get product data from the database
    get(productRef).then((snapshot) => {
        const productData = snapshot.val();

        if (productData) {
            // do not load anything until we are on the right page.
            if (window.location.pathname.includes('listing.html')) {
                // if we are on product page, use the right .css classes/ids
                displayProductPage(productData, userId);
            } else if (window.location.pathname.includes('sellerPage.html')) {
                // if we are on seller page, use the right .css classes/ids
                displaySellerPage(productData, userId);
            } // this does not run on any other page, so we don't need an else statement here
                // only runs on sellerPage.html (replace sellerPage with the business name.) and products.html

            // get the seller's name by matching the UID with the sellers data
            const sellerRef = ref(db, 'sellers/' + userId);

            get(sellerRef).then((sellerSnapshot) => {
                if (sellerSnapshot.exists()) {
                    const sellerData = sellerSnapshot.val();
                    const sellerName = sellerData.businessName || 'Unknown Seller';
                    
                    // logs for debugging
                    console.log('Before setting:');
                    const sellerLinkElement = document.getElementById('seller-link');
                    const sellerNameElement = document.getElementById('seller-name');
                    console.log('Link before update:', sellerLinkElement ? sellerLinkElement.href : 'N/A');
                    console.log('Name before update:', sellerNameElement ? sellerNameElement.textContent : 'N/A');

                    if (sellerLinkElement && sellerNameElement) {
                        // update the sellerPage url
                        const sellerPageUrl = `${sellerName}.html`;
                        if (sellerLinkElement.href !== sellerPageUrl) {
                            console.log('Updating link to:', sellerPageUrl);
                            sellerLinkElement.href = sellerPageUrl;
                        }

                        // update the sellerName
                        if (sellerNameElement.textContent !== sellerName) {
                            console.log('Updating seller name:', sellerName);
                            sellerNameElement.textContent = sellerName;
                        }
                    }
                } else {
                    console.error("Seller not found.");
                    const sellerNameElement = document.getElementById('seller-name');
                    if (sellerNameElement) sellerNameElement.textContent = 'Unknown Seller';
                }
            }).catch((error) => {
                console.error("Error fetching seller data:", error);
            });

        } else {
            console.error("Product not found.");
            alert("Product not found.");
        }
    }).catch((error) => {
        console.error('Error loading product:', error);
        alert("There was an error loading the product.");
    });
}

// for products.html
function displayProductPage(productData, userId) {
    document.getElementById('main-product-image').src = productData.imageUrl || 'images/placeholder.png';
    document.getElementById('product-name').textContent = productData.productName || 'Unknown Product';
    document.getElementById('price').textContent = `$${productData.price?.toFixed(2) || 'N/A'}`;
    document.getElementById('product-description').textContent = productData.productDesc || 'No description available.';

    // change title of webpage
    const listingName = productData.productName || 'Listing';
    document.title = `${listingName} - Listing`;

    // add all the images (there could be multiple, assumes array)
    const thumbnails = productData.imageUrls || [];
    const thumbnailContainer = document.querySelector('.product-images');
    thumbnailContainer.innerHTML = '';

    if (thumbnails.length > 0) {
        thumbnails.forEach((imageUrl, index) => {
            const thumbnail = document.createElement('img');
            thumbnail.src = imageUrl;
            thumbnail.alt = `Thumbnail ${index + 1}`;
            thumbnail.classList.add('thumbnail');
            thumbnail.dataset.image = imageUrl;
            thumbnailContainer.appendChild(thumbnail);
        });

        const allThumbnails = document.querySelectorAll('.thumbnail');
        allThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', (e) => {
                document.getElementById('main-product-image').src = e.target.dataset.image;
            });
        });
    } else {
        thumbnailContainer.innerHTML = '<p class="product-description">No additional images available.</p>';
    }
}

// for sellers.html
function displaySellerPage(productData, userId) {
    const productLink = document.createElement('a');
    productLink.href = `listing.html?userId=${userId}&productId=${productData.productId}`;
    productLink.classList.add('product-link');

    productLink.innerHTML = `
        <div class="product-image">
            <img src="${productData.imageUrl || 'images/placeholder.png'}" alt="${productData.productName}">
        </div>
        <h3 class="product-name">${productData.productName}</h3>
        <p class="product-price">$${productData.price?.toFixed(2) || 'N/A'}</p>
        <p class="product-description">${productData.productDesc || 'No description available.'}</p>
    `;

    const sellerPageContainer = document.getElementById('seller-product-container');
    if (sellerPageContainer) {
        sellerPageContainer.appendChild(productLink);
    }
}

window.addEventListener('popstate', (event) => {
    // when url changes, check for URL parameters and update seller link
    console.log('URL changed:', window.location.href);
    const userId = new URLSearchParams(window.location.search).get('userId');
    const productId = new URLSearchParams(window.location.search).get('productId');
    if (userId && productId) {
        updateSellerLink(userId);
    }
});

// loading checks again for the seller url since it was giving me trouble
function updateSellerLink(userId) {
    const sellerRef = ref(db, 'sellers/' + userId);
    get(sellerRef).then((sellerSnapshot) => {
        if (sellerSnapshot.exists()) {
            const sellerData = sellerSnapshot.val();
            const sellerName = sellerData.businessName || 'Unknown Seller';
            const sellerLinkElement = document.getElementById('seller-link');
            const sellerNameElement = document.getElementById('seller-name');
            
            if (sellerLinkElement && sellerNameElement) {
                const sellerPageUrl = `${sellerName}.html`;
                sellerLinkElement.href = sellerPageUrl;

                sellerNameElement.textContent = sellerName;
            }
        }
    }).catch((error) => {
        console.error("Error fetching seller data:", error);
    });
}
