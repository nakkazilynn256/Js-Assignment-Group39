/*
 * ShopWith - script.js
 * Uses: DOM manipulation, arrays, objects, localStorage, try/catch
 */
const productList = [
  { id: 1,  name: "iPhone 15 Pro",     price: 3696300 },
  { id: 2,  name: "MacBook Air M3",    price: 4066300 },
  { id: 3,  name: "Samsung 4K TV",     price: 2516000 },
  { id: 4,  name: "Sony Headphones",   price: 1291300 },
  { id: 5,  name: "iPad Air",          price: 2771300 },
  { id: 6,  name: "Nike Air Max",      price: 518000  },
  { id: 7,  name: "Levi's 501 Jeans",  price: 329300  },
  { id: 8,  name: "Zara Wool Coat",    price: 736300  },
  { id: 9,  name: "Atomic Habits",     price: 66600   },
  { id: 10, name: "Deep Work",         price: 59200   },
  { id: 11, name: "The Alchemist",     price: 51800   },
  { id: 12, name: "Nespresso Machine", price: 699300  },
  { id: 13, name: "Dyson Vacuum",      price: 2771300 },
  { id: 14, name: "Yoga Mat",          price: 203500  },
  { id: 15, name: "Whey Protein 2kg",  price: 240500  },
  { id: 16, name: "Garmin Watch",      price: 1106300 },
];

// Format a number as UGX currency e.g. UGX 1,500,000
function toUGX(amount) {
  return "UGX " + amount.toLocaleString();
}


function getCart() {
  try {
    const saved = localStorage.getItem("shopwith_cart");
    if (saved) {
      return JSON.parse(saved);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Could not read cart:", error);
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem("shopwith_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Could not save cart:", error);
  }
}

// Count all items and update the navbar badge
function updateCartCount() {
  const cart = getCart();
  let total = 0;

  for (let i = 0; i < cart.length; i++) {
    total = total + cart[i].quantity;
  }

  const badge = document.getElementById("nav-count");
  if (badge) {
    badge.textContent = total;
  }
}

function setupHomePage() {
  if (!document.getElementById("shop-grid")) return;

  // Search bar - filter as user types
  const input = document.getElementById("search-bar");
  if (input) {
    input.addEventListener("input", function() {
      filterCards();
    });
  }

  // Category filter buttons
  const filterBtns = document.querySelectorAll(".filter-btn");
  for (let i = 0; i < filterBtns.length; i++) {
    filterBtns[i].addEventListener("click", function() {
      const allBtns = document.querySelectorAll(".filter-btn");
      for (let j = 0; j < allBtns.length; j++) {
        allBtns[j].classList.remove("picked");
      }
      this.classList.add("picked");
      filterCards();
    });
  }

  // Attach Add to Cart click events to all buttons using addEventListener
  attachAddButtons();
}

// Show or hide cards based on search and category
function filterCards() {
  const input = document.getElementById("search-bar");
  const searchTerm = input ? input.value.toLowerCase() : "";

  const activeBtn = document.querySelector(".filter-btn.picked");
  const category = activeBtn ? activeBtn.getAttribute("data-category") : "All";

  // Get all product cards from the HTML using querySelectorAll
  const allCards = document.querySelectorAll(".pcard");
  let visibleCount = 0;

  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];

    // Read category and name from each card's data attributes
    const cardCategory = card.getAttribute("data-category");
    const cardName = card.getAttribute("data-name").toLowerCase();

    const catMatch = (category === "All" || cardCategory === category);
    const nameMatch = cardName.includes(searchTerm);

    if (catMatch && nameMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  }

  const emptyMsg = document.getElementById("empty-msg");
  if (emptyMsg) {
    if (visibleCount === 0) {
      emptyMsg.classList.remove("hidden");
    } else {
      emptyMsg.classList.add("hidden");
    }
  }
}

// Attach click events to all "+ Add" buttons using addEventListener
function attachAddButtons() {
  const addBtns = document.querySelectorAll(".btn-add");
  for (let i = 0; i < addBtns.length; i++) {
    addBtns[i].addEventListener("click", function() {
      const id = parseInt(this.getAttribute("data-id"));
      addToCart(id);
    });
  }
}

