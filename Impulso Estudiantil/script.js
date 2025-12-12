// Checkbox
let isChecked = false;
function toggleCheckbox() {
    isChecked = !isChecked;
    const checkbox = document.getElementById('checkbox');
    if (isChecked) {
        checkbox.classList.add('checked');
    } else {
        checkbox.classList.remove('checked');
    }
}

// Mostrar formulario de recuperación de contraseña
function showForgotPassword(event) {
    event.preventDefault();
    
    // Ocultar formulario de login
    document.getElementById('loginForm').style.display = 'none';
    
    // Mostrar formulario de recuperación
    document.getElementById('forgotPasswordForm').style.display = 'block';
    
    // Cambiar título y subtítulo
    document.getElementById('mainTitle').textContent = 'Recupera tu Cuenta';
    document.getElementById('mainSubtitle').textContent = 'Ingresa el correo electrónico asociado a tu cuenta para restablecer tu contraseña';
}

// Volver al formulario de login
function showLogin(event) {
    event.preventDefault();
    
    // Mostrar formulario de login
    document.getElementById('loginForm').style.display = 'block';
    
    // Ocultar formulario de recuperación
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    // Restaurar título y subtítulo
    document.getElementById('mainTitle').textContent = 'Inicio de Sesion';
    document.getElementById('mainSubtitle').textContent = 'Accede a tu cuenta para gestionar tus solicitudes de beca';
    
    // Limpiar campo de email
    document.getElementById('recoveryEmail').value = '';
}

// ========================================
// SISTEMA DE USUARIOS CON ROLES
// ========================================

// Lista de usuarios administradores
const adminUsers = {
    'admin': {
        name: 'Administrador Principal',
        email: 'admin@tecnm.mx',
        password: 'admin2025',
        role: 'admin'
    },
    'admin01': {
        name: 'Coordinador de Becas',
        email: 'coord.becas@tecnm.mx',
        password: 'coord2025',
        role: 'admin'
    }
};

// Lista de números de control de estudiantes registrados
const registeredStudents = {
    '20401234': {
        name: 'Juan Carlos Pérez González',
        email: 'juan.perez@tecnm.mx',
        role: 'student'
    },
    '20401235': {
        name: 'María López Hernández',
        email: 'maria.lopez@tecnm.mx',
        role: 'student'
    },
    '20401236': {
        name: 'Carlos Ramírez Torres',
        email: 'carlos.ramirez@tecnm.mx',
        role: 'student'
    }
};

// Inicializar contraseña por defecto para cada estudiante si no existe
Object.keys(registeredStudents).forEach(controlNumber => {
    const passwordKey = `userPassword_${controlNumber}`;
    if (!localStorage.getItem(passwordKey)) {
        localStorage.setItem(passwordKey, 'tecnm2025');
    }
});

console.log('✓ Sistema de roles inicializado');
console.log('✓ Usuarios estudiantes con contraseña por defecto: tecnm2025');
console.log('✓ Usuarios admin registrados:', Object.keys(adminUsers).length);

// Form submit de login
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    
    console.log('Intentando iniciar sesión...');
    console.log('Usuario:', username);
    console.log('Recordar sesión:', isChecked);
    
    // Validar campos vacíos
    if (!username || !password) {
        showLoginNotification('Por favor completa todos los campos', 'error');
        return;
    }
    
    // VERIFICAR SI ES USUARIO ADMINISTRADOR
    if (adminUsers[username]) {
        const admin = adminUsers[username];
        
        // Validar contraseña de admin
        if (password !== admin.password) {
            showLoginNotification('Contraseña incorrecta', 'error');
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
            return;
        }
        
        // Credenciales de admin válidas
        console.log('✓ Administrador autenticado:', admin.name);
        
        // Guardar estado de autenticación de admin
        sessionStorage.setItem('isAuthenticated', 'true');
        sessionStorage.setItem('userRole', 'admin');
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('adminName', admin.name);
        sessionStorage.setItem('adminEmail', admin.email);
        
        // Si marca "Recordar sesión"
        if (isChecked) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('savedUsername', username);
            localStorage.setItem('savedRole', 'admin');
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('savedUsername');
            localStorage.removeItem('savedRole');
        }
        
        showLoginNotification(`¡Bienvenido ${admin.name}! Accediendo al panel de administración...`, 'success');
        
        // Redirigir al dashboard de admin
        setTimeout(() => {
            window.location.href = 'admin-dashboard.html';
        }, 1500);
        
        return;
    }
    
    // VERIFICAR SI ES ESTUDIANTE
    
    // Validar formato de número de control (8 dígitos)
    const controlNumberRegex = /^\d{8}$/;
    if (!controlNumberRegex.test(username)) {
        showLoginNotification('El número de control debe tener 8 dígitos o ser un usuario válido', 'error');
        document.getElementById('login').focus();
        return;
    }
    
    // Obtener estudiantes desde localStorage (incluyendo los creados por admin)
    const studentsData = localStorage.getItem('tecnm_students');
    const dynamicStudents = studentsData ? JSON.parse(studentsData) : {};
    
    // Combinar estudiantes predefinidos con los dinámicos
    const allStudents = { ...registeredStudents, ...dynamicStudents };
    
    // Verificar si el número de control está registrado
    if (!allStudents[username]) {
        showLoginNotification('Número de control no registrado', 'error');
        document.getElementById('login').value = '';
        document.getElementById('login').focus();
        return;
    }
    
    // Obtener contraseña guardada para este estudiante
    const passwordKey = `userPassword_${username}`;
    const savedPassword = localStorage.getItem(passwordKey) || 'tecnm2025';
    
    // Validar contraseña de estudiante
    if (password !== savedPassword) {
        showLoginNotification('Contraseña incorrecta', 'error');
        document.getElementById('password').value = '';
        document.getElementById('password').focus();
        return;
    }
    
    // Credenciales de estudiante válidas
    console.log('✓ Estudiante autenticado');
    const studentInfo = allStudents[username];
    
    // Guardar estado de autenticación de estudiante
    sessionStorage.setItem('isAuthenticated', 'true');
    sessionStorage.setItem('userRole', 'student');
    sessionStorage.setItem('username', username);
    sessionStorage.setItem('studentName', studentInfo.name);
    
    // Buscar el email del estudiante
    let studentEmail = studentInfo.email;
    
    // Si no existe en el objeto, buscar en localStorage
    if (!studentEmail || studentEmail === 'undefined') {
        const emailKey = `userEmail_${username}`;
        studentEmail = localStorage.getItem(emailKey);
    }
    
    // Guardar email en sessionStorage
    if (studentEmail && studentEmail !== 'undefined') {
        sessionStorage.setItem('studentEmail', studentEmail);
        console.log(`✓ Email cargado: ${studentEmail}`);
    } else {
        sessionStorage.setItem('studentEmail', '');
        console.log('⚠️ No se encontró email para este usuario');
    }
    
    // Si marca "Recordar sesión"
    if (isChecked) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedUsername', username);
        localStorage.setItem('savedRole', 'student');
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedUsername');
        localStorage.removeItem('savedRole');
    }
    
    showLoginNotification(`¡Bienvenido ${studentInfo.name}! Redirigiendo...`, 'success');
    
    // Redirigir al dashboard de estudiante
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
});

