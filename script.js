/* Notification */
const notification = document.getElementById("notification");

function showNotification(message) {
    if (!notification) {
        alert(message);
        return;
    }

    notification.innerHTML = message;
    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 2500);
}

/* Hero Buttons */
const getStartedBtn = document.getElementById("getStartedBtn");
const exploreBtn = document.getElementById("exploreBtn");
if (getStartedBtn) {
    getStartedBtn.addEventListener("click", function () {
        authModal.style.display = "block";
    });
}

if (exploreBtn) {
    exploreBtn.addEventListener("click", function () {
        document.getElementById("marketplace").scrollIntoView({
            behavior: "smooth"
        });
    });
}

/* Navbar Shadow */
window.addEventListener("scroll", function () {
    const header = document.querySelector("header");

    if (window.scrollY > 50) {
        header.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";
    } else {
        header.style.boxShadow = "0 4px 15px rgba(0,0,0,0.08)";
    }
});

/* Dark Mode */
const darkBtn = document.getElementById("darkModeToggle");

if (darkBtn) {
    darkBtn.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            darkBtn.innerHTML = "☀️";
        } else {
            darkBtn.innerHTML = "🌙";
        }
    });
}

/* Marketplace Popup */
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

function attachPopupEvents() {
    const marketButtons = document.querySelectorAll(".market-card .market-btn");

    marketButtons.forEach((button) => {
        button.onclick = () => {
            if (!popup) return;

            popup.style.display = "block";

            const card = button.closest(".market-card");

const productName = card.querySelector("h3").innerText;
const productPrice = card.querySelector("p").innerText;
const productDesc = card.getAttribute("data-desc") || "No description available.";

document.getElementById("popupText").innerHTML = `
    <strong>Product:</strong> ${productName}<br><br>
    <strong>Price:</strong> ${productPrice}<br><br>
    <strong>Description:</strong> ${productDesc}<br><br>
    <strong>Status:</strong> Available
`;
        };
    });
}

attachPopupEvents();

if (closePopup) {
    closePopup.addEventListener("click", () => {
        popup.style.display = "none";
    });
}

/* Login Modal */
const loginBtn = document.getElementById("loginBtn");
const authModal = document.getElementById("authModal");
const closeAuth = document.getElementById("closeAuth");
const showSignup = document.getElementById("showSignup");

if (loginBtn && authModal) {
    loginBtn.addEventListener("click", () => {
        authModal.style.display = "block";
    });
}

if (closeAuth && authModal) {
    closeAuth.addEventListener("click", () => {
        authModal.style.display = "none";
    });
}


/* Join Now Button */
const joinBtn = document.getElementById("joinBtn");

if (joinBtn && authModal) {
    joinBtn.addEventListener("click", () => {
        authModal.style.display = "block";

        isSignupMode = true;

        document.querySelector(".auth-box h2").innerHTML = "Create Account";
        document.querySelector(".auth-form button").innerHTML = "Sign Up";
        showSignup.innerHTML = "Login";
    });
}
/* Product Upload */
const uploadBtn = document.getElementById("uploadBtn");
const uploadModal = document.getElementById("uploadModal");
const closeUpload = document.getElementById("closeUpload");
const uploadForm = document.querySelector(".upload-form");
const marketplaceContainer = document.querySelector(".marketplace-container");

let savedProducts = JSON.parse(localStorage.getItem("products")) || [];

