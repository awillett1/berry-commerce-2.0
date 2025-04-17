// addToCart.js
// Adds the item to the cart 
// To be used with listing.html

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// firebase stuff
const auth = getAuth();
const rdb = getDatabase();

let userId = null;
let productId = null;

document.addEventListener("DOMContentLoaded", () => {
  // get the userId (the userId of the seller) and productId from URL para
  // like this:
  // e.g., .../listing.html?userId=123&productId=456
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  userId = urlParams.get('userId');
  // console.log("Seller userId:", userId); // debugging
  productId = urlParams.get('productId');

  if (userId && productId) {
    loadProductData(userId, productId);
  } else {
    console.log("User ID or Product ID not found in URL.");
  }
});

async function loadProductData(userId, productId) {
  // get the product data from RDB using the productId
  const productRef = ref(rdb, `products/${userId}/${productId}`); // ref to the products node in RDB
  const productSnapshot = await get(productRef);

  if (!productSnapshot.exists()) {
    alert("Product not found.");
    return;
  }

  const product = productSnapshot.val();
  console.log("Product data:", product);

  // check if product data is complete
  if (!product.productName || !product.price || !product.imgURL) {
    alert("Incomplete product data.");
    return;
  }

  // wait for authentication
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in to add items to your cart.");
      return;
    }

    // attach event listener to the 'Add to Cart' button
    const addToCartBtn = document.querySelector(".add-to-cart-btn");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", async () => {
        try {
          // get the quantity from the input field
          const quantityInput = document.querySelector("#quantity");
          const quantity = parseInt(quantityInput.value, 10) || 1; // default to 1 if invalid

          // check if quantity is valid
          if (quantity < 1) {
            alert("Quantity must be at least 1.");
            return;
          }

          // check if the user already has a cart in RDB
          const cartRef = ref(rdb, `users/${user.uid}/cart/${productId}`);
          const cartSnapshot = await get(cartRef);

          let cartItem = cartSnapshot.exists() ? cartSnapshot.val() : null;

          if (cartItem) {
            // if the product already exists in the cart, increase the quantity by the input value
            cartItem.quantity += quantity;
          } else {
            // if not, create a new cart item
            cartItem = {
              productId,
              name: product.productName,
              price: product.price,
              imgURL: product.imgURL,
              quantity: quantity,
              sellerId: userId // the userId of the selle
            };
          }

          // save the updated cart item in RDB
          await set(cartRef, cartItem);
          alert(`${product.productName} added to your cart!`);
        } catch (error) {
          console.error("Error adding to cart:", error);
          alert("Failed to add product to cart.");
        }
      });
    }
  });
}