// Form submit de recuperación de contraseña
document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value.trim();
    
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
        showLoginNotification('Por favor ingresa tu correo electrónico', 'error');
        return;
    }
    
    if (!emailRegex.test(email)) {
        showLoginNotification('Por favor ingresa un correo válido', 'error');
        return;
    }
    
    // Verificar si el correo está registrado (estudiantes o admins)
    const studentFound = Object.entries(registeredStudents).find(
        ([_, student]) => student.email === email
    );
    
    const adminFound = Object.entries(adminUsers).find(
        ([_, admin]) => admin.email === email
    );
    
    if (!studentFound && !adminFound) {
        showLoginNotification('Correo electrónico no registrado', 'error');
        return;
    }
    
    console.log('Enviando instrucciones de recuperación a:', email);
    
    showLoginNotification(`Instrucciones enviadas a ${email}`, 'success');
    
    // Volver automáticamente al login después de enviar
    setTimeout(() => {
        showLogin(e);
    }, 2000);
});

// Sistema de notificaciones para login
function showLoginNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `login-notification ${type}`;
    notification.textContent = message;
    
    // Estilos
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = '500';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notification.style.animation = 'slideInRight 0.3s ease-out';
    notification.style.minWidth = '300px';
    notification.style.maxWidth = '400px';
    
    if (type === 'success') {
        notification.style.background = '#2e7d32';
    } else if (type === 'error') {
        notification.style.background = '#c62828';
    } else if (type === 'info') {
        notification.style.background = '#19326c';
    }
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cargar usuario guardado si existe "Recordar sesión"
window.addEventListener('load', function() {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedUsername = localStorage.getItem('savedUsername');
    
    if (rememberMe === 'true' && savedUsername) {
        document.getElementById('login').value = savedUsername;
        isChecked = true;
        const checkbox = document.getElementById('checkbox');
        checkbox.classList.add('checked');
        console.log('✓ Usuario recordado cargado');
    }
});

// Mostrar información en consola
console.log('╔════════════════════════════════════════╗');
console.log('║   TECNM | IMPULSO ESTUDIANTIL         ║');
console.log('╚════════════════════════════════════════╝');
console.log('\n📋 USUARIOS ADMINISTRADORES:');
Object.entries(adminUsers).forEach(([username, admin]) => {
    console.log(`  👤 ${username} - ${admin.name}`);
    console.log(`     🔑 Contraseña: ${admin.password}`);
});
console.log('\n📋 ESTUDIANTES PREDEFINIDOS:');
Object.entries(registeredStudents).forEach(([controlNumber, student]) => {
    console.log(`  🎓 ${controlNumber} - ${student.name}`);
});

// Mostrar estudiantes dinámicos si existen
const studentsData = localStorage.getItem('tecnm_students');
if (studentsData) {
    const dynamicStudents = JSON.parse(studentsData);
    const dynamicCount = Object.keys(dynamicStudents).length;
    if (dynamicCount > 0) {
        console.log('\n📋 ESTUDIANTES REGISTRADOS POR ADMIN:');
        Object.entries(dynamicStudents).forEach(([controlNumber, student]) => {
            console.log(`  🎓 ${controlNumber} - ${student.name}`);
        });
    }
}

console.log('\n🔐 Contraseña por defecto para estudiantes: tecnm2025');
console.log('⚙️  Puedes cambiar tu contraseña en Ajustes > Cambiar Contraseña');
console.log('💡 Los administradores pueden registrar nuevos estudiantes');
console.log('════════════════════════════════════════════\n');