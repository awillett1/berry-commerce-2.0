// search.js
// To be used with products.html
// Searches for products that match the name inputted in the search bar and/or selected tags, and displays them below.
// When the search bar is cleared, the products are reset to the original list.
// Case-insensitive
// Filters products based on search term and selected tag from hidden tag fields

import { marked } from 'https://cdn.jsdelivr.net/npm/marked@latest/lib/marked.esm.js';
import DOMPurify from 'https://cdn.jsdelivr.net/npm/dompurify@3.2.5/+esm';

// show or hide the "no products found" message
function displayNoProductsMessage(show) {
    const noProductsMessage = document.getElementById('no-products-message');
    if (noProductsMessage) {
        noProductsMessage.style.display = show ? 'block' : 'none';
    }
    noProductsMessage.classList.add('animate__animated', 'animate__fadeIn');
}

// search products, via tag or bar
function searchProducts() {
    const searchInput = document.querySelector('#search-input');
    const searchTerm = sanitizeInput(searchInput.value).toLowerCase();

    const selectedTag = document.querySelector('.tag.selected');
    const selectedTagId = selectedTag ? selectedTag.id : null;

    const productCards = document.querySelectorAll('.product-card');

    let productsFound = false;

    productCards.forEach(card => {
        const productName = card.querySelector('.product-name')?.textContent.toLowerCase() || "";
        
        // find all hidden .product-tag elements in this card
        const productTags = Array.from(card.querySelectorAll('.product-tag')).map(tag => tag.id);

        const matchesSearch = productName.includes(searchTerm);
        const matchesTag = selectedTagId === "shop-all" || !selectedTagId || productTags.includes(selectedTagId);

        if (matchesSearch && matchesTag) {
            card.style.display = 'block';
            card.classList.add('animate__animated', 'animate__fadeIn');
            productsFound = true;
        } else {
            card.style.display = 'none';
            card.classList.remove('animate__animated', 'animate__fadeIn');
        }
    });

    displayNoProductsMessage(!productsFound);
}

// handles search button click
const searchButton = document.querySelector('#search-button');
if (searchButton) {
    searchButton.addEventListener('click', searchProducts);
}

// handles tag click
const tags = document.querySelectorAll('.tag');
tags.forEach(tag => {
    tag.addEventListener('click', () => {
        // remove previous selection
        const previouslySelected = document.querySelector('.tag.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
            previouslySelected.style.backgroundColor = '';
        }

        // highlight the selected tag
        tag.classList.add('selected');
        tag.style.backgroundColor = 'var(--light-b-blue)';
        
        console.log("Selected tag ID:", tag.id); // debugging

        searchProducts();
    });
});

// sanitize input using DOMPurify
function sanitizeInput(input) {
    return DOMPurify.sanitize(input);
  }