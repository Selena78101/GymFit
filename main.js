// Datos de Planes y Servicios
const PLANS = [
    { id: 'basic', name: 'Básico', price: 15000, desc: 'Ideal para quienes recién comienzan.', features: ['Acceso a musculación', 'Horario de 08:00 a 16:00', 'Vestuarios y duchas'] },
    { id: 'premium', name: 'Premium', price: 25000, desc: 'La opción más elegida para entrenar sin límites.', features: ['Acceso libre 24/7', 'Todas las clases grupales', 'Rutina personalizada'] },
    { id: 'pro', name: 'Pro', price: 35000, desc: 'Para aquellos que buscan resultados profesionales.', features: ['Acceso libre 24/7', 'Entrenador personal', 'Seguimiento nutricional'] }
];

const SERVICES = [
    { id: 's1', name: 'Entrenamiento Personalizado', price: 10000, desc: 'Rutinas 1 a 1 con un entrenador profesional experto.' },
    { id: 's2', name: 'Clases de Yoga', price: 8000, desc: 'Mejora tu flexibilidad, postura y reduce el estrés.' },
    { id: 's3', name: 'Clases de Crossfit', price: 12000, desc: 'Entrenamiento funcional de alta intensidad.' },
    { id: 's4', name: 'Nutrición Deportiva', price: 15000, desc: 'Plan alimenticio diseñado para alcanzar tus objetivos.' },
    { id: 's5', name: 'Plan de Entrenamiento', price: 5000, desc: 'Rutina mensual a medida para seguir por tu cuenta.' },
    { id: 's6', name: 'Masajes Deportivos', price: 9000, desc: 'Recuperación muscular y relajación post-entreno.' }
];

// Estado global
let currentMembership = null; // { id, date, userInfo: { name, email, phone } }
let cart = []; // Array de { id, quantity }
let pendingPlanId = null;

// Elementos DOM
const plansGrid = document.getElementById('plans-grid');
const membershipManagement = document.getElementById('membership-management');
const servicesGrid = document.getElementById('services-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartSummary = document.getElementById('cart-summary');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const btnCheckout = document.getElementById('btn-checkout');
const toast = document.getElementById('toast');

// Utilidad para formato de moneda (Ej: $ 15.000)
function formatMoney(amount) {
    return '$' + amount.toLocaleString('es-AR');
}

// Inicialización
function init() {
    loadData();
    renderPlans();
    renderManagement();
    renderServices();
    renderCart();
    
    btnCheckout.addEventListener('click', checkout);
    document.getElementById('user-info-form').addEventListener('submit', handleUserInfoSubmit);
}

// Carga de Persistencia (localStorage)
function loadData() {
    const savedMembership = localStorage.getItem('gym_membership');
    if (savedMembership) {
        currentMembership = JSON.parse(savedMembership);
    }
    
    const savedCart = localStorage.getItem('gym_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function saveMembership() {
    if (currentMembership) {
        localStorage.setItem('gym_membership', JSON.stringify(currentMembership));
    } else {
        localStorage.removeItem('gym_membership');
    }
}

function saveCart() {
    localStorage.setItem('gym_cart', JSON.stringify(cart));
}

// ========================
// Módulo de Membresías
// ========================

function renderPlans() {
    plansGrid.innerHTML = '';
    
    PLANS.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const isSelected = currentMembership && currentMembership.id === plan.id;
        const btnClass = isSelected ? 'btn btn-outline btn-full' : 'btn btn-primary btn-full';
        const btnText = isSelected ? 'Plan Actual' : 'Seleccionar Plan';
        const btnDisabled = isSelected ? 'disabled' : '';
        
        card.innerHTML = `
            <h3>${plan.name}</h3>
            <div class="price">${formatMoney(plan.price)}</div>
            <p>${plan.desc}</p>
            <ul>
                ${plan.features.map(f => `<li>${f}</li>`).join('')}
            </ul>
            <button class="${btnClass}" onclick="selectPlan('${plan.id}')" ${btnDisabled}>${btnText}</button>
        `;
        plansGrid.appendChild(card);
    });
}