// ADD TO CART
function addToCart(productId) {
  try {
    // Find the product in the productList array by id
    let found = null;
    for (let i = 0; i < productList.length; i++) {
      if (productList[i].id === productId) {
        found = productList[i];
      }
    }

    if (!found) {
      throw new Error("Product not found.");
    }

    const cart = getCart();

    // Check if item is already in the cart
    let exists = false;
    for (let j = 0; j < cart.length; j++) {
      if (cart[j].id === productId) {
        cart[j].quantity = cart[j].quantity + 1;
        exists = true;
      }
    }

    // If not in cart yet, push a new item object
    if (!exists) {
      cart.push({
        id:       found.id,
        name:     found.name,
        price:    found.price,
        quantity: 1
      });
    }

    saveCart(cart);
    updateCartCount();
    alert(found.name + " has been added to your cart!");

  } catch (error) {
    console.error("Add to cart error:", error);
    alert("Something went wrong. Please try again.");
  }
}

// CART PAGE
function setupCartPage() {
  if (!document.getElementById("cart-rows")) return;
  drawCart();
}

function drawCart() {
  const rows    = document.getElementById("cart-rows");
  const noItems = document.getElementById("no-items");
  const summary = document.getElementById("price-summary");

  try {
    const cart = getCart();

    if (cart.length === 0) {
      rows.innerHTML = "";
      noItems.classList.remove("hidden");
      if (summary) summary.style.display = "none";
      return;
    }

    noItems.classList.add("hidden");
    if (summary) summary.style.display = "";
    rows.innerHTML = "";

    // Build a row for each cart item using createElement and appendChild
    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];

      const row = document.createElement("div");
      row.classList.add("cart-row");

      row.innerHTML =
        "<div class='row-details'>" +
          "<h4>" + item.name + "</h4>" +
          "<p class='row-unit'>" + toUGX(item.price) + " each</p>" +
        "</div>" +
        "<div class='qty-wrap'>" +
          "<button class='qty-btn' onclick='changeQty(" + item.id + ", -1)'>−</button>" +
          "<span class='qty-num'>" + item.quantity + "</span>" +
          "<button class='qty-btn' onclick='changeQty(" + item.id + ", 1)'>+</button>" +
        "</div>" +
        "<span class='row-total'>" + toUGX(item.price * item.quantity) + "</span>" +
        "<button class='btn-remove' onclick='removeItem(" + item.id + ")'>🗑</button>";

      rows.appendChild(row);
    }

    calcTotals();

  } catch (error) {
    console.error("Cart render error:", error);
    rows.innerHTML = "<p>Could not load cart. Please refresh.</p>";
  }
}

function changeQty(productId, change) {
  try {
    const cart = getCart();

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id === productId) {
        cart[i].quantity = cart[i].quantity + change;

        if (cart[i].quantity < 1) {
          cart.splice(i, 1);
          showToast("Item removed.");
        }
        break;
      }
    }

    saveCart(cart);
    updateCartCount();
    drawCart();

  } catch (error) {
    console.error("Quantity error:", error);
    showToast("Something went wrong.");
  }
}

function removeItem(productId) {
  try {
    const cart = getCart();
    const updated = [];

    for (let i = 0; i < cart.length; i++) {
      if (cart[i].id !== productId) {
        updated.push(cart[i]);
      }
    }

    saveCart(updated);
    updateCartCount();
    drawCart();
    showToast("Item removed.");

  } catch (error) {
    console.error("Remove error:", error);
  }
}

function calcTotals() {
  const cart = getCart();
  let subtotal = 0;

  for (let i = 0; i < cart.length; i++) {
    subtotal = subtotal + (cart[i].price * cart[i].quantity);
  }

  // Free shipping on orders above UGX 370,000 (approx $100)
  const shipping = subtotal > 370000 ? 0 : 37000;
  const total = subtotal + shipping;

  const subEl  = document.getElementById("sub-amount");
  const shipEl = document.getElementById("ship-amount");
  const totEl  = document.getElementById("tot-amount");

  if (subEl)  subEl.textContent  = toUGX(subtotal);
  if (shipEl) shipEl.textContent = shipping === 0 ? "FREE" : toUGX(shipping);
  if (totEl)  totEl.textContent  = toUGX(total);
}

