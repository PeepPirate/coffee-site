// ==========================================
// 1. UI LOGIC (Routing, Cart, Roaster)
// ==========================================

// Mobile Hamburger Menu
function toggleMobileMenu() {
    document.getElementById('nav-links').classList.toggle('open');
}

// Navigation & Dynamic Camera
function navigate(targetId) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.target === targetId));
    document.querySelectorAll('.page-section').forEach(section => section.classList.toggle('active', section.id === targetId));
    
    document.getElementById('nav-links').classList.remove('open');
    document.getElementById('cart-sidebar').classList.remove('open');

    // 3D Camera Responsive Math
    const isMobile = window.innerWidth <= 850;
    if (targetId === 'home') { 
        targetCameraZ = isMobile ? 18 : 12; 
        targetCameraX = isMobile ? 0 : 4; 
    } else if (targetId === 'roastery') { 
        targetCameraZ = isMobile ? 14 : 10; 
        targetCameraX = 0; 
    } else { 
        targetCameraZ = isMobile ? 20 : 15; 
        targetCameraX = isMobile ? 0 : -5; 
    }
}

// Shopping Cart & Bounce Animation
let cartItems = [];

function addToCart(btnElement, name, price) {
    const originalText = btnElement.innerText;
    btnElement.innerText = "Added!";
    btnElement.style.background = "#2a9d8f"; 
    btnElement.style.color = "#fff";
    
    setTimeout(() => {
        btnElement.innerText = originalText;
        btnElement.style.background = "var(--primary-color)";
        btnElement.style.color = document.documentElement.getAttribute('data-theme') === 'light' ? '#fff' : '#000';
    }, 1000);

    cartItems.push({ name, price });
    updateCartUI();
    
    // Trigger CSS Bounce
    const cartNavBtn = document.querySelector('.cart-toggle-btn');
    cartNavBtn.classList.remove('cart-pop'); 
    void cartNavBtn.offsetWidth; 
    cartNavBtn.classList.add('cart-pop');
}

function updateCartUI() {
    document.getElementById('cart-count').innerText = cartItems.length;
    const cartContainer = document.getElementById('cart-items');
    
    if (cartItems.length === 0) {
        cartContainer.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 2rem;">Your cart is empty.</p>`;
        document.getElementById('cart-total-price').innerText = "0.00";
        return;
    }

    let html = '';
    let total = 0;
    cartItems.forEach((item, index) => {
        total += item.price;
        html += `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p>$${item.price.toFixed(2)}</p>
                </div>
                <button style="background:transparent; border:none; color:red; cursor:pointer; font-size: 1.2rem;" onclick="removeFromCart(${index})">✕</button>
            </div>
        `;
    });
    cartContainer.innerHTML = html;
    document.getElementById('cart-total-price').innerText = total.toFixed(2);
}

function removeFromCart(index) {
    cartItems.splice(index, 1);
    updateCartUI();
}

function clearCart() {
    cartItems = [];
    updateCartUI();
}

function toggleCart() {
    document.getElementById('cart-sidebar').classList.toggle('open');
    document.getElementById('nav-links').classList.remove('open');
}

function checkoutFromCart() {
    if(cartItems.length === 0) return alert("Your cart is empty!");
    toggleCart();
    navigate('checkout');
}

// Checkout Tabs Switcher
function switchPayment(type) {
    document.querySelectorAll('.pay-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.pay-section').forEach(sec => sec.style.display = 'none');
    if(type === 'upi') {
        document.querySelectorAll('.pay-tab')[0].classList.add('active');
        document.getElementById('upi-section').style.display = 'block';
    } else {
        document.querySelectorAll('.pay-tab')[1].classList.add('active');
        document.getElementById('crypto-section').style.display = 'block';
    }
}

// Roastery Logic
const roastSlider = document.getElementById('roast-slider');
if(roastSlider) {
    const bean = document.getElementById('interactive-bean');
    const roastName = document.getElementById('roast-name');
    const roastDesc = document.getElementById('roast-desc');

    roastSlider.addEventListener('input', (e) => {
        const val = e.target.value;
        let r = Math.floor(164 - (val * 1.34));
        let g = Math.floor(178 - (val * 1.63));
        let b = Math.floor(140 - (val * 1.35));
        
        bean.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

        if (val < 25) {
            roastName.innerText = "Green Bean";
            roastDesc.innerText = "Raw, unroasted. Grassy and highly acidic.";
        } else if (val < 50) {
            roastName.innerText = "City Roast (Light)";
            roastDesc.innerText = "Bright acidity, floral notes, intact origin flavors.";
        } else if (val < 75) {
            roastName.innerText = "Full City (Medium)";
            roastDesc.innerText = "Balanced. Caramel sweetness with mild acidity.";
        } else {
            roastName.innerText = "French Roast (Dark)";
            roastDesc.innerText = "Bold, smoky, bittersweet chocolate notes. Low acidity.";
        }
    });
}