function selectPlan(planId) {
    pendingPlanId = planId;
    const plan = PLANS.find(p => p.id === planId);
    document.getElementById('modal-plan-name').textContent = `Plan ${plan.name}`;
    document.getElementById('user-info-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('user-info-modal').classList.add('hidden');
    pendingPlanId = null;
}

function handleUserInfoSubmit(e) {
    e.preventDefault();
    if (!pendingPlanId) return;

    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();

    currentMembership = { 
        id: pendingPlanId, 
        date: new Date().toISOString(),
        userInfo: { name, email, phone }
    };
    
    saveMembership();
    renderPlans();
    renderManagement();
    
    closeModal();
    e.target.reset();
    showToast('Plan seleccionado correctamente');
}

function renderManagement() {
    if (currentMembership) {
        const plan = PLANS.find(p => p.id === currentMembership.id);
        const userName = currentMembership.userInfo ? currentMembership.userInfo.name : 'Usuario';
        
        membershipManagement.innerHTML = `
            <span class="status-badge">Membresía Activa</span>
            <h3>Plan ${plan.name}</h3>
            <p>¡Hola <strong>${userName}</strong>! Disfruta de todos tus beneficios. Facturación mensual de ${formatMoney(plan.price)}.</p>
            <button class="btn btn-danger" onclick="cancelPlan()">Cancelar Membresía</button>
        `;
        membershipManagement.classList.remove('hidden');
    } else {
        membershipManagement.classList.add('hidden');
    }
}

function cancelPlan() {
    if (confirm('¿Estás seguro de cancelar tu plan actual?')) {
        currentMembership = null;
        saveMembership();
        renderPlans();
        renderManagement();
        showToast('Membresía cancelada');
    }
}

// ========================
// Módulo de Servicios
// ========================

function renderServices() {
    servicesGrid.innerHTML = '';
    
    SERVICES.forEach(service => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <h3>${service.name}</h3>
            <div class="price">${formatMoney(service.price)}</div>
            <p>${service.desc}</p>
            <button class="btn btn-outline btn-full" onclick="addToCart('${service.id}')">Agregar al Carrito</button>
        `;
        servicesGrid.appendChild(card);
    });
}

// ========================
// Módulo de Carrito
// ========================

function addToCart(serviceId) {
    const existingItem = cart.find(item => item.id === serviceId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: serviceId, quantity: 1 });
    }
    
    saveCart();
    renderCart();
    showToast('Servicio agregado al carrito');
}

function removeFromCart(serviceId) {
    cart = cart.filter(item => item.id !== serviceId);
    saveCart();
    renderCart();
}

function updateQuantity(serviceId, change) {
    const item = cart.find(item => item.id === serviceId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(serviceId);
        } else {
            saveCart();
            renderCart();
        }
    }
}

function renderCart() {
    cartItemsContainer.innerHTML = '';
    
    // Contar el total de items para el indicador visual en el header
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    const cartContainer = document.getElementById('cart-container');
    
    // Vista vacía
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío. Agregá servicios desde el catálogo.</div>';
        cartSummary.classList.add('hidden');
        if (cartContainer) cartContainer.classList.add('empty-layout');
        return;
    }
    
    if (cartContainer) cartContainer.classList.remove('empty-layout');
    
    let total = 0;
    
    // Renderizar cada item
    cart.forEach(item => {
        const service = SERVICES.find(s => s.id === item.id);
        const subtotal = service.price * item.quantity;
        total += subtotal;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        
        cartItemEl.innerHTML = `
            <div class="cart-item-info">
                <h4>${service.name}</h4>
                <div class="item-price">${formatMoney(service.price)} c/u</div>
            </div>
            <div class="cart-controls">
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                </div>
                <button class="btn-remove" onclick="removeFromCart('${item.id}')" title="Eliminar servicio">
                    <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });
    
    // Actualizar resumen
    cartSubtotal.textContent = formatMoney(total);
    cartTotal.textContent = formatMoney(total);
    cartSummary.classList.remove('hidden');
}

// Simulación de Compra
function checkout() {
    if (cart.length === 0) return;
    
    // Vaciar carrito
    cart = [];
    saveCart();
    renderCart();
    
    // Feedback visual y scroll al inicio
    showToast('¡Compra finalizada con éxito! Gracias por confiar en GymFit.');
    document.getElementById('hero').scrollIntoView({behavior: 'smooth'});
}

// ========================
// Sistema de Notificaciones (Toast)
// ========================
let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Iniciar aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', init);