function createProductCard(product) {
    const newCard = document.createElement("div");
    newCard.classList.add("market-card");
    newCard.setAttribute("data-category", "rental");
    newCard.setAttribute("data-desc", product.desc);
    newCard.setAttribute("data-id", product.id);
    newCard.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <button class="wishlist-btn">♡</button>
    <h3>${product.name}</h3>
    <p>${product.price}</p>
    <button class="market-btn">View Details</button>
    <button class="contact-seller-btn" data-email="${product.ownerEmail}">
    Contact Seller
    </button>
    ${window.auth.currentUser &&
      window.auth.currentUser.uid === product.ownerId
       ? `
       <button class="delete-btn">Delete Listing</button>
       <button class="edit-btn">Edit Listing</button>
       `
       : '' 
    }
`;

    marketplaceContainer.appendChild(newCard);

    attachPopupEvents();
    attachWishlistEvents();
   
}

function displaySavedProducts() {
    savedProducts.forEach((product) => {
        createProductCard(product);
    });
}
async function loadProductsFromFirebase() {
    try {
        const querySnapshot = await window.getDocs(
            window.collection(window.db, "products")
        );

        querySnapshot.forEach((item) => {
            const product = item.data();
            product.id = item.id;
            createProductCard(product);
        });

        console.log("Products loaded from Firebase ✅");

    } catch (error) {
        console.error("Error loading products:", error);
        displaySavedProducts();
    }
}

if (marketplaceContainer) {
    window.addEventListener("firebase-ready", () => {
        loadProductsFromFirebase();
    });
}

if (uploadBtn && uploadModal) {
    uploadBtn.addEventListener("click", () => {
        uploadModal.style.display = "block";
    });
}

if (closeUpload && uploadModal) {
    closeUpload.addEventListener("click", () => {
        uploadModal.style.display = "none";
    });
}

if (uploadForm) {
    uploadForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("productName").value;
        const price = document.getElementById("productPrice").value;
        const image = document.getElementById("productImage").value;
        const desc = document.getElementById("productDesc").value;

        if (name === "" || price === "" || image === "" || desc === "") {
            showNotification("Please fill all product details.");
            return;
        }

       const user = window.auth.currentUser;

       if (!user) {
           showNotification("Please login before uploading product.");
           authModal.style.display = "block";
           return;
        }

        const product = {
            name: name,
            price: price,
            image: image,
            desc: desc
        };

const docRef = await window.addDoc(window.collection(window.db, "products"), {
    name: name,
    price: price,
    image: image,
    desc: desc,
    category: "rental",
    ownerId: user.uid,
    ownerEmail: user.email,
    createdAt: new Date()
});

product.id = docRef.id;
product.ownerId = user.uid;
product.ownerEmail = user.email;

createProductCard(product);
await window.updateDoc(window.doc(window.db, "users", user.uid), {
    credits: window.increment(20)
});
const creditBalance = document.getElementById("creditBalance");

if (creditBalance) {
    creditBalance.innerHTML =
        Number(creditBalance.innerHTML) + 20;
}
        uploadForm.reset();
        uploadModal.style.display = "none";

        showNotification("Product added successfully ✅ +20 credits earned");
    });
}

/* Search */
const searchInput = document.getElementById("searchInput");

if (searchInput) {
    searchInput.addEventListener("keyup", () => {
        const searchValue = searchInput.value.toLowerCase();
        const marketCards = document.querySelectorAll(".market-card");

        marketCards.forEach((card) => {
            const productName = card.querySelector("h3").innerText.toLowerCase();

            if (productName.includes(searchValue)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
}

/* Filter */
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const category = button.dataset.category;
        const cards = document.querySelectorAll(".market-card");

        cards.forEach((card) => {
            if (category === "all" || card.dataset.category === category) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });
    });
});

/* Wishlist */

const wishlistNumber = document.getElementById("wishlistNumber");
let wishlistCount = 0;

function attachWishlistEvents() {

    const wishlistButtons =
        document.querySelectorAll(".wishlist-btn");

    wishlistButtons.forEach((button) => {

        button.onclick = async () => {

            if (!window.auth.currentUser) {

                showNotification(
                    "Please login to add items to wishlist."
                );

                authModal.style.display = "block";

                return;
            }

            button.classList.toggle("wishlist-active");

            if (button.classList.contains("wishlist-active")) {

                button.innerHTML = "♥";

                wishlistCount++;

                const card =
                    button.closest(".market-card");

                const productName =
                    card.querySelector("h3").innerText;

                const productPrice =
                    card.querySelector("p").innerText;

                const productId =
                    card.getAttribute("data-id") ||
                    productName.replace(/\s+/g, "-");

                await window.setDoc(
                    window.doc(
                        window.db,
                        "users",
                        window.auth.currentUser.uid,
                        "wishlist",
                        productId
                    ),
                    {
                        productId: productId,
                        name: productName,
                        price: productPrice,
                        addedAt: new Date()
                    }
                );

                showNotification("Added to Wishlist ❤️");

           } else {

    button.innerHTML = "♡";

    wishlistCount--;

    const card =
        button.closest(".market-card");

    const productName =
        card.querySelector("h3").innerText;

    const productId =
        card.getAttribute("data-id") ||
        productName.replace(/\s+/g, "-");

    await window.deleteDoc(
        window.doc(
            window.db,
            "users",
            window.auth.currentUser.uid,
            "wishlist",
            productId
        )
    );

    showNotification("Removed from Wishlist");

}

            if (wishlistNumber) {

                wishlistNumber.innerHTML = wishlistCount;

            }

        };

    });

}

attachWishlistEvents();

/* Close modals on outside click */
window.addEventListener("click", (e) => {
    if (popup && e.target === popup) {
        popup.style.display = "none";
    }

    if (authModal && e.target === authModal) {
        authModal.style.display = "none";
    }

    if (uploadModal && e.target === uploadModal) {
        uploadModal.style.display = "none";
    }
});
/* Loader */

window.addEventListener("load", () => {
    const loader = document.getElementById("loader");

    setTimeout(() => {
        loader.style.display = "none";
    }, 1000);
});
/* Scroll Progress Bar */

window.addEventListener("scroll", () => {

    const scrollTop = document.documentElement.scrollTop;

    const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

    const scrollPercent = (scrollTop / scrollHeight) * 100;

    document.getElementById("progressBar").style.width =
        scrollPercent + "%";
});
/* Back To Top */

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (window.scrollY > 400) {
        topBtn.style.display = "block";
    } else {
        topBtn.style.display = "none";
    }
});

topBtn.addEventListener("click", () => {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});
/* Reveal Animation */

function revealSections() {

    const reveals = document.querySelectorAll(".reveal");

    reveals.forEach((section) => {

        const windowHeight = window.innerHeight;

        const revealTop = section.getBoundingClientRect().top;

        const revealPoint = 120;

        if (revealTop < windowHeight - revealPoint) {
            section.classList.add("active");
        }

    });
}

window.addEventListener("scroll", revealSections);

revealSections();
/* Mobile Navbar */

const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
        navMenu.classList.toggle("active");

        if (navMenu.classList.contains("active")) {
            menuToggle.innerHTML = "✖";
        } else {
            menuToggle.innerHTML = "☰";
        }
    });
}
/* Coming Soon Buttons */

const comingSoonButtons = document.querySelectorAll(
    ".job-card button, .note-card button, .team-card button"
);

comingSoonButtons.forEach((button) => {
    button.addEventListener("click", () => {
        showNotification("This feature will be available soon 🚀");
    });
});
/* Firebase Auth */

const authForm = document.querySelector(".auth-form");
const authTitle = document.querySelector(".auth-box h2");
const authButton = document.querySelector(".auth-form button");

let isSignupMode = false;

if (showSignup) {
    showSignup.addEventListener("click", () => {

        isSignupMode = !isSignupMode;

        if (isSignupMode) {
            authTitle.innerHTML = "Create Account";
            authButton.innerHTML = "Sign Up";
            showSignup.innerHTML = "Login";
        } else {
            authTitle.innerHTML = "Login to CampusHub";
            authButton.innerHTML = "Login";
            showSignup.innerHTML = "Sign Up";
        }
    });
}

if (authForm) {

    authForm.addEventListener("submit", async (e) => {

        e.preventDefault();

        const email = document.getElementById("authEmail").value;
        const password = document.getElementById("authPassword").value;

        try {

            if (isSignupMode) {

                const userCredential =
                    await window.createUserWithEmailAndPassword(
                        window.auth,
                        email,
                        password
                    );

                await window.saveUserProfile(userCredential.user);

                loginBtn.innerHTML = email;

                showNotification("Account created successfully ✅");

            } else {

                await window.signInWithEmailAndPassword(
                    window.auth,
                    email,
                    password
                );

                loginBtn.innerHTML = email;

                showNotification("Login successful ✅");
            }

            authModal.style.display = "none";
            authForm.reset();

        } catch (error) {

            showNotification(error.message);
            console.error(error);

        }

    });

}

/* Load Wishlist */

async function loadWishlist() {

    if (!window.auth.currentUser) return;

    const wishlistSnapshot =
        await window.getDocs(
            window.collection(
                window.db,
                "users",
                window.auth.currentUser.uid,
                "wishlist"
            )
        );

    wishlistCount = 0;

    wishlistSnapshot.forEach((item) => {

        const wishlistItem = item.data();

        const cards =
            document.querySelectorAll(".market-card");

        cards.forEach((card) => {

            const cardId =
                card.getAttribute("data-id");

            if (cardId === wishlistItem.productId) {

                const heart =
                    card.querySelector(".wishlist-btn");

                if (heart) {
                    heart.classList.add("wishlist-active");
                    heart.innerHTML = "♥";
                    wishlistCount++;
                }

            }

        });

    });

    if (wishlistNumber) {
        wishlistNumber.innerHTML = wishlistCount;
    }

}

/* Delete Uploaded Listing */

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const card = e.target.closest(".market-card");
        const productName = card.querySelector("h3").innerText;
        const productId = card.getAttribute("data-id");

        if (productId) {
            await window.deleteDoc(
                window.doc(window.db, "products", productId)
            );
        }

        card.remove();

        savedProducts = savedProducts.filter((product) => {
            return product.name !== productName;
        });

        localStorage.setItem("products", JSON.stringify(savedProducts));

        showNotification("Listing deleted successfully ✅");
    }
});

/* Auth State Changes */

window.addEventListener("firebase-ready", () => {

    window.onAuthStateChanged(window.auth, async (user) => {

        const uploadBtn =
            document.getElementById("uploadBtn");

        if (uploadBtn) {

            if (user) {
                uploadBtn.style.display = "inline-block";
            } else {
                uploadBtn.style.display = "none";
            }

        }

        if (user) {

            loginBtn.innerHTML = user.email;

            marketplaceContainer.innerHTML = "";
            await loadProductsFromFirebase();
            await loadWishlist();

            const usersSnapshot = await window.getDocs(
                window.collection(window.db, "users")
            );

            usersSnapshot.forEach((docItem) => {
                const userData = docItem.data();

                if (userData.uid === user.uid) {
                    const creditBalance =
                        document.getElementById("creditBalance");

                    if (creditBalance) {
                        creditBalance.innerHTML = userData.credits;
                    }
                }
            });

        } else {

            loginBtn.innerHTML = "Login";

            if (wishlistNumber) {
                wishlistNumber.innerHTML = 0;
            }

        }

    });

});

/* Logout */

loginBtn.addEventListener("click", async (e) => {

    if (window.auth.currentUser) {

        e.preventDefault();

        await window.signOut(window.auth);

        loginBtn.innerHTML = "Login";

        showNotification("Logged out successfully ✅");

    }

});
const myListingsCard = document.getElementById("myListingsCard");

if (myListingsCard) {
    myListingsCard.addEventListener("click", () => {
        if (!window.auth.currentUser) {
            showNotification("Please login to view your listings.");
            authModal.style.display = "block";
            return;
        }

        document.getElementById("marketplace").scrollIntoView({
            behavior: "smooth"
        });

        const cards = document.querySelectorAll(".market-card");

        cards.forEach((card) => {
            const deleteBtn = card.querySelector(".delete-btn");

            if (deleteBtn) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        showNotification("Showing your listings only.");
    });
}
const showAllProductsBtn = document.getElementById("showAllProductsBtn");

if (showAllProductsBtn) {
    showAllProductsBtn.addEventListener("click", () => {
        const cards = document.querySelectorAll(".market-card");

        cards.forEach((card) => {
            card.style.display = "block";
        });

        showNotification("Showing all products.");
    });
}
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("contact-seller-btn")) {

        if (!window.auth.currentUser) {
            showNotification("Please login to contact seller.");
            authModal.style.display = "block";
            return;
        }

        const sellerEmail = e.target.getAttribute("data-email");

        if (!sellerEmail || sellerEmail === "undefined") {
            showNotification("Seller contact not available.");
            return;
        }

        window.open(
           `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${sellerEmail}`,
           "_blank"
        );
    }
});
document.addEventListener("click", async (e) => {

    if (e.target.classList.contains("edit-btn")) {

        const card = e.target.closest(".market-card");

        const productId =
            card.getAttribute("data-id");

        const currentName =
            card.querySelector("h3").innerText;

        const currentPrice =
            card.querySelector("p").innerText;

        const newName =
            prompt("Edit product name:", currentName);

        const newPrice =
            prompt("Edit product price:", currentPrice);

        if (!newName || !newPrice) return;

        await window.updateDoc(
            window.doc(window.db, "products", productId),
            {
                name: newName,
                price: newPrice
            }
        );

        card.querySelector("h3").innerText =
            newName;

        card.querySelector("p").innerText =
            newPrice;

        showNotification("Listing updated successfully ✅");

    }

});
/* Subscription Group Modal */

const subscriptionModal = document.getElementById("subscriptionModal");
const closeSubscription = document.getElementById("closeSubscription");
const subscriptionForm = document.querySelector(".subscription-form");

const subscriptionButtons = document.querySelectorAll(".subscription-card button");

subscriptionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        if (!window.auth.currentUser) {
            showNotification("Please login to create or join subscription groups.");
            authModal.style.display = "block";
            return;
        }

        subscriptionModal.style.display = "block";
    });
});

if (closeSubscription) {
    closeSubscription.addEventListener("click", () => {
        subscriptionModal.style.display = "none";
    });
}

if (subscriptionForm) {
    subscriptionForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("subscriptionName").value;
        const category = document.getElementById("subscriptionCategory").value;
        const members = document.getElementById("subscriptionMembers").value;
        const cost = document.getElementById("subscriptionCost").value;
        const desc = document.getElementById("subscriptionDesc").value;

        if (name === "" || category === "" || members === "" || cost === "" || desc === "") {
            showNotification("Please fill all subscription group details.");
            return;
        }

        const user = window.auth.currentUser;

        if (!user) {
            showNotification("Please login first.");
            authModal.style.display = "block";
            return;
        }

        await window.addDoc(window.collection(window.db, "subscriptionGroups"), {
            name: name,
            category: category,
            membersNeeded: members,
            costPerMember: cost,
            desc: desc,
            ownerId: user.uid,
            ownerEmail: user.email,
            createdAt: new Date()
        });

        subscriptionForm.reset();
        subscriptionModal.style.display = "none";

        showNotification("Subscription group created successfully ✅");
        loadSubscriptionGroups();
    });
}
/* Display Subscription Groups */

const createdSubscriptionGroups = document.getElementById("createdSubscriptionGroups");

function createSubscriptionGroupCard(group) {
    if (!createdSubscriptionGroups) return;

    const groupCard = document.createElement("div");
    groupCard.classList.add("created-subscription-card");
    groupCard.setAttribute("data-owner-email", group.ownerEmail);

    groupCard.innerHTML = `
        <h3>${group.name}</h3>
        <p><strong>Category:</strong> ${group.category}</p>
        <p><strong>Members Needed:</strong> ${group.membersNeeded}</p>
        <p><strong>Cost:</strong> ${group.costPerMember}</p>
        <p>${group.desc}</p>
        <p class="group-owner">Owner: ${group.ownerEmail}</p>
        <button class="market-btn join-subscription-btn">Request to Join</button>
    `;

    createdSubscriptionGroups.appendChild(groupCard);
}

async function loadSubscriptionGroups() {
    if (!createdSubscriptionGroups) return;

    createdSubscriptionGroups.innerHTML = "";

    try {
        const querySnapshot = await window.getDocs(
            window.collection(window.db, "subscriptionGroups")
        );

        querySnapshot.forEach((item) => {
            const group = item.data();
            createSubscriptionGroupCard(group);
        });

    } catch (error) {
        console.error("Error loading subscription groups:", error);
    }
}

window.addEventListener("firebase-ready", () => {
    loadSubscriptionGroups();
});
/* Request to Join Subscription Group */

document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("join-subscription-btn")) {

        if (!window.auth.currentUser) {
            showNotification("Please login to request joining.");
            authModal.style.display = "block";
            return;
        }

        const groupCard = e.target.closest(".created-subscription-card");

        const groupName = groupCard.querySelector("h3").innerText;
        const ownerEmail = groupCard.getAttribute("data-owner-email");

        await window.addDoc(window.collection(window.db, "subscriptionRequests"), {
            groupName: groupName,
            ownerEmail: ownerEmail,
            requesterEmail: window.auth.currentUser.email,
            requesterId: window.auth.currentUser.uid,
            status: "pending",
            createdAt: new Date()
        });

        showNotification("Join request sent successfully ✅");
        loadSubscriptionRequests();6
    }
});
/* My Subscription Groups Dashboard */

const mySubscriptionGroupsCard = document.getElementById("mySubscriptionGroupsCard");

if (mySubscriptionGroupsCard) {
    mySubscriptionGroupsCard.addEventListener("click", async () => {
        if (!window.auth.currentUser) {
            showNotification("Please login to view your subscription groups.");
            authModal.style.display = "block";
            return;
        }

        document.getElementById("subscriptions").scrollIntoView({
            behavior: "smooth"
        });

        const cards = document.querySelectorAll(".created-subscription-card");

        cards.forEach((card) => {
            const ownerEmail = card.getAttribute("data-owner-email");

            if (ownerEmail === window.auth.currentUser.email) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

        showNotification("Showing your subscription groups only.");
    });
}
/* Display Subscription Join Requests */

const subscriptionRequestsContainer =
    document.getElementById("subscriptionRequestsContainer");

function createSubscriptionRequestCard(request) {
    if (!subscriptionRequestsContainer) return;

    const requestCard = document.createElement("div");
    requestCard.classList.add("subscription-request-card");
    requestCard.setAttribute("data-request-id", request.id);

requestCard.innerHTML = `
    <h3>${request.groupName}</h3>
    <p><strong>Requested By:</strong> ${request.requesterEmail}</p>
    <p><strong>Status:</strong> <span class="request-status">${request.status}</span></p>

    <button class="market-btn approve-request-btn">Approve</button>
    <button class="delete-btn reject-request-btn">Reject</button>
`;

    subscriptionRequestsContainer.appendChild(requestCard);
}

async function loadSubscriptionRequests() {
    if (!subscriptionRequestsContainer) return;

    subscriptionRequestsContainer.innerHTML = "";

    if (!window.auth.currentUser) return;

    try {
        const querySnapshot = await window.getDocs(
            window.collection(window.db, "subscriptionRequests")
        );

        querySnapshot.forEach((item) => {
            const request = item.data();
            request.id = item.id;

            if (request.ownerEmail === window.auth.currentUser.email) {
                createSubscriptionRequestCard(request);
            }
        });

    } catch (error) {
        console.error("Error loading subscription requests:", error);
    }
}

window.addEventListener("firebase-ready", () => {
    window.onAuthStateChanged(window.auth, () => {
        loadSubscriptionRequests();
    });
});
/* Approve / Reject Subscription Requests */

document.addEventListener("click", async (e) => {
    if (
        e.target.classList.contains("approve-request-btn") ||
        e.target.classList.contains("reject-request-btn")
    ) {
        const requestCard = e.target.closest(".subscription-request-card");
        const requestId = requestCard.getAttribute("data-request-id");

        const newStatus = e.target.classList.contains("approve-request-btn")
            ? "approved"
            : "rejected";

        await window.updateDoc(
            window.doc(window.db, "subscriptionRequests", requestId),
            {
                status: newStatus
            }
        );

        requestCard.querySelector(".request-status").innerHTML = newStatus;

        showNotification(`Request ${newStatus} successfully ✅`);
    }
});