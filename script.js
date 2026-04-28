// بيانات المنتجات (يمكنك استبدالها ببيانات من قاعدة بيانات لاحقًا)
const productsData = [
    { id: 1, name: 'Samsung Galaxy S24 Ultra', price: 299.900, oldPrice: 349.900, image: 'https://via.placeholder.com/300x300?text=S24+Ultra' },
    { id: 2, name: 'Apple iPhone 15 Pro Max', price: 399.900, oldPrice: 449.900, image: 'https://via.placeholder.com/300x300?text=iPhone+15+Pro+Max' },
    { id: 3, name: 'MacBook Air M3', price: 499.900, oldPrice: 599.900, image: 'https://via.placeholder.com/300x300?text=MacBook+Air+M3' },
    { id: 4, name: 'Sony WH-1000XM5 Headphones', price: 149.900, oldPrice: 199.900, image: 'https://via.placeholder.com/300x300?text=Sony+Headphones' },
    { id: 5, name: 'iPad Pro 12.9-inch', price: 449.900, oldPrice: 499.900, image: 'https://via.placeholder.com/300x300?text=iPad+Pro' },
    { id: 6, name: 'LG 55" OLED TV', price: 599.900, oldPrice: 699.900, image: 'https://via.placeholder.com/300x300?text=LG+OLED+TV' }
];

// سلة التسوق (سنستخدم localStorage لحفظ البيانات)
let cart = JSON.parse(localStorage.getItem('xcCloneCart')) || [];

// دالة عرض المنتجات في الصفحة
function displayProducts() {
    const container = document.getElementById('productsContainer');
    if (!container) return;
    
    container.innerHTML = productsData.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ${product.price.toFixed(3)} د.ك
                    <span class="old-price">${product.oldPrice.toFixed(3)} د.ك</span>
                </div>
                <button class="add-to-cart" data-id="${product.id}">أضف إلى السلة</button>
            </div>
        </div>
    `).join('');
    
    // إضافة مستمعي الأحداث لأزرار الإضافة إلى السلة
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = parseInt(button.dataset.id);
            addToCart(productId);
        });
    });
}

// دالة إضافة منتج إلى السلة
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showNotification(`تم إضافة ${product.name} إلى السلة`);
    openCartSidebar(); // فتح السلة تلقائيًا عند الإضافة
}

// دالة تحديث واجهة السلة
function updateCart() {
    // حفظ السلة في localStorage
    localStorage.setItem('xcCloneCart', JSON.stringify(cart));
    
    // تحديث عدد المنتجات في أيقونة السلة
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    
    // عرض عناصر السلة في الشريط الجانبي
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalElement = document.getElementById('cartTotalPrice');
    
    if (cartItemsContainer) {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart">سلة التسوق فارغة</div>';
            if (cartTotalElement) cartTotalElement.textContent = '0.00 د.ك';
            return;
        }
        
        cartItemsContainer.innerHTML = cart.map(item => {
            const itemTotal = item.price * item.quantity;
            return `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <div class="cart-item-price">${item.price.toFixed(3)} د.ك</div>
                        <div class="cart-item-quantity">
                            <button class="qty-btn minus" data-id="${item.id}">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn plus" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-total">
                        ${itemTotal.toFixed(3)} د.ك
                        <button class="remove-item" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
        }).join('');
        
        // إضافة مستمعي الأحداث لأزرار التحكم بالكميات والحذف
        document.querySelectorAll('.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                updateQuantity(id, -1);
            });
        });
        
        document.querySelectorAll('.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                updateQuantity(id, 1);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(btn.dataset.id);
                removeFromCart(id);
            });
        });
    }
    
    // حساب وعرض المجموع الكلي
    if (cartTotalElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotalElement.textContent = `${total.toFixed(3)} د.ك`;
    }
}

// دالة تحديث كمية منتج معين
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        const newQuantity = item.quantity + change;
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            updateCart();
        }
    }
}

// دالة حذف منتج من السلة
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    
    if (cart.length === 0) {
        closeCartSidebar();
    }
}

// دالة عرض إشعار منبثق
function showNotification(message) {
    // إنشاء عنصر الإشعار إذا لم يكن موجودًا
    let notification = document.querySelector('.custom-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'custom-notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// دالة فتح شريط السلة الجانبي
function openCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar && overlay) {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    }
}

// دالة إغلاق شريط السلة الجانبي
function closeCartSidebar() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// إدارة نافذة تسجيل الدخول المنبثقة
function setupLoginPopup() {
    const loginBtn = document.getElementById('loginBtn');
    const loginPopup = document.getElementById('loginPopup');
    const closeLoginBtn = document.getElementById('closeLoginBtn');
    const loginForm = document.getElementById('loginForm');
    
    if (loginBtn && loginPopup) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            loginPopup.style.display = 'flex';
        });
    }
    
    if (closeLoginBtn && loginPopup) {
        closeLoginBtn.addEventListener('click', () => {
            loginPopup.style.display = 'none';
        });
    }
    
    // إغلاق النافذة عند النقر خارج المحتوى
    if (loginPopup) {
        loginPopup.addEventListener('click', (e) => {
            if (e.target === loginPopup) {
                loginPopup.style.display = 'none';
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('تم إرسال بيانات تسجيل الدخول (نموذج تجريبي)');
            loginPopup.style.display = 'none';
        });
    }
}

// تهيئة الأحداث عند تحميل الصفحة
$(document).ready(function() {
    displayProducts();
    updateCart();
    
    // إعداد أحداث السلة
    $('#cartIcon').on('click', function(e) {
        e.preventDefault();
        if (cart.length > 0) {
            openCartSidebar();
        } else {
            showNotification('سلة التسوق فارغة حاليًا');
        }
    });
    
    $('#closeCartBtn, #cartOverlay').on('click', function() {
        closeCartSidebar();
    });
    
    // زر إتمام الشراء
    $('#checkoutBtn').on('click', function() {
        if (cart.length === 0) {
            showNotification('سلة التسوق فارغة، أضف منتجات أولاً');
        } else {
            alert('شكراً لتسوقك معنا! هذه واجهة تجريبية.');
            // يمكن إضافة توجيه إلى صفحة الدفع هنا
        }
    });
    
    setupLoginPopup();
});
