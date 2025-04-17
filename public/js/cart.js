// cart.js
// Displays items in the cart
// To be used with cart.html

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, remove, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// firebase stuff
const auth = getAuth();
const rdb = getDatabase();

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) { // if user is not logged in
      alert("Please log in to view your cart.");
      return;
    }

    const cartRef = ref(rdb, `users/${user.uid}/cart`); // look up the cart ref in RDB
    const cartSnapshot = await get(cartRef);

    if (!cartSnapshot.exists()) {
      document.getElementById('cart-items').innerHTML = '<p>Your cart is empty.</p>'; // if there is no cart avail, show some text
      updateSummary(0);
      return;
    }

    const cartItems = cartSnapshot.val();
    displayCartItems(cartItems);
  });
});

// takes in the cart items and displays them in the cart.html page
function displayCartItems(cartItems) {
  const cartItemsContainer = document.getElementById('cart-items');
  let subtotal = 0;
  let cartHtml = '';

  for (let productId in cartItems) {
    const item = cartItems[productId];
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    cartHtml += `
    <div class="cart-item" data-product-id="${productId}">
      <div class="item-details">
        <img src="${item.imgURL}" alt="${item.name}" class="cart-item-img">
        <div class="cart-item-details">
          <p class="cart-item-name">${item.name}</p>
          <p class="cart-item-price">$${item.price.toFixed(2)}</p>
          <input type="number" class="cart-item-quantity" value="${item.quantity}" min="1" data-product-id="${productId}">
          <p class="cart-item-total">$${itemSubtotal.toFixed(2)}</p>
          <button class="remove-from-cart" data-product-id="${productId}">Remove</button>
        </div>
      </div>
    </div>
  `;
  
  }

  cartItemsContainer.innerHTML = cartHtml;
  updateSummary(subtotal);
  attachEventListeners();
}

// attaches event listeners to the quantity inputs and remove buttons
function attachEventListeners() {
  const quantityInputs = document.querySelectorAll('.cart-item-quantity');
  quantityInputs.forEach(input => {
    input.addEventListener('change', updateQuantity); // when the quantity is changed, update the quantity in the database
  });

  const removeButtons = document.querySelectorAll('.remove-from-cart');
  removeButtons.forEach(button => {
    button.addEventListener('click', removeFromCart); // when the remove button is clicked, remove the item from the cart
  });
}

// update quantity in the database and recalculate subtotal
async function updateQuantity(event) {
  const productId = event.target.dataset.productId;
  const newQuantity = parseInt(event.target.value, 10); // get the new quantity from the input
  const user = auth.currentUser;

  if (!user) return; // if the user is not logged in, exit the function
  if (newQuantity < 1) { // check that the quality is at least 1
    alert("Quantity must be at least 1.");
    return;
  }

  const cartRef = ref(rdb, `users/${user.uid}/cart/${productId}`); // ref to the cart database in rdb
  const snapshot = await get(cartRef);

  if (!snapshot.exists()) {
    console.error("Cart item not found.");
    return;
  }

  const currentItem = snapshot.val();
  currentItem.quantity = newQuantity; // change the quantity to the new quantity

  await set(cartRef, currentItem); // update the cart with the new item

  const itemSubtotal = currentItem.price * newQuantity; // calculate subttotal
  // update the subtotal in the cart display
  document.querySelector(`[data-product-id="${productId}"] .cart-item-total`).innerText = `$${itemSubtotal.toFixed(2)}`;

  recalculateSummary();
}

// remove an item from the cart
async function removeFromCart(event) {
  const productId = event.target.dataset.productId;
  const user = auth.currentUser;

  if (!user) return; // if the user is not logged in, exit the function

  const cartRef = ref(rdb, `users/${user.uid}/cart/${productId}`); // ref to the cart database in rdb
  await remove(cartRef);

  document.querySelector(`[data-product-id="${productId}"]`).remove(); // remove the item from the cart display
  recalculateSummary();
}

// update the cost summary
function updateSummary(subtotal = 0) {
  // these are all arbitrary atm
  const shippingDiscount = 10; // 10% off
  const shippingHandling = 4.00;
  const tax = 0.00;

  const discount = subtotal * (shippingDiscount / 100);
  const total = subtotal - discount + shippingHandling + tax;

  document.getElementById('subtotal').innerText = `$${subtotal.toFixed(2)}`; // change the subtotal text to new subtotal
  document.getElementById('total').innerText = `$${total.toFixed(2)}`; // change the total text to new total
}

function recalculateSummary() {
  let subtotal = 0;

  document.querySelectorAll('.cart-item').forEach(item => { // loop through all the items in the cart
    
    const price = parseInt(item.querySelector('.cart-item-price').innerText.replace('$', '')) || 0; // update the price of the item (remove $ to do math)
    const quantity = parseInt(item.querySelector('.cart-item-quantity').value, 10) || 1; // gets the quantity of the item and changes it to an int
    subtotal += price * quantity; // calculate subtotal
  });

  updateSummary(subtotal);
}
