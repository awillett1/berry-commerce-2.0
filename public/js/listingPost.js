// listingPost.js
// To be used with sellerPage.html (replace sellerPage with the businessName), products.html, and listing.html.
// Takes information from FRDB and displays it on the listing page.
// Assumes product is "approved" since it takes the information from the slug in the URL and not from the sellerPage.html form.

import { getDatabase, ref, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// firebase stuff 
const db = getDatabase();

document.addEventListener('DOMContentLoaded', function() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString); // get the userID and productID from the URL
    //  e.g., .../listing.html?userId=123&productId=456
    const userId = urlParams.get('userId');
    const productId = urlParams.get('productId');

    if (userId && productId) {
        // only do product fetching if both userId and productId are present
        loadProductData(userId, productId);
    } else {
        console.log("Loading...");
    }
});

// load data for that product
function loadProductData(userId, productId) {
    const productRef = ref(db, `products/${userId}/${productId}`); // product ref

    get(productRef).then((snapshot) => {
        const productData = snapshot.val();

        if (productData) {
            console.log("Product Data:", productData);
            displayProductPage(productData, userId); // call displayProductPage with productData and userId
        } else {
            console.error("Product not found.");
            alert("Product not found.");
        }
    }).catch((error) => {
        console.error("Error loading product:", error);
        console.log("Product ID:", productId);
        console.log("User ID:", userId);
        alert("There was an error loading the product.");
    });
}

// to display the product page
function displayProductPage(productData, userId) {
    // display product details
    document.getElementById('main-product-image').src = productData.imgURL || 'images/placeholder.png'; // default if no image
    document.getElementById('product-name').textContent = productData.productName || 'Unknown Product';
    document.getElementById('price').textContent = `$${productData.price?.toFixed(2) || 'N/A'}`;
    document.getElementById('product-description').innerHTML = marked.parse(productData.productDesc || 'No description available.');

    // update the page title
    // TODO i feel like sometimes this doesnt work. check it more.
    const listingName = productData.productName || 'Listing';
    document.title = `${listingName} - Listing`;

    // product image gallery
    const thumbnailContainer = document.querySelector('.product-images');
    thumbnailContainer.innerHTML = ''; // clear it

    if (productData.imgURL) {
        const thumbnail = document.createElement('img');
        thumbnail.src = productData.imgURL;
        thumbnail.alt = productData.productName || 'Product Image'; // default alt text
        thumbnail.classList.add('thumbnail');
        thumbnail.dataset.image = productData.imgURL;
        thumbnailContainer.appendChild(thumbnail);

        thumbnail.addEventListener('click', (e) => {
            document.getElementById('main-product-image').src = e.target.dataset.image;
        });
    } else {
        thumbnailContainer.innerHTML = '<p class="product-description">No image available.</p>'; 
    }

    // update the seller information (link and name)
    const sellerRef = ref(db, 'sellers/' + userId);
    get(sellerRef).then((sellerSnapshot) => {
        if (sellerSnapshot.exists()) {
            const sellerData = sellerSnapshot.val();
            const sellerName = sellerData.businessName || 'Unknown Seller';

            // debugging
            console.log('Seller data fetched:', sellerData);
            console.log('Seller name:', sellerName);

            // get the elements for link/name
            const sellerLinkElement = document.getElementById('seller-link');
            const sellerNameElement = document.getElementById('seller-name');

            if (sellerLinkElement && sellerNameElement) {
                const formattedSellerName = sellerName.replace(/\s+/g, '').toLowerCase(); // remove spaces and make lowercase
                const sellerPageUrl = `${formattedSellerName}.html`; // this is what the url should be

                // debugging
                console.log('Seller link before update:', sellerLinkElement.href);
                console.log('Seller page URL:', sellerPageUrl);

                // only update if the link is not the same
                if (sellerLinkElement.href !== sellerPageUrl) {
                    console.log('Updating seller link:', sellerPageUrl);
                    sellerLinkElement.href = sellerPageUrl;
                }

                // update the seller name
                if (sellerNameElement.textContent !== sellerName) {
                    console.log('Updating seller name:', sellerName);
                    sellerNameElement.textContent = sellerName;
                }
            } else {
                console.error("Seller link or name element not found.");
            }
        } else {
            console.error("Seller not found.");
            const sellerNameElement = document.getElementById('seller-name');
            if (sellerNameElement) sellerNameElement.textContent = 'Unknown Seller';
        }
    }).catch((error) => {
        console.error("Error fetching seller data:", error);
    });

   // display product tags
   const tagContainer = document.getElementById('product-tags');
   tagContainer.innerHTML = ''; // clear any existing tags
   
   if (productData.productTag) {
       const tagDisplayNames = {
           "apparel-access": "Apparel and Accessories",
           "home-living": "Home and Living",
           "electronics": "Electronics",
           "beauty": "Beauty",
           "food": "Food",
           "toys-hobbies": "Toys and Hobbies",
           "pets": "Pets",
           "books-media": "Books and Media",
           "travel-outdoors": "Travel and Outdoors",
           "sports-fit": "Sports and Fitness",
           "art": "Art and Stickers"
       };
   
       const tags = Array.isArray(productData.productTag)
           ? productData.productTag
           : [productData.productTag]; // support single or multiple tags
   
       tags.forEach(tag => {
           const tagElement = document.createElement('span');
           tagElement.className = 'tag'; // make it not clickable inside the listing

           tagElement.style.cursor = 'default'; 
           tagElement.style.pointerEvents = 'none';
           
           const readableName = tagDisplayNames[tag] || tag; // raw tag if no match
           tagElement.textContent = readableName;
   
           tagContainer.appendChild(tagElement);
       });
   } else {
       console.error("No tags found!");
   }
}