// Small toast for cart page actions
function showToast(msg) {
  const box = document.getElementById("toast-box");
  if (box) {
    box.textContent = msg;
    box.classList.add("show");
    setTimeout(function() {
      box.classList.remove("show");
    }, 2000);
  }
}

// CHECKOUT PAGE
function setupCheckoutPage() {
  if (!document.getElementById("order-form")) return;

  drawCheckoutItems();

  const placeBtn = document.getElementById("place-btn");
  if (placeBtn) {
    placeBtn.addEventListener("click", function() {
      submitOrder();
    });
  }
}

function drawCheckoutItems() {
  const listEl  = document.getElementById("order-list");
  const noItems = document.getElementById("co-empty");
  if (!listEl) return;

  try {
    const cart = getCart();

    if (cart.length === 0) {
      noItems.classList.remove("hidden");
      return;
    }

    listEl.innerHTML = "";
    let subtotal = 0;

    for (let i = 0; i < cart.length; i++) {
      const item = cart[i];
      subtotal = subtotal + (item.price * item.quantity);

      // Create and append each order line using createElement and appendChild
      const line = document.createElement("div");
      line.classList.add("order-line");
      line.innerHTML =
        "<span>" + item.name + " x" + item.quantity + "</span>" +
        "<span>" + toUGX(item.price * item.quantity) + "</span>";

      listEl.appendChild(line);
    }

    const shipping = subtotal > 370000 ? 0 : 37000;
    const total = subtotal + shipping;

    document.getElementById("co-sub").textContent  = toUGX(subtotal);
    document.getElementById("co-ship").textContent = shipping === 0 ? "FREE" : toUGX(shipping);
    document.getElementById("co-tot").textContent  = toUGX(total);

  } catch (error) {
    console.error("Checkout items error:", error);
  }
}

function submitOrder() {
  try {
    const cart = getCart();

    if (cart.length === 0) {
      throw new Error("Your cart is empty! Add items before checking out.");
    }

    const name    = document.getElementById("inp-name").value.trim();
    const email   = document.getElementById("inp-email").value.trim();
    const phone   = document.getElementById("inp-phone").value.trim();
    const address = document.getElementById("inp-address").value.trim();

    let isValid = true;

    // Validate name
    if (name === "") {
      document.getElementById("err-name").textContent = "Please enter your full name.";
      isValid = false;
    } else {
      document.getElementById("err-name").textContent = "";
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email === "") {
      document.getElementById("err-email").textContent = "Please enter your email.";
      isValid = false;
    } else if (!emailRegex.test(email)) {
      document.getElementById("err-email").textContent = "Enter a valid email e.g. you@mail.com";
      isValid = false;
    } else {
      document.getElementById("err-email").textContent = "";
    }

    // Validate phone number
    const phoneRegex = /^[0-9+\s\-]{7,15}$/;
    if (phone === "") {
      document.getElementById("err-phone").textContent = "Please enter your phone number.";
      isValid = false;
    } else if (!phoneRegex.test(phone)) {
      document.getElementById("err-phone").textContent = "Enter a valid phone number (7-15 digits).";
      isValid = false;
    } else {
      document.getElementById("err-phone").textContent = "";
    }

    // Validate address
    if (address === "") {
      document.getElementById("err-address").textContent = "Please enter your delivery address.";
      isValid = false;
    } else {
      document.getElementById("err-address").textContent = "";
    }

    if (isValid) {
      localStorage.removeItem("shopwith_cart");
      updateCartCount();

      const popup = document.getElementById("done-popup");
      if (popup) {
        popup.classList.remove("hidden");
      }
    }

  } catch (error) {
    console.error("Order error:", error);
    alert(error.message);
  }
}

// START
document.addEventListener("DOMContentLoaded", function() {
  updateCartCount();
  setupHomePage();
  setupCartPage();
  setupCheckoutPage();
});