// Dark/Light Theme Switcher
let isLightMode = false;
function toggleTheme() {
    isLightMode = !isLightMode;
    document.documentElement.setAttribute('data-theme', isLightMode ? 'light' : 'dark');
    scene.background = new THREE.Color(isLightMode ? '#f5ebe0' : '#0d0a08');
    ambientLight.intensity = isLightMode ? 0.8 : 0.4;
    fillLight.intensity = isLightMode ? 1.2 : 0.8;
}

// ==========================================
// 2. THREE.JS 3D ENVIRONMENT SETUP
// ==========================================
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#0d0a08');

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(4, 3, 12);
let targetCameraZ = 12; let targetCameraX = 4;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const spotLight = new THREE.SpotLight(0xd4a373, 1.5);
spotLight.position.set(5, 10, 5);
spotLight.castShadow = true;
scene.add(spotLight);

const fillLight = new THREE.DirectionalLight(0x4a3b32, 0.8);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// ==========================================
// 3. PROCEDURAL 3D COFFEE CUP
// ==========================================
const coffeeGroup = new THREE.Group();
scene.add(coffeeGroup);

const ceramicMaterial = new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.1, roughness: 0.6 });
const cupGeo = new THREE.CylinderGeometry(2, 1.5, 4, 32);
const cup = new THREE.Mesh(cupGeo, ceramicMaterial);
cup.castShadow = true;
coffeeGroup.add(cup);

const handleGeo = new THREE.TorusGeometry(1.2, 0.25, 16, 50, Math.PI);
const handle = new THREE.Mesh(handleGeo, ceramicMaterial);
handle.position.set(2, 0, 0); handle.rotation.z = -Math.PI / 2;
coffeeGroup.add(handle);

const liquidGeo = new THREE.CylinderGeometry(1.9, 1.9, 0.1, 32);
const liquidMat = new THREE.MeshStandardMaterial({ color: 0x3d200b, roughness: 0.1 });
const liquid = new THREE.Mesh(liquidGeo, liquidMat);
liquid.position.y = 1.6; 
coffeeGroup.add(liquid);

coffeeGroup.position.y = -1;

// ==========================================
// 4. CAFFEINE OVERLOAD (Shake Physics)
// ==========================================
let isOverloaded = false;
let spilledDrops = [];

document.getElementById('shake-btn').addEventListener('click', triggerOverload);

function triggerOverload() {
    if(isOverloaded) return; 
    isOverloaded = true;
    
    document.body.classList.add('shake-active');

    setTimeout(() => {
        document.body.classList.remove('shake-active');
        isOverloaded = false;
        liquid.position.y = 1.6; 
    }, 4000);
}

// ==========================================
// 5. ANIMATION LOOP & RESIZE
// ==========================================
let mouseX = 0; let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
});

function animate() {
    requestAnimationFrame(animate);

    camera.position.z += (targetCameraZ - camera.position.z) * 0.05;
    camera.position.x += (targetCameraX - camera.position.x) * 0.05;
    camera.lookAt(0, 0, 0);

    // Mouse Parallax Tilt
    coffeeGroup.rotation.y += 0.05 * (mouseX * 0.002 - coffeeGroup.rotation.y);
    coffeeGroup.rotation.x += 0.05 * (mouseY * 0.002 - coffeeGroup.rotation.x);
    coffeeGroup.rotation.y += 0.002; 

    // Caffeine Overload Particle Engine
    if (isOverloaded) {
        if (liquid.position.y < 2.05) liquid.position.y += 0.02;

        let dropGeo = new THREE.SphereGeometry(Math.random() * 0.15 + 0.05);
        let drop = new THREE.Mesh(dropGeo, liquidMat);
        
        drop.position.set(
            (Math.random() - 0.5) * 3.8, 
            1, 
            (Math.random() - 0.5) * 3.8  
        );
        
        drop.userData = {
            vY: Math.random() * 0.2 + 0.1, 
            vX: (Math.random() - 0.5) * 0.2, 
            vZ: (Math.random() - 0.5) * 0.2
        };
        
        coffeeGroup.add(drop);
        spilledDrops.push(drop);
    }

    // Drop Gravity Physics
    for (let i = spilledDrops.length - 1; i >= 0; i--) {
        let d = spilledDrops[i];
        d.position.x += d.userData.vX;
        d.position.z += d.userData.vZ;
        d.position.y += d.userData.vY;
        d.userData.vY -= 0.02; 

        if (d.position.y < -10) {
            coffeeGroup.remove(d);
            spilledDrops.splice(i, 1);
        }
    }

    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update responsive camera positioning if resized dynamically
    const currentActive = document.querySelector('.page-section.active').id;
    navigate(currentActive);
});

// Init layout on load
window.addEventListener('DOMContentLoaded', () => {
    navigate('home');
});