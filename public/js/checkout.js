// checkout.js
// Handles checking out of items, posts orders to Firestore.
// For now, this only sends and receives information data about the cart. No actual payment processing at this time.
// Used in cart.html

// get firestore stuff
import { getFirestore, doc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, remove, set } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const auth = getAuth();
const db = getFirestore();
const rdb = getDatabase();

// when the checkout button is clicked...
document.getElementById('checkout-btn').addEventListener('click', async () => {
    const user = auth.currentUser; 
    
    if (!user) { // get the current user and check if theyre logged in
      alert("Please log in to complete your order.");
      return;
    }
  
    // get cart data from RDB
    const cartRef = ref(rdb, `users/${user.uid}/cart`);
    const cartSnapshot = await get(cartRef);
    
    if (!cartSnapshot.exists()) {
      alert("Your cart is empty.");
      return;
    }
  
    const cartItems = cartSnapshot.val();
    const orderId = generateOrderId(); 
    const orderDate = new Date().toLocaleDateString();
  
    // order data to be pushed to fs
    const orderData = {
      orderId,
      customerId: user.uid,
      customerEmail: user.email,
      items: [],
      status: 'Ordered', // default
      orderDate: orderDate,
      totalPrice: calculateTotalPrice(cartItems),
      createdAt: Timestamp.fromDate(new Date()), // timestamp for order creation (what time it was created)
    };

    console.log("Submitting order:", orderData); // debugging

    // go through each cart item to gather item and seller data
    for (let productId in cartItems) {
        const item = cartItems[productId]; // get the item from the cart
        const sellerId = item.sellerId; // get sellerId
        
        const productRef = ref(rdb, `products/${sellerId}/${productId}`); // go to the products ref of rdb
        const productSnapshot = await get(productRef);
        
        // if the product is not found, warn
        if (!productSnapshot.exists()) {
          console.warn(`Product ${productId} not found for seller ${sellerId}`);
          continue;
        }
        
        const productData = productSnapshot.val();
        
        console.log(`Product Data for ${productId}:`, productData); // debugging
        
        // check to make sure productName and price are defined
        const productName = productData.productName || 'Unnamed Product';  // defaults if missing
        const price = productData.price || 0; 
        
        console.log(`Product Name: ${productName}, Price: ${price}`); // debugging
        
        // check for missing product details
        if (!productName || !price) {
          console.warn(`Incomplete product data for ${productId}`);
          continue;  // skip it
        }
    
        const sellerRef = ref(rdb, `sellers/${sellerId}`); // go to sellers section of rdb
        const sellerSnapshot = await get(sellerRef);
        
        // check if seller exists
        const sellerName = sellerSnapshot.exists()
          ? sellerSnapshot.val().businessName || 'Unknown Seller' // defaults if missing
          : 'Unknown Seller';
        
        // add the validated item to the orderData.items array
        orderData.items.push({
          productName,
          productLink: `listing.html?userId=${sellerId}&productId=${productId}`, // slug link for product
          quantity: item.quantity || 1,  // default to 1
          totalPrice: (price * (item.quantity || 1)).toFixed(2), 
          sellerId: sellerId,
          sellerName,
        });
    }
    
    console.log("Final order data:", orderData); // debugging
  
    // save order to FS
    try {
      const orderRef = doc(db, `orders/${user.uid}/order/${orderId}`); // path
      await setDoc(orderRef, orderData);
      alert(`Your order ${orderId} has been placed successfully!`);
  
      //clear cart after placing the order
      await remove(cartRef);

      // reload the page to refresh 
      location.reload();

    } catch (error) {
      console.error("Error placing order: ", error);
      alert("There was an error placing your order.");
    }
});

// generates a random orderId (hopefully unique enough)
function generateOrderId() {
  return `#${Math.floor(Math.random() * 1000000)}`;
}

// calculate total price from cart items
function calculateTotalPrice(cartItems) {
  let total = 0;
  for (let productId in cartItems) { // for each product in the cart
    const item = cartItems[productId]; // get the item
    total += item.price * item.quantity; // calculate total for each item
  }
  return total.toFixed(2); // format to 2 decimal places
}
