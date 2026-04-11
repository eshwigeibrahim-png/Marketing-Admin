import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// إعداد Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBS8UlW9KCkrP4FspB9azu63srStuCR0tU",
  authDomain: "cafe-menu-3898b.firebaseapp.com",
  projectId: "cafe-menu-3898b",
  storageBucket: "cafe-menu-3898b.firebasestorage.app",
  messagingSenderId: "606722530073",
  appId: "1:606722530073:web:29a7eacd500e0463488388",
  measurementId: "G-XS7Y5LFDY1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const itemsCollection = collection(db, "menu");

console.log("Firebase module loaded", { projectId: firebaseConfig.projectId });

// وظائف لوحة التحكم
async function addItem() {
  const name = document.getElementById("name").value.trim();
  const price = parseFloat(document.getElementById("price").value);

  if (name && !Number.isNaN(price)) {
    try {
      console.log("Adding product:", { name, price });
      await addDoc(itemsCollection, { name, price });
      console.log("تم إضافة المنتج");
      document.getElementById("name").value = "";
      document.getElementById("price").value = "";
    } catch (error) {
      console.error("خطأ في إضافة المنتج:", error);
      alert("حدث خطأ أثناء حفظ المنتج. تفقد وحدة التحكم لمعرفة التفاصيل.");
    }
  } else {
    alert("رجاءً أدخل اسم المنتج والسعر.");
  }
}

// حذف عنصر
async function deleteItem(id) {
  try {
    await deleteDoc(doc(db, "menu", id));
  } catch (error) {
    console.error("خطأ في حذف المنتج:", error);
  }
}

// التحديث المباشر لكل صفحة
onSnapshot(itemsCollection, snapshot => {
  const itemsList = document.getElementById("itemsList") || document.getElementById("menuList");
  if (!itemsList) {
    console.warn("لم يتم العثور على عنصر العرض في الصفحة.");
    return;
  }

  console.log("Firebase snapshot received:", snapshot.size);
  itemsList.innerHTML = "";
  snapshot.forEach(docSnap => {
    const item = docSnap.data();
    if (itemsList.id === "itemsList") {
      itemsList.innerHTML += `<div>
        <strong>${item.name}</strong> - ${item.price} دينار
        <button onclick="deleteItem('${docSnap.id}')">حذف</button>
      </div>`;
    } else {
  itemsList.innerHTML += `
    <div style="border:1px solid #ccc; padding:10px; margin:10px;">
      <strong>${item.name}</strong> - ${item.price} دينار

      <br><br>

      <button onclick="addToCart(\`${item.name}\`, ${item.price})">
        أضف للسلة 🛒
      </button>
    </div>
  `;
}
  });
}, error => {
  console.error("خطأ في استلام البيانات:", error);
});

let cart = JSON.parse(localStorage.getItem("cart")) || [];
function addToCart(name, price) {
  const item = cart.find(i => i.name === name);

  if (item) {
    item.quantity++;
  } else {
    cart.push({
      name: name,
      price: price,
      quantity: 1
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("تمت الإضافة إلى السلة ✅");
  displayCart();
}

function displayCart() {
  const cartDiv = document.getElementById("cartItems");
  if (!cartDiv) {
    return;
  }

  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    cartDiv.innerHTML += `
      <div class="cart-item">
        <p><strong>${item.name}</strong></p>
        <p>الكمية: ${item.quantity}</p>
        <p>السعر: ${item.price * item.quantity} دينار</p>
        <div class="qty-controls">
          <button onclick="decreaseQty(${index})">-</button>
          <button onclick="increaseQty(${index})">+</button>
          <button onclick="removeFromCart(${index})">حذف</button>
        </div>
      </div>
      <hr>
    `;
  });

  cartDiv.innerHTML += `<h3>المجموع: ${total} دينار</h3>`;
  updateCartCount();
}

function updateCartCount() {
  let count = 0;
  cart.forEach(item => {
    count += item.quantity;
  });

  const countElement = document.getElementById("cartCount");
  if (countElement) {
    countElement.innerText = count;
  }
}

window.updateCartCount = updateCartCount;

function increaseQty(index) {
  cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function decreaseQty(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
  } else {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function toggleCart() {
  const popup = document.getElementById("cartPopup");
  if (!popup) return;
  popup.classList.toggle("hidden");
}

function sendToWhatsApp() {
  if (cart.length === 0) {
    alert("السلة فارغة ❌");
    return;
  }

  let message = "طلب جديد:%0A";
  let total = 0;

  cart.forEach(item => {
    let itemTotal = item.price * item.quantity;
    total += itemTotal;
    message += `${item.name} ×${item.quantity} = ${itemTotal}%0A`;
  });

  message += `%0Aالمجموع: ${total}`;
  let phone = "218910570022"; // ضع رقم واتساب هنا بدون + أو أصفار زائدة
  let url = `https://wa.me/${phone}?text=${message}`;
  window.open(url, "_blank");
}

function clearCart() {
  cart = [];
  localStorage.removeItem("cart");
  displayCart();
}

window.sendToWhatsApp = sendToWhatsApp;
window.toggleCart = toggleCart;
window.addItem = addItem;
window.deleteItem = deleteItem;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.increaseQty = increaseQty;
window.decreaseQty = decreaseQty;
window.clearCart = clearCart;

displayCart();
updateCartCount();