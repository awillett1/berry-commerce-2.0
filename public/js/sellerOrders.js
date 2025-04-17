// sellerOrders.js
// Displays all of that specific seller's orders from the "orders" rdb to the seller's table
// Shows:
    // The seller can view the order details and the status of each order (Actions: "Update Status", "View Details") buttons.
    //      - Preparing
    //      - Ready for pickup
    //      - Delivered
    //      - Cancelled (have a separate section for if the customer cancels order vs. seller cancels order)
    // Order ID (e.g. #123456)
    // Customer name (e.g. John Doe), should link to their email
    // Product Name (links to the product page)
    // Quantity (e.g. 2) 
    // Total Price (e.g. $50.00)
    // Order Date   (e.g. 2023-10-01)

    // View Details button <button class="btn btn-info" onclick="viewFormData('${id}')">View Form Info</button>
    // Older orders should be at the bottom of the table, and newer orders should be at the top.
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getDatabase, ref, get as getRDB } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// firestore stuff
const db = getFirestore();
const rdb = getDatabase();
const auth = getAuth();

auth.onAuthStateChanged(async (user) => {
    if (user) {
        const sellerId = user.uid; // use the current seller's UID
        displayOrders(sellerId);
    } else {
        console.log('User is not authenticated');
        return;
    }
});

async function fetchOrders(sellerId) {
    // get reference to the subcollection "order" under "orders/{sellerId}"
    const ordersRef = collection(doc(db, "orders", sellerId), "order");
    const ordersSnapshot = await getDocs(ordersRef);
    const orders = [];

    ordersSnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() });
    });

    return orders;
}

// Function to fetch user email by user ID
async function fetchUserEmail(userId) {
    const userRef = doc(db, "users", userId); 
    const userSnapshot = await getDoc(userRef); 
    
    if (userSnapshot.exists()) {
        return userSnapshot.data().email;
    } else {
        return 'Email not available';
    }
}

// TODO : email notification to seller when a new order is placed

// displays orders
async function displayOrders(sellerId) {
    const orders = await fetchOrders(sellerId);
    const ordersTableBody = document.getElementById('orders-table-body');

    // Clear any existing rows in the table body
    ordersTableBody.innerHTML = '';

    // Loop through each order and add it to the table
    for (let order of orders) {
        const customerEmail = await fetchUserEmail(order.customerId);
        const sellerEmail = await fetchUserEmail(sellerId);
    
        // get the first item in the order 
        //TODO let it handle more than one item in the order
        const item = order.items[0] || {};
    
        const orderRow = document.createElement('tr');
        
        orderRow.innerHTML = `
            <td>${order.orderId}</td>
            <td><a href="mailto:${customerEmail}">${customerEmail}</a></td>
            <td>
                <a href="${item.productLink || '#'}" target="_blank">${item.productName || 'Unknown Product'}</a>
            </td>
            <td>${item.quantity || 0}</td>
            <td>
                <select class="order-status" name="status" id="order-status-${order.orderId}">
                    <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparing</option>
                    <option value="ready-for-pickup" ${order.status === 'ready-for-pickup' ? 'selected' : ''}>Ready for Pickup</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Successfully Delivered</option>
                    <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
            </td>
            <td>
                <button class="btn btn-info" onclick="viewFormData()">View Form Info</button>
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.orderId}')">Update Status</button>
            </td>
        `;
    
        ordersTableBody.appendChild(orderRow);
    }
}

// TODO
function viewFormData() {
    console.log("NEED TO FINISH");
}

// TODO send email when status changes on product

// update the order status
async function updateOrderStatus(orderId) {
    const statusSelect = document.getElementById(`order-status-${orderId}`);
    const newStatus = statusSelect.value;

    // update the status in firestore
    const orderRef = doc(db, `orders/${auth.currentUser.uid}/order/${orderId}`);
    await setDoc(orderRef, { status: newStatus }, { merge: true });

    alert(`Order status updated to ${newStatus}`);
}

// make them show up (global)
window.viewFormData = viewFormData;
window.updateOrderStatus = updateOrderStatus;