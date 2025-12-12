// Verificar si el usuario está autenticado
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard TECNM cargado correctamente');
    
    // Verificar autenticación
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
        console.log('⚠️ Usuario no autenticado, redirigiendo al login...');
        window.location.href = 'Login.html';
        return;
    }
    
    initializeDashboard();
});

// ========================================
// AGREGAR AL ARCHIVO dashboard.js (Estudiantes)
// ========================================

// Modificar la función initializeDashboard() para incluir loadBecasForStudents
function initializeDashboard() {
    setupNavigation();
    setupNotificationButton();
    setupNotificationTabs();
    generateFilterTabs();
    setupApproveButtons();
    setupRejectButtons();
    setupFilterTabs();
    setupSearchBar();
    setupLogout();
    updateStatistics();
    updateNotificationBadge();
    setupDarkMode();
    loadUserInfo();
    setupEmailSettings();
    setupPasswordSettings();
    setupDocumentUpload();
    setupSolicitudModal();
    
    // NUEVO: Cargar becas disponibles
    loadBecasForStudents();
}

// ========================================
// CARGAR BECAS PARA ESTUDIANTES - NUEVO
// ========================================

function loadBecasForStudents() {
    console.log('🎓 Cargando becas disponibles...');
    
    const becas = getBecasFromLocalStorage();
    const becasList = Object.entries(becas);
    
    // Filtrar solo becas abiertas
    const becasAbiertas = becasList.filter(([id, beca]) => {
        const estado = getBecaEstadoStudent(beca.fechaApertura, beca.fechaCierre);
        return estado.class === 'abierta';
    });
    
    const ordersGrid = document.getElementById('ordersGrid');
    const emptyState = document.getElementById('emptyStateHome');
    
    if (!ordersGrid || !emptyState) {
        console.error('❌ No se encontraron elementos del DOM para mostrar becas');
        return;
    }
    
    if (becasAbiertas.length === 0) {
        ordersGrid.style.display = 'none';
        emptyState.style.display = 'flex';
        console.log('ℹ️ No hay becas abiertas actualmente');
        return;
    }
    
    // Ocultar estado vacío y mostrar grid
    emptyState.style.display = 'none';
    ordersGrid.style.display = 'grid';
    
    // Limpiar grid
    ordersGrid.innerHTML = '';
    
    // Crear tarjetas de becas
    becasAbiertas.forEach(([becaId, beca]) => {
        const card = createBecaCard(becaId, beca);
        ordersGrid.appendChild(card);
    });
    
    console.log(`✅ ${becasAbiertas.length} becas abiertas mostradas`);
    
    // Actualizar filtros dinámicos
    generateFilterTabsForBecas(becasAbiertas);
}

function getBecasFromLocalStorage() {
    const becasData = localStorage.getItem('tecnm_becas');
    return becasData ? JSON.parse(becasData) : {};
}

function getBecaEstadoStudent(fechaApertura, fechaCierre) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const apertura = new Date(fechaApertura + 'T00:00:00');
    const cierre = new Date(fechaCierre + 'T00:00:00');
    
    if (hoy < apertura) {
        return { text: 'Próximamente', class: 'proxima' };
    } else if (hoy >= apertura && hoy <= cierre) {
        return { text: 'Abierta', class: 'abierta' };
    } else {
        return { text: 'Cerrada', class: 'cerrada' };
    }
}

// ========================================
// REEMPLAZAR LA FUNCIÓN createBecaCard EN dashboard.js
// ========================================

function createBecaCard(becaId, beca) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.setAttribute('data-beca-id', becaId);
    
    const estado = getBecaEstadoStudent(beca.fechaApertura, beca.fechaCierre);
    const diasRestantes = calcularDiasRestantes(beca.fechaCierre);
    
    // Obtener usuario actual
    const controlNumber = sessionStorage.getItem('username') || '20401234';
    const studentName = sessionStorage.getItem('studentName') || 'Estudiante';
    const inicial = studentName.split(' ')[0][0] + (studentName.split(' ')[1] ? studentName.split(' ')[1][0] : '');
    
    // Verificar si el estudiante ya aplicó
    const aplicaciones = getBecaAplicacionesFromStorage(becaId);
    const yaAplico = aplicaciones.includes(controlNumber);
    
    // Nombres de documentos
    const nombresDocumentos = {
        'acta-nacimiento': 'Acta de Nacimiento',
        'curp': 'CURP',
        'identificacion': 'Identificación Oficial',
        'comprobante-domicilio': 'Comprobante de Domicilio',
        'fotografia': 'Fotografía',
        'cuenta-bancaria': 'Cuenta Bancaria'
    };
    
    card.innerHTML = `
        <div class="order-header">
            <div>
                <h3>${beca.nombre}</h3>
                <p class="order-date">Cierra: ${formatDateStudent(beca.fechaCierre)} (${diasRestantes})</p>
            </div>
            <div class="user-badge" style="background: #e8f5e9;">
                <div class="user-initial" style="background: #667eea;">${inicial}</div>
            </div>
        </div>
        <div class="order-items">
            <div class="order-item" style="display: block; padding: 15px; background: #f8f9fc; border-radius: 8px; border: none;">
                <div style="margin-bottom: 10px;">
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📋 Descripción:</h4>
                    <p style="color: #5c6f8c; font-size: 13px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${beca.descripcion}</p>
                </div>
                <div style="margin-bottom: 10px;">
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">🎯 Objetivo:</h4>
                    <p style="color: #5c6f8c; font-size: 13px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${beca.objetivo}</p>
                </div>
                <div>
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📄 Documentos Requeridos:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${beca.documentos.slice(0, 3).map(doc => `
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: white; border: 1px solid #e8eef5; border-radius: 6px; font-size: 12px; color: #5c6f8c;">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                </svg>
                                ${nombresDocumentos[doc]}
                            </span>
                        `).join('')}
                        ${beca.documentos.length > 3 ? `
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #667eea; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                +${beca.documentos.length - 3} más
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e8eef5; text-align: center;">
                    <p style="color: #667eea; font-size: 13px; font-weight: 600; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        Haz clic para ver más detalles
                    </p>
                </div>
            </div>
        </div>
        <div class="order-footer">
            <span class="order-requirements">${beca.documentos.length} documento(s) requerido(s)</span>
            <div class="order-actions">
                ${yaAplico ? 
                    '<button class="btn-status completed" style="cursor: default;">YA APLICASTE</button>' :
                    `<button class="btn-approve" onclick="event.stopPropagation(); aplicarABeca('${becaId}')">Aplicar</button>`
                }
            </div>
        </div>
    `;
    
    // Hacer la tarjeta clickeable para ver más detalles
    card.style.cursor = 'pointer';
    card.style.transition = 'all 0.3s ease';
    
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
        this.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    });
    
    card.addEventListener('click', function(e) {
        // No abrir modal si se hace clic en el botón de aplicar o en el estado
        if (!e.target.closest('.btn-approve') && !e.target.closest('.btn-status')) {
            console.log('🖱️ Clic en tarjeta de beca:', beca.nombre);
            showBecaDetailsForStudent(becaId, beca);
        }
    });
    
    return card;
}
function calcularDiasRestantes(fechaCierre) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const cierre = new Date(fechaCierre + 'T00:00:00');
    const diferencia = cierre - hoy;
    const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    
    if (dias < 0) {
        return 'Convocatoria cerrada';
    } else if (dias === 0) {
        return '¡Último día!';
    } else if (dias === 1) {
        return '1 día restante';
    } else if (dias <= 7) {
        return `${dias} días restantes ⚠️`;
    } else {
        return `${dias} días restantes`;
    }
}

function formatDateStudent(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-MX', options);
}

function generateFilterTabsForBecas(becasAbiertas) {
    const filterTabsContainer = document.getElementById('filterTabsContainer');
    
    if (!filterTabsContainer || becasAbiertas.length <= 3) {
        if (filterTabsContainer) filterTabsContainer.style.display = 'none';
        return;
    }
    
    filterTabsContainer.style.display = 'flex';
    filterTabsContainer.innerHTML = '';
    
    becasAbiertas.forEach(([id, beca], index) => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab' + (index === 0 ? ' active' : '');
        tab.textContent = beca.nombre.length > 30 ? beca.nombre.substring(0, 30) + '...' : beca.nombre;
        tab.setAttribute('data-beca-filter', id);
        
        tab.addEventListener('click', function() {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.order-card').forEach(card => {
                if (card.getAttribute('data-beca-id') === id) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
        
        filterTabsContainer.appendChild(tab);
    });
    
    console.log(`✓ ${becasAbiertas.length} pestañas de filtro generadas`);
}

// ========================================
// APLICAR A BECA
// ========================================

function aplicarABeca(becaId) {
    const becas = getBecasFromLocalStorage();
    const beca = becas[becaId];
    
    if (!beca) {
        showNotification('Beca no encontrada', 'error');
        return;
    }
    
    const controlNumber = sessionStorage.getItem('username');
    const studentName = sessionStorage.getItem('studentName');
    
    if (!controlNumber) {
        showNotification('Error: Usuario no identificado', 'error');
        return;
    }
    
    // Verificar documentos requeridos
    const documentosFaltantes = verificarDocumentosRequeridos(beca.documentos, controlNumber);
    
    if (documentosFaltantes.length > 0) {
        const nombresDocumentos = {
            'acta-nacimiento': 'Acta de Nacimiento',
            'curp': 'CURP',
            'identificacion': 'Identificación Oficial',
            'comprobante-domicilio': 'Comprobante de Domicilio',
            'fotografia': 'Fotografía',
            'cuenta-bancaria': 'Cuenta Bancaria'
        };
        
        const listaDocs = documentosFaltantes.map(doc => nombresDocumentos[doc]).join(', ');
        
        showNotification(
            `⚠️ Te faltan subir los siguientes documentos: ${listaDocs}. Por favor, ve a la sección de Documentos.`,
            'error'
        );
        return;
    }
    
    if (confirm(`¿Estás seguro de aplicar a la beca "${beca.nombre}"?\n\nSe enviará tu solicitud con los documentos requeridos.`)) {
        // Registrar aplicación
        const aplicaciones = getBecaAplicacionesFromStorage(becaId);
        if (!aplicaciones.includes(controlNumber)) {
            aplicaciones.push(controlNumber);
            saveBecaAplicacionesFromStorage(becaId, aplicaciones);
        }
        
        // Registrar solicitud
        registrarSolicitudBeca(becaId, beca, controlNumber, studentName);
        
        showNotification(`✅ ¡Aplicación exitosa a "${beca.nombre}"!`, 'success');
        
        // Recargar becas
        loadBecasForStudents();
        
        console.log(`✓ Aplicación registrada: ${studentName} -> ${beca.nombre}`);
    }
}

function verificarDocumentosRequeridos(documentosRequeridos, controlNumber) {
    const faltantes = [];
    
    documentosRequeridos.forEach(doc => {
        const storageKey = `document_${controlNumber}_${doc}`;
        if (!localStorage.getItem(storageKey)) {
            faltantes.push(doc);
        }
    });
    
    return faltantes;
}

function getBecaAplicacionesFromStorage(becaId) {
    const key = `beca_aplicaciones_${becaId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function saveBecaAplicacionesFromStorage(becaId, aplicaciones) {
    const key = `beca_aplicaciones_${becaId}`;
    localStorage.setItem(key, JSON.stringify(aplicaciones));
}

function registrarSolicitudBeca(becaId, beca, controlNumber, studentName) {
    const solicitudes = getSolicitudesFromStorage();
    const solicitudId = `solicitud_${Date.now()}`;
    
    solicitudes[solicitudId] = {
        becaId: becaId,
        becaNombre: beca.nombre,
        estudianteId: controlNumber,
        estudianteNombre: studentName,
        fecha: new Date().toISOString(),
        estado: 'pendiente', // pendiente, aprobada, rechazada
        documentos: beca.documentos
    };
    
    localStorage.setItem('tecnm_solicitudes', JSON.stringify(solicitudes));
}

function getSolicitudesFromStorage() {
    const data = localStorage.getItem('tecnm_solicitudes');
    return data ? JSON.parse(data) : {};
}

function showBecaDetailsForStudent(becaId, beca) {
    // Aquí puedes crear un modal de detalles si lo deseas
    console.log('Ver detalles de:', beca.nombre);
}

// Hacer función global
window.aplicarABeca = aplicarABeca;

console.log('✅ Sistema de visualización de becas para estudiantes cargado');

// ========================================
// NAVEGACIÓN DEL SIDEBAR
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionName = this.getAttribute('data-section');
            
            // Remover active de todos los nav-items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Agregar active al nav-item clickeado
            this.classList.add('active');
            
            // Cambiar sección de contenido
            changeSection(sectionName);
        });
    });
}

function changeSection(sectionName) {
    // Ocultar todas las secciones
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        console.log(`Cambiando a sección: ${sectionName.toUpperCase()}`);
        showNotification(`Navegando a ${getSectionTitle(sectionName)}`, 'info');
    }
}

function getSectionTitle(sectionName) {
    const titles = {
        'home': 'Inicio',
        'becas': 'Becas',
        'mensajes': 'Mensajes',
        'calendario': 'Calendario',
        'documentos': 'Documentos',
        'ajustes': 'Ajustes'
    };
    return titles[sectionName] || sectionName;
}

// ========================================
// GESTIÓN DE SOLICITUDES
// ========================================

function approveOrder(orderId) {
    if (confirm(`¿Estás seguro de aprobar la ${orderId}?\n\nEsta acción otorgará los beneficios solicitados al estudiante.`)) {
        console.log(`${orderId} aprobada`);
        
        // Encontrar la card y cambiar su estado
        const card = event.target.closest('.order-card');
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('approved');
            status.textContent = 'Aprobado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de completada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status completed';
        statusBtn.textContent = 'COMPLETADA';
        footer.appendChild(statusBtn);
        
        // Mostrar notificación
        showNotification(`${orderId} aprobada exitosamente`, 'success');
        
        // Actualizar estadísticas
        updateStatistics();
    }
}

function rejectOrder(orderId) {
    const reason = prompt(`¿Por qué deseas rechazar la ${orderId}?\n\nEscribe el motivo:`);
    
    if (reason !== null && reason.trim() !== '') {
        console.log(`${orderId} rechazada. Motivo: ${reason}`);
        
        // Encontrar la card y cambiar su estado
        const card = event.target.closest('.order-card');
        const footer = card.querySelector('.order-footer');
        
        // Actualizar estados de los items
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('rejected');
            status.textContent = 'Rechazado';
        });
        
        // Remover botones de acción
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        // Agregar estado de rechazada
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status rejected';
        statusBtn.textContent = 'RECHAZADA';
        statusBtn.title = `Motivo: ${reason}`;
        footer.appendChild(statusBtn);
        
        // Mostrar notificación
        showNotification(`${orderId} rechazada`, 'error');
        
        // Actualizar estadísticas
        updateStatistics();
    } else if (reason !== null) {
        alert('Debes proporcionar un motivo para rechazar la solicitud.');
    }
}

function setupApproveButtons() {
    const approveButtons = document.querySelectorAll('.btn-approve');
    approveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.order-card');
            const orderTitle = card.querySelector('h3').textContent;
            approveOrder(orderTitle);
        });
    });
}

function setupRejectButtons() {
    const rejectButtons = document.querySelectorAll('.btn-reject');
    rejectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.order-card');
            const orderTitle = card.querySelector('h3').textContent;
            rejectOrder(orderTitle);
        });
    });
}

// ========================================
// SISTEMA DE NOTIFICACIONES MEJORADO
// ========================================

function setupNotificationButton() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationsPanel = document.getElementById('notificationsPanel');

    if (notificationBtn && notificationsPanel) {
        notificationBtn.addEventListener('click', function(event) {
            event.stopPropagation();
            notificationsPanel.classList.toggle('active');
        });

        // Cierra el panel si haces clic fuera
        document.addEventListener('click', function(event) {
            if (!notificationsPanel.contains(event.target) && !notificationBtn.contains(event.target)) {
                notificationsPanel.classList.remove('active');
            }
        });
    }
}

function setupNotificationTabs() {
    const tabBtns = document.querySelectorAll('.notifications-tabs .tab-btn');
    const notificationItems = document.querySelectorAll('.notification-item');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos los tabs
            tabBtns.forEach(tab => tab.classList.remove('active'));
            
            // Agregar active al tab clickeado
            this.classList.add('active');
            
            const tabText = this.textContent.trim();
            
            // Filtrar notificaciones
            if (tabText === 'Todas') {
                // Mostrar todas las notificaciones
                notificationItems.forEach(item => {
                    item.style.display = 'flex';
                });
                
                // Mostrar todas las secciones
                document.querySelectorAll('.notifications-section').forEach(section => {
                    section.style.display = 'block';
                });
                
                console.log('Mostrando todas las notificaciones');
            } else if (tabText === 'No leídas') {
                // Mostrar solo no leídas
                let hasUnread = false;
                
                notificationItems.forEach(item => {
                    if (item.classList.contains('unread')) {
                        item.style.display = 'flex';
                        hasUnread = true;
                    } else {
                        item.style.display = 'none';
                    }
                });
                
                // Ocultar secciones sin notificaciones no leídas
                document.querySelectorAll('.notifications-section').forEach(section => {
                    const unreadInSection = section.querySelectorAll('.notification-item.unread:not([style*="display: none"])');
                    if (unreadInSection.length === 0) {
                        section.style.display = 'none';
                    } else {
                        section.style.display = 'block';
                    }
                });
                
                // Si no hay notificaciones no leídas, mostrar mensaje
                if (!hasUnread) {
                    showNotification('¡Genial! No tienes notificaciones sin leer', 'success');
                } else {
                    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
                    console.log(`Mostrando ${unreadCount} notificaciones no leídas`);
                }
            }
        });
    });
    
    // Funcionalidad para marcar como leída al hacer clic en el punto azul
    const unreadIndicators = document.querySelectorAll('.unread-indicator');
    unreadIndicators.forEach(indicator => {
        indicator.addEventListener('click', function(e) {
            e.stopPropagation();
            const notificationItem = this.closest('.notification-item');
            
            if (notificationItem.classList.contains('unread')) {
                // Marcar como leída con animación
                notificationItem.style.transition = 'all 0.3s ease';
                notificationItem.classList.remove('unread');
                this.style.animation = 'fadeOut 0.3s ease';
                
                setTimeout(() => {
                    this.remove();
                    updateNotificationBadge();
                    
                    // Si estamos en el tab "No leídas", actualizar vista
                    const activeTab = document.querySelector('.notifications-tabs .tab-btn.active');
                    if (activeTab && activeTab.textContent.trim() === 'No leídas') {
                        // Si ya no tiene la clase unread, ocultarla en el filtro
                        notificationItem.style.display = 'none';
                        
                        // Verificar si la sección quedó vacía
                        const section = notificationItem.closest('.notifications-section');
                        const visibleUnread = section.querySelectorAll('.notification-item.unread:not([style*="display: none"])');
                        if (visibleUnread.length === 0) {
                            section.style.display = 'none';
                        }
                        
                        // Verificar si ya no quedan notificaciones no leídas
                        const remainingUnread = document.querySelectorAll('.notification-item.unread').length;
                        if (remainingUnread === 0) {
                            showNotification('¡Todas las notificaciones están leídas!', 'success');
                        }
                    }
                }, 300);
                
                showNotification('Notificación marcada como leída', 'info');
            }
        });
    });
    
    // Agregar funcionalidad al botón de opciones para marcar todas como leídas
    const optionsBtn = document.querySelector('.options-btn');
    if (optionsBtn) {
        optionsBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const unreadCount = document.querySelectorAll('.notification-item.unread').length;
            
            if (unreadCount === 0) {
                showNotification('No hay notificaciones sin leer', 'info');
                return;
            }
            
            if (confirm(`¿Marcar todas las notificaciones (${unreadCount}) como leídas?`)) {
                const unreadItems = document.querySelectorAll('.notification-item.unread');
                
                unreadItems.forEach((item, index) => {
                    setTimeout(() => {
                        item.classList.remove('unread');
                        const indicator = item.querySelector('.unread-indicator');
                        if (indicator) {
                            indicator.remove();
                        }
                    }, index * 50);
                });
                
                setTimeout(() => {
                    updateNotificationBadge();
                    showNotification('Todas las notificaciones marcadas como leídas', 'success');
                    
                    // Si estamos en "No leídas", volver a "Todas"
                    const activeTab = document.querySelector('.notifications-tabs .tab-btn.active');
                    if (activeTab && activeTab.textContent.trim() === 'No leídas') {
                        document.querySelector('.notifications-tabs .tab-btn').click();
                    }
                }, unreadCount * 50 + 100);
            }
        });
    }
}

function updateNotificationBadge() {
    const badge = document.querySelector('.notification-badge');
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
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
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.style.minWidth = '300px';
    
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
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Agregar estilos de animación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
`;
document.head.appendChild(style);

// ========================================
// FILTROS Y BÚSQUEDA
// ========================================

function generateFilterTabs() {
    const orderCards = document.querySelectorAll('.order-card');
    const filterTabsContainer = document.getElementById('filterTabsContainer');
    
    if (!filterTabsContainer || orderCards.length === 0) {
        console.log('No hay solicitudes para generar pestañas');
        return;
    }
    
    // Extraer los números de solicitud únicos
    const solicitudNumbers = new Set();
    orderCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        // Extraer el número de la solicitud (#351, #350, etc.)
        const match = title.match(/#(\d+)/);
        if (match) {
            solicitudNumbers.add(match[0]);
        }
    });
    
    // Convertir a array y ordenar
    const sortedNumbers = Array.from(solicitudNumbers).sort((a, b) => {
        const numA = parseInt(a.replace('#', ''));
        const numB = parseInt(b.replace('#', ''));
        return numB - numA;
    });
    
    // Limpiar contenedor
    filterTabsContainer.innerHTML = '';
    
    // Si solo hay 1-3 solicitudes, no mostrar pestañas
    if (sortedNumbers.length <= 3) {
        console.log(`Solo hay ${sortedNumbers.length} solicitud(es), no se necesitan pestañas de filtro`);
        filterTabsContainer.style.display = 'none';
        return;
    }
    
    // Mostrar el contenedor si hay más de 3 solicitudes
    filterTabsContainer.style.display = 'flex';
    
    // Crear pestañas dinámicamente
    sortedNumbers.forEach((number, index) => {
        const tab = document.createElement('button');
        tab.className = 'filter-tab';
        tab.textContent = number;
        
        if (index === 0) {
            tab.classList.add('active');
        }
        
        filterTabsContainer.appendChild(tab);
    });
    
    console.log(`✓ Generadas ${sortedNumbers.length} pestañas de filtro:`, sortedNumbers.join(', '));
}

function setupFilterTabs() {
    const filterTabsContainer = document.getElementById('filterTabsContainer');
    
    if (!filterTabsContainer) {
        return;
    }
    
    filterTabsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('filter-tab')) {
            const allTabs = filterTabsContainer.querySelectorAll('.filter-tab');
            allTabs.forEach(t => t.classList.remove('active'));
            
            e.target.classList.add('active');
            
            const filterNumber = e.target.textContent.trim();
            console.log(`Filtrando por: ${filterNumber}`);
            
            filterOrders(filterNumber);
        }
    });
}

function filterOrders(filterNumber) {
    const cards = document.querySelectorAll('.order-card');
    let visibleCount = 0;
    
    if (!filterNumber || filterNumber === '') {
        cards.forEach(card => {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
        });
        showNotification(`Mostrando todas las solicitudes (${cards.length})`, 'info');
        return;
    }
    
    cards.forEach(card => {
        const orderTitle = card.querySelector('h3').textContent;
        
        if (orderTitle.includes(filterNumber)) {
            card.style.display = 'block';
            card.style.animation = 'fadeIn 0.3s ease-out';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    if (visibleCount === 0) {
        cards.forEach(card => {
            card.style.display = 'block';
        });
        showNotification(`No se encontró la solicitud ${filterNumber}. Mostrando todas`, 'info');
    } else {
        showNotification(`Mostrando ${visibleCount} solicitud(es)`, 'info');
    }
}

function setupSearchBar() {
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.order-card');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const orderTitle = card.querySelector('h3').textContent.toLowerCase();
                const itemTitles = Array.from(card.querySelectorAll('.item-details h4'))
                    .map(h4 => h4.textContent.toLowerCase())
                    .join(' ');
                const itemDescriptions = Array.from(card.querySelectorAll('.item-details p'))
                    .map(p => p.textContent.toLowerCase())
                    .join(' ');
                
                if (orderTitle.includes(searchTerm) || 
                    itemTitles.includes(searchTerm) || 
                    itemDescriptions.includes(searchTerm)) {
                    card.style.display = 'block';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            if (searchTerm !== '') {
                const filterTabsContainer = document.getElementById('filterTabsContainer');
                if (filterTabsContainer) {
                    filterTabsContainer.querySelectorAll('.filter-tab').forEach(tab => {
                        tab.classList.remove('active');
                    });
                }
            } else {
                const filterTabsContainer = document.getElementById('filterTabsContainer');
                if (filterTabsContainer) {
                    const firstTab = filterTabsContainer.querySelector('.filter-tab');
                    if (firstTab) {
                        firstTab.classList.add('active');
                    }
                }
                cards.forEach(card => {
                    card.style.display = 'block';
                });
            }
        });
    }
}

// ========================================
// OTROS CONTROLES
// ========================================

function setupLogout() {
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                console.log('Cerrando sesión...');
                
                // Limpiar sesión
                sessionStorage.removeItem('isAuthenticated');
                sessionStorage.removeItem('username');
                
                showNotification('Cerrando sesión...', 'info');
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 1000);
            }
        });
    }
}

function updateStatistics() {
    const cards = document.querySelectorAll('.order-card');
    const pendingOrders = document.querySelectorAll('.order-actions').length;
    const completedOrders = document.querySelectorAll('.btn-status.completed').length;
    const rejectedOrders = document.querySelectorAll('.btn-status.rejected').length;
    
    console.log('=== ESTADÍSTICAS TECNM ===');
    console.log(`Total de solicitudes: ${cards.length}`);
    console.log(`Pendientes: ${pendingOrders}`);
    console.log(`Aprobadas: ${completedOrders}`);
    console.log(`Rechazadas: ${rejectedOrders}`);
    console.log('========================');
}

// ========================================
// CONFIGURACIÓN DE CONTRASEÑA
// ========================================

function setupPasswordSettings() {
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    // Verificar que existen todos los elementos
    if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput) {
        return;
    }
    
    // Obtener número de control del usuario autenticado
    const controlNumber = sessionStorage.getItem('username') || '20401234';
    
    // Establecer contraseña por defecto si no existe para este usuario
    const passwordKey = 'userPassword_' + controlNumber;
    if (!localStorage.getItem(passwordKey)) {
        localStorage.setItem(passwordKey, 'tecnm2025'); // Contraseña por defecto
        console.log('✓ Contraseña por defecto establecida para: ' + controlNumber);
    }
    
    // Validación de requisitos de contraseña en tiempo real
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        validatePasswordRequirements(password);
    });
    
    // Validación de coincidencia en tiempo real
    confirmPasswordInput.addEventListener('input', function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.style.borderColor = '#c62828';
        } else if (confirmPassword && newPassword === confirmPassword) {
            this.style.borderColor = '#2e7d32';
        } else {
            this.style.borderColor = '#e8eef5';
        }
    });
    
    // Encontrar el botón de cambiar contraseña
    const passwordCard = currentPasswordInput.closest('.settings-card');
    const passwordUpdateBtn = passwordCard.querySelector('.settings-btn.primary');
    
    if (passwordUpdateBtn) {
        passwordUpdateBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const currentPassword = currentPasswordInput.value.trim();
            const newPassword = newPasswordInput.value.trim();
            const confirmPassword = confirmPasswordInput.value.trim();
            const savedPassword = localStorage.getItem(passwordKey);
            
            // Validaciones
            if (!currentPassword || !newPassword || !confirmPassword) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Verificar contraseña actual
            if (currentPassword !== savedPassword) {
                showNotification('La contraseña actual es incorrecta', 'error');
                currentPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que la nueva contraseña sea diferente
            if (newPassword === savedPassword) {
                showNotification('La nueva contraseña debe ser diferente a la actual', 'info');
                return;
            }
            
            // Validar requisitos de contraseña
            const requirements = validatePasswordRequirements(newPassword);
            if (!requirements.isValid) {
                showNotification('La nueva contraseña no cumple con los requisitos', 'error');
                newPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que las contraseñas coincidan
            if (newPassword !== confirmPassword) {
                showNotification('Las contraseñas no coinciden', 'error');
                confirmPasswordInput.style.borderColor = '#c62828';
                return;
            }
            
            // Actualizar contraseña para este usuario específico
            localStorage.setItem(passwordKey, newPassword);
            
            // Limpiar campos
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Resetear colores de borde
            currentPasswordInput.style.borderColor = '#e8eef5';
            newPasswordInput.style.borderColor = '#e8eef5';
            confirmPasswordInput.style.borderColor = '#e8eef5';
            
            // Limpiar validación visual
            resetPasswordRequirements();
            
            // Mostrar notificación de éxito
            showNotification('✅ Contraseña actualizada exitosamente', 'success');
            console.log('✓ Contraseña actualizada para usuario: ' + controlNumber);
        });
    }
}

function validatePasswordRequirements(password) {
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasNumber: /[0-9]/.test(password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        isValid: false
    };
    
    requirements.isValid = requirements.minLength && 
                          requirements.hasUppercase && 
                          requirements.hasNumber && 
                          requirements.hasSpecial;
    
    // Actualizar visualización de requisitos
    updatePasswordRequirementsDisplay(requirements);
    
    return requirements;
}

function updatePasswordRequirementsDisplay(requirements) {
    const requirementsList = document.querySelector('.password-requirements ul');
    
    if (!requirementsList) {
        return;
    }
    
    const items = requirementsList.querySelectorAll('li');
    
    if (items.length >= 4) {
        // Mínimo 8 caracteres
        items[0].style.color = requirements.minLength ? '#2e7d32' : '#8a99b3';
        items[0].style.fontWeight = requirements.minLength ? '600' : '400';
        
        // Al menos una letra mayúscula
        items[1].style.color = requirements.hasUppercase ? '#2e7d32' : '#8a99b3';
        items[1].style.fontWeight = requirements.hasUppercase ? '600' : '400';
        
        // Al menos un número
        items[2].style.color = requirements.hasNumber ? '#2e7d32' : '#8a99b3';
        items[2].style.fontWeight = requirements.hasNumber ? '600' : '400';
        
        // Al menos un carácter especial
        items[3].style.color = requirements.hasSpecial ? '#2e7d32' : '#8a99b3';
        items[3].style.fontWeight = requirements.hasSpecial ? '600' : '400';
    }
}

function resetPasswordRequirements() {
    const requirementsList = document.querySelector('.password-requirements ul');
    
    if (!requirementsList) {
        return;
    }
    
    const items = requirementsList.querySelectorAll('li');
    items.forEach(item => {
        item.style.color = '#8a99b3';
        item.style.fontWeight = '400';
    });
}

// ========================================
// MODO OSCURO
// ========================================

function setupDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    
    if (!darkModeToggle) {
        return;
    }
    
    // Verificar si hay una preferencia guardada
    const savedTheme = localStorage.getItem('darkMode');
    
    if (savedTheme === 'enabled') {
        document.body.classList.add('dark-mode');
        darkModeToggle.checked = true;
    }
    
    // Evento para cambiar el tema
    darkModeToggle.addEventListener('change', function() {
        if (this.checked) {
            // Activar modo oscuro
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
            showNotification('Modo oscuro activado 🌙', 'info');
            console.log('✓ Modo oscuro activado');
        } else {
            // Desactivar modo oscuro
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
            showNotification('Modo claro activado ☀️', 'info');
            console.log('✓ Modo claro activado');
        }
    });
}

// ========================================
// CARGAR INFORMACIÓN DEL USUARIO (ACTUALIZADO)
// ========================================

function loadUserInfo() {
    // Cargar información del usuario desde sessionStorage
    const controlNumber = sessionStorage.getItem('username');
    const studentName = sessionStorage.getItem('studentName');
    let studentEmail = sessionStorage.getItem('studentEmail');
    
    console.log('📧 Cargando información del usuario...');
    console.log('Matrícula:', controlNumber);
    console.log('Nombre:', studentName);
    console.log('Email desde session:', studentEmail);
    
    // Si no hay email en sessionStorage, intentar cargar desde localStorage
    if (!studentEmail || studentEmail === 'undefined' || studentEmail === '') {
        const emailKey = `userEmail_${controlNumber}`;
        studentEmail = localStorage.getItem(emailKey);
        console.log('Email desde localStorage:', studentEmail);
        
        // Si encontramos email en localStorage, guardarlo en sessionStorage también
        if (studentEmail && studentEmail !== 'undefined') {
            sessionStorage.setItem('studentEmail', studentEmail);
        }
    }
    
    // Actualizar campos de información personal si existen
    const fullnameInput = document.getElementById('fullname');
    const controlNumberInput = document.getElementById('control-number');
    const currentEmailInput = document.getElementById('current-email');
    
    if (fullnameInput && studentName) {
        fullnameInput.value = studentName;
    }
    
    if (controlNumberInput && controlNumber) {
        controlNumberInput.value = controlNumber;
    }
    
    if (currentEmailInput) {
        if (studentEmail && studentEmail !== 'undefined' && studentEmail !== '') {
            currentEmailInput.value = studentEmail;
            currentEmailInput.placeholder = studentEmail;
            
            // Guardar el email del usuario si no existe
            const emailKey = 'userEmail_' + controlNumber;
            if (!localStorage.getItem(emailKey)) {
                localStorage.setItem(emailKey, studentEmail);
            }
        } else {
            // Si aún no hay email, mostrar placeholder
            currentEmailInput.placeholder = 'No hay correo registrado';
            currentEmailInput.value = '';
        }
    }
    
    console.log('✓ Información del usuario cargada: ' + studentName + ' (' + controlNumber + ')');
    if (studentEmail && studentEmail !== 'undefined' && studentEmail !== '') {
        console.log('✓ Email configurado: ' + studentEmail);
    } else {
        console.log('⚠️ No hay email registrado para este usuario');
    }
}

// ========================================
// CONFIGURACIÓN DE CORREO ELECTRÓNICO (ACTUALIZADO)
// ========================================

function setupEmailSettings() {
    const currentEmailInput = document.getElementById('current-email');
    const newEmailInput = document.getElementById('new-email');
    const confirmEmailInput = document.getElementById('confirm-email');
    
    // Verificar que existen todos los elementos
    if (!currentEmailInput || !newEmailInput || !confirmEmailInput) {
        console.log('⚠️ No se encontraron los campos de email');
        return;
    }
    
    // Cargar correo guardado si existe
    const controlNumber = sessionStorage.getItem('username');
    const emailKey = 'userEmail_' + controlNumber;
    const savedEmail = localStorage.getItem(emailKey);
    
    if (savedEmail && savedEmail !== 'undefined' && savedEmail !== '') {
        currentEmailInput.value = savedEmail;
        currentEmailInput.placeholder = savedEmail;
        console.log('✓ Email cargado en ajustes:', savedEmail);
    } else {
        currentEmailInput.placeholder = 'No hay correo registrado';
        console.log('⚠️ No hay email guardado para este usuario');
    }
    
    // Validación en tiempo real
    confirmEmailInput.addEventListener('input', function() {
        const newEmail = newEmailInput.value.trim();
        const confirmEmail = this.value.trim();
        
        if (confirmEmail && newEmail !== confirmEmail) {
            this.style.borderColor = '#c62828';
        } else if (confirmEmail && newEmail === confirmEmail) {
            this.style.borderColor = '#2e7d32';
        } else {
            this.style.borderColor = '#e5e7eb';
        }
    });
    
    // Encontrar el botón de actualizar correo específico
    const emailCard = currentEmailInput.closest('.settings-card');
    const emailUpdateBtn = emailCard ? emailCard.querySelector('.settings-btn.primary') : null;
    
    if (emailUpdateBtn) {
        // Remover listeners anteriores para evitar duplicados
        const newBtn = emailUpdateBtn.cloneNode(true);
        emailUpdateBtn.parentNode.replaceChild(newBtn, emailUpdateBtn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const newEmail = newEmailInput.value.trim();
            const confirmEmail = confirmEmailInput.value.trim();
            
            console.log('🔄 Intentando actualizar email...');
            
            // Validaciones
            if (!newEmail || !confirmEmail) {
                showNotification('Por favor completa todos los campos', 'error');
                return;
            }
            
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(newEmail)) {
                showNotification('Por favor ingresa un correo electrónico válido', 'error');
                newEmailInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que los correos coincidan
            if (newEmail !== confirmEmail) {
                showNotification('Los correos electrónicos no coinciden', 'error');
                confirmEmailInput.style.borderColor = '#c62828';
                return;
            }
            
            // Verificar que el nuevo correo sea diferente al actual
            if (newEmail === currentEmailInput.value) {
                showNotification('El nuevo correo es igual al actual', 'info');
                return;
            }
            
            // Actualizar correo
            currentEmailInput.value = newEmail;
            currentEmailInput.placeholder = newEmail;
            
            // Guardar en localStorage con la clave específica del usuario
            const controlNumber = sessionStorage.getItem('username');
            const emailKey = 'userEmail_' + controlNumber;
            localStorage.setItem(emailKey, newEmail);
            
            // También actualizar en sessionStorage
            sessionStorage.setItem('studentEmail', newEmail);
            
            // Actualizar en la base de datos de estudiantes si existe
            const studentsData = localStorage.getItem('tecnm_students');
            if (studentsData) {
                try {
                    const students = JSON.parse(studentsData);
                    if (students[controlNumber]) {
                        students[controlNumber].email = newEmail;
                        localStorage.setItem('tecnm_students', JSON.stringify(students));
                        console.log('✓ Email actualizado en base de datos de estudiantes');
                    }
                } catch (error) {
                    console.error('Error al actualizar base de datos:', error);
                }
            }
            
            // Limpiar campos
            newEmailInput.value = '';
            confirmEmailInput.value = '';
            
            // Resetear colores de borde
            newEmailInput.style.borderColor = '#e5e7eb';
            confirmEmailInput.style.borderColor = '#e5e7eb';
            
            // Mostrar notificación de éxito
            showNotification('✅ Correo electrónico actualizado exitosamente', 'success');
            console.log(`✓ Correo actualizado a: ${newEmail} para usuario: ${controlNumber}`);
        });
        
        console.log('✓ Botón de actualizar email configurado');
    } else {
        console.error('❌ No se encontró el botón de actualizar email');
    }
}

// ========================================
// GESTIÓN DE DOCUMENTOS
// ========================================

function setupDocumentUpload() {
    const uploadButtons = document.querySelectorAll('.doc-action-btn.upload');
    const uploadModal = document.getElementById('uploadModal');
    const modalOverlay = uploadModal ? uploadModal.querySelector('.modal-overlay') : null;
    const modalClose = uploadModal ? uploadModal.querySelector('.modal-close') : null;
    const cancelBtn = uploadModal ? uploadModal.querySelector('.modal-btn.cancel') : null;
    const uploadBtn = uploadModal ? uploadModal.querySelector('.modal-btn.primary') : null;
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const uploadProgress = document.getElementById('uploadProgress');
    const modalTitle = document.getElementById('modalTitle');
    
    let currentDocumentType = '';
    let currentDocumentCard = null;
    let uploadedFile = null;
    
    if (!uploadModal) return;
    
    // Abrir modal al hacer clic en botón de subir
    uploadButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentDocumentCard = this.closest('.document-card');
            currentDocumentType = currentDocumentCard.getAttribute('data-type');
            const documentName = currentDocumentCard.querySelector('h4').textContent;
            
            modalTitle.textContent = `Subir ${documentName}`;
            uploadModal.style.display = 'flex';
            uploadArea.style.display = 'block';
            uploadProgress.style.display = 'none';
            
            console.log(`Abriendo modal para: ${documentName}`);
        });
    });
    
    // Cerrar modal
    function closeModal() {
        uploadModal.style.display = 'none';
        fileInput.value = '';
        uploadArea.style.display = 'block';
        uploadProgress.style.display = 'none';
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeModal);
    }
    
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    // Click en área de subida
    if (uploadArea) {
        uploadArea.addEventListener('click', function() {
            fileInput.click();
        });
    }
    
    // Drag and drop
    if (uploadArea) {
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#19326c';
            this.style.background = '#f8f9fc';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d9e6';
            this.style.background = 'transparent';
        });
        
        uploadArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d9e6';
            this.style.background = 'transparent';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFile(files[0]);
            }
        });
    }
    
    // Seleccionar archivo
    if (fileInput) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFile(this.files[0]);
            }
        });
    }
    
    // Manejar archivo seleccionado
    function handleFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10 MB
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        
        // Validar tipo
        if (!allowedTypes.includes(file.type)) {
            showNotification('Solo se permiten archivos PDF, JPG o PNG', 'error');
            return;
        }
        
        // Validar tamaño
        if (file.size > maxSize) {
            showNotification('El archivo no debe superar los 10 MB', 'error');
            return;
        }
        
        uploadedFile = file;
        
        // Mostrar información del archivo
        const fileName = uploadProgress.querySelector('.file-name');
        const fileSize = uploadProgress.querySelector('.file-size');
        
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = formatFileSize(file.size);
        
        uploadArea.style.display = 'none';
        uploadProgress.style.display = 'block';
        
        console.log(`Archivo seleccionado: ${file.name} (${formatFileSize(file.size)})`);
    }
    
    // Botón de subir
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function() {
            const files = fileInput.files;
            
            if (files.length === 0) {
                showNotification('Por favor selecciona un archivo', 'error');
                return;
            }
            
            // Simular subida con barra de progreso
            const progressFill = uploadProgress.querySelector('.progress-fill');
            const progressText = uploadProgress.querySelector('.progress-text');
            let progress = 0;
            
            const interval = setInterval(() => {
                progress += 10;
                if (progressFill) progressFill.style.width = progress + '%';
                if (progressText) progressText.textContent = `Subiendo... ${progress}%`;
                
                if (progress >= 100) {
                    clearInterval(interval);
                    
                    // Convertir archivo a base64 para almacenamiento
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const fileData = {
                            name: uploadedFile.name,
                            type: uploadedFile.type,
                            size: uploadedFile.size,
                            data: e.target.result,
                            uploadDate: new Date().toISOString()
                        };
                        
                        // Guardar en localStorage
                        const controlNumber = sessionStorage.getItem('username');
                        const storageKey = `document_${controlNumber}_${currentDocumentType}`;
                        localStorage.setItem(storageKey, JSON.stringify(fileData));
                        
                        // Actualizar estado del documento
                        if (currentDocumentCard) {
                            const statusBadge = currentDocumentCard.querySelector('.document-status-new');
                            if (statusBadge) {
                                statusBadge.textContent = 'Subido';
                                statusBadge.classList.remove('pendiente');
                                statusBadge.classList.add('subido');
                            }
                            
                            currentDocumentCard.setAttribute('data-file-key', storageKey);
                            
                            // Cambiar botón de subir por ver/descargar/eliminar
                            const actions = currentDocumentCard.querySelector('.document-actions');
                            if (actions) {
                                actions.innerHTML = '<button class="doc-action-btn view" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button><button class="doc-action-btn download" title="Descargar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button><button class="doc-action-btn delete" title="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></button>';
                                
                                setupDocumentActions(actions);
                            }
                            
                            // Agregar descripción del archivo
                            const description = currentDocumentCard.querySelector('.doc-description');
                            if (description) {
                                const uploadDate = new Date(fileData.uploadDate).toLocaleDateString('es-MX');
                                description.textContent = `${fileData.name} - ${formatFileSize(fileData.size)} - ${uploadDate}`;
                            }
                        }
                        
                        showNotification('✅ Documento subido exitosamente', 'success');
                        console.log(`Archivo guardado con clave: ${storageKey}`);
                        
                        setTimeout(() => {
                            closeModal();
                        }, 500);
                    };
                    
                    reader.readAsDataURL(uploadedFile);
                }
            }, 100);
        });
    }
    
    // Cargar documentos guardados al iniciar
    loadSavedDocuments();
}

function loadSavedDocuments() {
    const controlNumber = sessionStorage.getItem('username');
    const documentCards = document.querySelectorAll('.document-card');
    
    documentCards.forEach(card => {
        const documentType = card.getAttribute('data-type');
        const storageKey = 'document_' + controlNumber + '_' + documentType;
        const savedFile = localStorage.getItem(storageKey);
        
        if (savedFile) {
            try {
                const fileData = JSON.parse(savedFile);
                
                // Actualizar estado
                const statusBadge = card.querySelector('.document-status-new');
                if (statusBadge) {
                    statusBadge.textContent = 'Subido';
                    statusBadge.classList.remove('pendiente');
                    statusBadge.classList.add('subido');
                }
                
                card.setAttribute('data-file-key', storageKey);
                
                // Actualizar descripción
                const description = card.querySelector('.doc-description');
                if (description) {
                    const uploadDate = new Date(fileData.uploadDate).toLocaleDateString('es-MX');
                    description.textContent = fileData.name + ' - ' + formatFileSize(fileData.size) + ' - ' + uploadDate;
                }
                
                // Cambiar botones
                const actions = card.querySelector('.document-actions');
                if (actions) {
                    actions.innerHTML = '<button class="doc-action-btn view" title="Ver"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button><button class="doc-action-btn download" title="Descargar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button><button class="doc-action-btn delete" title="Eliminar"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg></button>';
                    
                    setupDocumentActions(actions);
                }
                
                console.log('✓ Documento cargado: ' + fileData.name);
            } catch (error) {
                console.error('Error al cargar documento ' + documentType + ':', error);
            }
        }
    });
}

function setupDocumentActions(container) {
    const viewBtn = container.querySelector('.doc-action-btn.view');
    const downloadBtn = container.querySelector('.doc-action-btn.download');
    const deleteBtn = container.querySelector('.doc-action-btn.delete');
    
    if (viewBtn) {
        viewBtn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileKey = card.getAttribute('data-file-key');
            
            if (!fileKey) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            const savedFile = localStorage.getItem(fileKey);
            if (!savedFile) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            try {
                const fileData = JSON.parse(savedFile);
                const newWindow = window.open();
                
                if (fileData.type === 'application/pdf') {
                    newWindow.document.write('<html><head><title>' + fileData.name + '</title><style>body { margin: 0; } iframe { width: 100%; height: 100vh; border: none; }</style></head><body><iframe src="' + fileData.data + '"></iframe></body></html>');
                } else {
                    newWindow.document.write('<html><head><title>' + fileData.name + '</title><style>body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; } img { max-width: 90%; max-height: 90vh; object-fit: contain; }</style></head><body><img src="' + fileData.data + '" alt="' + fileData.name + '"></body></html>');
                }
                
                showNotification('Visualizando documento...', 'info');
                console.log('Visualizando: ' + fileData.name);
            } catch (error) {
                showNotification('Error al visualizar el documento', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            const card = this.closest('.document-card');
            const fileKey = card.getAttribute('data-file-key');
            
            if (!fileKey) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            const savedFile = localStorage.getItem(fileKey);
            if (!savedFile) {
                showNotification('No se encontró el archivo', 'error');
                return;
            }
            
            try {
                const fileData = JSON.parse(savedFile);
                
                const link = document.createElement('a');
                link.href = fileData.data;
                link.download = fileData.name;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                showNotification('📥 Descargando documento...', 'success');
                console.log('Descargando: ' + fileData.name);
            } catch (error) {
                showNotification('Error al descargar el documento', 'error');
                console.error('Error:', error);
            }
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de eliminar este documento?')) {
                const card = this.closest('.document-card');
                const fileKey = card.getAttribute('data-file-key');
                
                if (fileKey) {
                    localStorage.removeItem(fileKey);
                    card.removeAttribute('data-file-key');
                }
                
                const statusBadge = card.querySelector('.document-status-new');
                const description = card.querySelector('.doc-description');
                const actions = card.querySelector('.document-actions');
                
                if (statusBadge) {
                    statusBadge.textContent = 'Sin subir';
                    statusBadge.classList.remove('subido');
                    statusBadge.classList.add('pendiente');
                }
                
                if (description) {
                    const documentType = card.getAttribute('data-type');
                    const descriptions = {
                        'acta-nacimiento': 'Documento oficial que acredita el nacimiento',
                        'curp': 'Clave Única de Registro de Población',
                        'identificacion': 'INE, Pasaporte o Cédula Profesional',
                        'comprobante-domicilio': 'Recibo de luz, agua o teléfono (máx. 3 meses)',
                        'fotografia': 'Tamaño infantil, fondo blanco',
                        'cuenta-bancaria': 'Estado de cuenta o carátula bancaria'
                    };
                    description.textContent = descriptions[documentType] || '';
                }
                
                if (actions) {
                    actions.innerHTML = '<button class="doc-action-btn upload" title="Subir documento"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg></button>';
                    setupDocumentUpload();
                }
                
                showNotification('🗑️ Documento eliminado', 'info');
            }
        });
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ========================================
// MODAL DE DETALLE DE SOLICITUD
// ========================================

function setupSolicitudModal() {
    const modal = document.getElementById('solicitudModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('modalCancelBtn');
    const approveBtn = document.getElementById('modalApproveBtn');
    const rejectBtn = document.getElementById('modalRejectBtn');
    const orderCards = document.querySelectorAll('.order-card');
    
    let currentCard = null;
    
    orderCards.forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.btn-approve') || e.target.closest('.btn-reject') || e.target.closest('.btn-status')) {
                return;
            }
            
            currentCard = this;
            openSolicitudModal(this);
        });
    });
    
    function closeModal() {
        if (modal) {
            modal.style.display = 'none';
            currentCard = null;
        }
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }
    
    if (modal) {
        const overlay = modal.querySelector('.modal-overlay-full');
        if (overlay) {
            overlay.addEventListener('click', closeModal);
        }
    }
    
    if (approveBtn) {
        approveBtn.addEventListener('click', function() {
            if (currentCard) {
                const orderTitle = currentCard.querySelector('h3').textContent;
                approveOrderFromModal(orderTitle, currentCard);
                closeModal();
            }
        });
    }
    
    if (rejectBtn) {
        rejectBtn.addEventListener('click', function() {
            if (currentCard) {
                const orderTitle = currentCard.querySelector('h3').textContent;
                rejectOrderFromModal(orderTitle, currentCard);
                closeModal();
            }
        });
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

function openSolicitudModal(card) {
    const modal = document.getElementById('solicitudModal');
    if (!modal) return;
    
    const title = card.querySelector('h3').textContent;
    const date = card.querySelector('.order-date').textContent;
    const userInitial = card.querySelector('.user-initial').textContent;
    const requirements = card.querySelector('.order-requirements').textContent;
    const items = card.querySelectorAll('.order-item');
    const statusBtn = card.querySelector('.btn-status');
    
    let status = 'pending';
    let statusText = 'Pendiente';
    if (statusBtn) {
        if (statusBtn.classList.contains('completed')) {
            status = 'approved';
            statusText = 'Aprobada';
        } else if (statusBtn.classList.contains('rejected')) {
            status = 'rejected';
            statusText = 'Rechazada';
        }
    }
    
    document.getElementById('modalSolicitudTitle').textContent = title;
    document.getElementById('modalDate').textContent = date;
    document.getElementById('modalRequirements').textContent = requirements;
    
    const studentNames = {
        'JM': 'Juan Martínez',
        'AP': 'Ana Pérez',
        'LG': 'Luis González'
    };
    document.getElementById('modalStudentName').textContent = studentNames[userInitial] || 'Estudiante';
    
    const controlNumber = sessionStorage.getItem('username') || '20401234';
    document.getElementById('modalControlNumber').textContent = controlNumber;
    
    const statusBadge = document.getElementById('modalStatusBadge');
    statusBadge.textContent = statusText;
    statusBadge.className = 'modal-status-badge ' + status;
    
    const itemsList = document.getElementById('modalItemsList');
    itemsList.innerHTML = '';
    
    items.forEach(item => {
        const img = item.querySelector('img').src;
        const itemTitle = item.querySelector('.item-details h4').textContent;
        const itemDesc = item.querySelector('.item-details p').textContent;
        const itemStatus = item.querySelector('.item-status');
        
        const modalItem = document.createElement('div');
        modalItem.className = 'modal-item';
        modalItem.innerHTML = '<img src="' + img + '" alt="Item"><div class="modal-item-details"><h4>' + itemTitle + '</h4><p>' + itemDesc + '</p></div><span class="modal-item-status ' + itemStatus.className.replace('item-status', '').trim() + '">' + itemStatus.textContent + '</span>';
        
        itemsList.appendChild(modalItem);
    });
    
    const approveBtn = document.getElementById('modalApproveBtn');
    const rejectBtn = document.getElementById('modalRejectBtn');
    
    if (status === 'pending') {
        if (approveBtn) approveBtn.style.display = 'flex';
        if (rejectBtn) rejectBtn.style.display = 'flex';
    } else {
        if (approveBtn) approveBtn.style.display = 'none';
        if (rejectBtn) rejectBtn.style.display = 'none';
    }
    
    modal.style.display = 'flex';
}

function approveOrderFromModal(orderId, card) {
    if (confirm('¿Estás seguro de aprobar la ' + orderId + '?\n\nEsta acción otorgará los beneficios solicitados al estudiante.')) {
        console.log(orderId + ' aprobada desde modal');
        
        const footer = card.querySelector('.order-footer');
        
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('approved');
            status.textContent = 'Aprobado';
        });
        
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status completed';
        statusBtn.textContent = 'COMPLETADA';
        footer.appendChild(statusBtn);
        
        showNotification('✅ ' + orderId + ' aprobada exitosamente', 'success');
        updateStatistics();
    }
}

function rejectOrderFromModal(orderId, card) {
    const observaciones = document.getElementById('modalObservaciones').value.trim();
    const reason = observaciones || prompt('¿Por qué deseas rechazar la ' + orderId + '?\n\nEscribe el motivo:');
    
    if (reason !== null && reason.trim() !== '') {
        console.log(orderId + ' rechazada desde modal. Motivo: ' + reason);
        
        const footer = card.querySelector('.order-footer');
        
        const itemStatuses = card.querySelectorAll('.item-status');
        itemStatuses.forEach(status => {
            status.classList.remove('pending');
            status.classList.add('rejected');
            status.textContent = 'Rechazado';
        });
        
        const actions = footer.querySelector('.order-actions');
        if (actions) {
            actions.remove();
        }
        
        const statusBtn = document.createElement('button');
        statusBtn.className = 'btn-status rejected';
        statusBtn.textContent = 'RECHAZADA';
        statusBtn.title = 'Motivo: ' + reason;
        footer.appendChild(statusBtn);
        
        showNotification('❌ ' + orderId + ' rechazada', 'error');
        updateStatistics();
    } else if (reason !== null) {
        alert('Debes proporcionar un motivo para rechazar la solicitud.');
    }
}

// ========================================
// UTILIDADES
// ========================================

function exportReport() {
    console.log('Generando reporte...');
    
    const cards = document.querySelectorAll('.order-card');
    let report = 'REPORTE DE SOLICITUDES - TECNM\n';
    report += '================================\n\n';
    
    cards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        const date = card.querySelector('.order-date').textContent;
        const items = Array.from(card.querySelectorAll('.item-details h4'))
            .map(h4 => h4.textContent)
            .join(', ');
        const status = card.querySelector('.btn-status') ? 
            card.querySelector('.btn-status').textContent : 'PENDIENTE';
        
        report += `${title}\n`;
        report += `Fecha: ${date}\n`;
        report += `Solicita: ${items}\n`;
        report += `Estado: ${status}\n`;
        report += '--------------------------------\n\n';
    });
    
    console.log(report);
    showNotification('Reporte generado en consola', 'success');
}

// Atajos de teclado
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        exportReport();
    }
    
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-bar input');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="home"]').click();
    }
    
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="becas"]').click();
    }
    
    if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="mensajes"]').click();
    }
});

// Prevenir que el formulario se envíe
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
    });
});

// Mensaje de bienvenida
setTimeout(() => {
    showNotification('Bienvenido al Sistema de Gestión TECNM', 'info');
}, 500);

console.log('✅ Dashboard del estudiante cargado completamente');
// ========================================
// AGREGAR ESTE CÓDIGO AL ARCHIVO dashboard.js (ESTUDIANTES)
// AL FINAL DE LA FUNCIÓN initializeDashboard()
// ========================================

// Agregar después de loadBecasForStudents(); en initializeDashboard()
loadEstudianteSolicitudes();
setupNotificacionesEstudiante();

// ========================================
// SISTEMA DE VISUALIZACIÓN DE SOLICITUDES - ESTUDIANTE
// ========================================

function loadEstudianteSolicitudes() {
    console.log('📋 Cargando solicitudes del estudiante...');
    
    const controlNumber = sessionStorage.getItem('username');
    if (!controlNumber) {
        console.error('❌ No se encontró el número de control');
        return;
    }
    
    // Obtener todas las solicitudes
    const solicitudesData = localStorage.getItem('tecnm_solicitudes');
    if (!solicitudesData) {
        console.log('ℹ️ No hay solicitudes registradas');
        return;
    }
    
    const todasSolicitudes = JSON.parse(solicitudesData);
    
    // Filtrar solo las solicitudes de este estudiante
    const misSolicitudes = Object.entries(todasSolicitudes).filter(
        ([_, solicitud]) => solicitud.estudianteId === controlNumber
    );
    
    console.log(`✓ ${misSolicitudes.length} solicitudes encontradas para el estudiante`);
    
    // Actualizar la sección de BECAS para mostrar "Mis Solicitudes"
    updateBecasSection(misSolicitudes);
}

function updateBecasSection(solicitudes) {
    const becasSection = document.getElementById('becas-section');
    if (!becasSection) return;
    
    becasSection.innerHTML = '';
    
    // Header
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = '<h2>MIS SOLICITUDES DE BECAS</h2>';
    becasSection.appendChild(header);
    
    if (solicitudes.length === 0) {
        // Estado vacío
        const emptyState = document.createElement('div');
        emptyState.className = 'placeholder-content';
        emptyState.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="80" height="80">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            <h3>No tienes solicitudes de becas</h3>
            <p>Las becas a las que apliques aparecerán aquí</p>
        `;
        becasSection.appendChild(emptyState);
        return;
    }
    
    // Filtros
    const filtrosContainer = document.createElement('div');
    filtrosContainer.className = 'filter-tabs';
    filtrosContainer.style.marginBottom = '25px';
    
    const pendientes = solicitudes.filter(([_, s]) => s.estado === 'pendiente').length;
    const aprobadas = solicitudes.filter(([_, s]) => s.estado === 'aprobada').length;
    const rechazadas = solicitudes.filter(([_, s]) => s.estado === 'rechazada').length;
    
    filtrosContainer.innerHTML = `
        <button class="filter-tab active" data-filter-solicitud="todas">Todas (${solicitudes.length})</button>
        <button class="filter-tab" data-filter-solicitud="pendiente">Pendientes (${pendientes})</button>
        <button class="filter-tab" data-filter-solicitud="aprobada">Aprobadas (${aprobadas})</button>
        <button class="filter-tab" data-filter-solicitud="rechazada">Rechazadas (${rechazadas})</button>
    `;
    becasSection.appendChild(filtrosContainer);
    
    // Grid de solicitudes
    const grid = document.createElement('div');
    grid.className = 'orders-grid';
    grid.id = 'misSolicitudesGrid';
    
    // Ordenar por fecha (más recientes primero)
    solicitudes.sort(([_, a], [__, b]) => new Date(b.fecha) - new Date(a.fecha));
    
    solicitudes.forEach(([solicitudId, solicitud]) => {
        const card = createMiSolicitudCard(solicitudId, solicitud);
        grid.appendChild(card);
    });
    
    becasSection.appendChild(grid);
    
    // Configurar filtros
    setupSolicitudesFiltersTabs();
    
    console.log(`✅ ${solicitudes.length} solicitudes mostradas`);
}

function createMiSolicitudCard(solicitudId, solicitud) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.setAttribute('data-solicitud-estado', solicitud.estado);
    
    const fecha = new Date(solicitud.fecha);
    const fechaLegible = fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Color y texto según estado
    let estadoBadge = '';
    if (solicitud.estado === 'pendiente') {
        estadoBadge = '<span class="item-status pending">En Revisión</span>';
    } else if (solicitud.estado === 'aprobada') {
        estadoBadge = '<span class="item-status approved">Aprobada ✓</span>';
    } else if (solicitud.estado === 'rechazada') {
        estadoBadge = '<span class="item-status rejected">Rechazada</span>';
    }
    
    // Icono según estado
    let iconoBadge = '';
    if (solicitud.estado === 'pendiente') {
        iconoBadge = '⏳';
    } else if (solicitud.estado === 'aprobada') {
        iconoBadge = '✅';
    } else if (solicitud.estado === 'rechazada') {
        iconoBadge = '❌';
    }
    
    card.innerHTML = `
        <div class="order-header">
            <div>
                <h3>${iconoBadge} ${solicitud.becaNombre}</h3>
                <p class="order-date">Solicitada el ${fechaLegible}</p>
            </div>
            <div>
                ${estadoBadge}
            </div>
        </div>
        <div class="order-items">
            <div class="order-item" style="display: block; padding: 20px; background: #f8f9fc; border-radius: 8px; border: none;">
                <div style="margin-bottom: 15px;">
                    <strong style="color: #19326c; font-size: 14px; display: block; margin-bottom: 8px;">📊 Estado de tu solicitud:</strong>
                    ${solicitud.estado === 'pendiente' ? 
                        '<p style="color: #f59e0b; margin: 0; font-weight: 600;">Tu solicitud está siendo revisada por el departamento de becas.</p>' :
                        solicitud.estado === 'aprobada' ?
                        '<p style="color: #10b981; margin: 0; font-weight: 600;">¡Felicidades! Tu solicitud ha sido aprobada.</p>' :
                        '<p style="color: #ef4444; margin: 0; font-weight: 600;">Tu solicitud ha sido rechazada.</p>'
                    }
                </div>
                ${solicitud.estado === 'rechazada' && solicitud.motivo ? `
                    <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-left: 4px solid #f59e0b; border-radius: 8px;">
                        <strong style="color: #856404; font-size: 13px; display: block; margin-bottom: 5px;">Motivo del rechazo:</strong>
                        <p style="color: #856404; margin: 0; font-size: 13px;">${solicitud.motivo}</p>
                    </div>
                ` : ''}
                ${solicitud.estado === 'aprobada' ? `
                    <div style="margin-top: 15px; padding: 15px; background: #d4edda; border-left: 4px solid #10b981; border-radius: 8px;">
                        <p style="color: #155724; margin: 0; font-size: 13px;">
                            <strong>¡Enhorabuena!</strong> Tu beca ha sido aprobada. 
                            Pronto recibirás más información sobre los siguientes pasos.
                        </p>
                    </div>
                ` : ''}
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e8eef5;">
                    <strong style="color: #19326c; font-size: 13px;">📄 Documentos entregados: ${solicitud.documentos.length}</strong>
                </div>
            </div>
        </div>
        <div class="order-footer">
            <span class="order-requirements">${solicitud.documentos.length} documentos</span>
            ${solicitud.fechaRespuesta ? 
                `<span style="color: #8a99b3; font-size: 12px;">Respondida el ${new Date(solicitud.fechaRespuesta).toLocaleDateString('es-MX')}</span>` :
                `<span style="color: #8a99b3; font-size: 12px;">En espera de respuesta</span>`
            }
        </div>
    `;
    
    return card;
}

function setupSolicitudesFiltersTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab[data-filter-solicitud]');
    
    filterTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter-solicitud');
            filterMisSolicitudes(filter);
        });
    });
}

function filterMisSolicitudes(estado) {
    const cards = document.querySelectorAll('#misSolicitudesGrid .order-card');
    
    cards.forEach(card => {
        const cardEstado = card.getAttribute('data-solicitud-estado');
        
        if (estado === 'todas' || cardEstado === estado) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// ========================================
// SISTEMA DE NOTIFICACIONES PARA ESTUDIANTES
// ========================================

function setupNotificacionesEstudiante() {
    const controlNumber = sessionStorage.getItem('username');
    if (!controlNumber) return;
    
    const key = `notificaciones_${controlNumber}`;
    const notificacionesData = localStorage.getItem(key);
    
    if (!notificacionesData) {
        console.log('ℹ️ No hay notificaciones para este estudiante');
        return;
    }
    
    const notificaciones = JSON.parse(notificacionesData);
    
    if (notificaciones.length === 0) {
        console.log('ℹ️ Sin notificaciones nuevas');
        return;
    }
    
    console.log(`📧 ${notificaciones.length} notificaciones encontradas`);
    
    // Actualizar badge de notificaciones
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.textContent = notificaciones.length;
        badge.style.display = 'block';
    }
    
    // Actualizar panel de notificaciones
    updateNotificacionesPanel(notificaciones);
}

function updateNotificacionesPanel(notificaciones) {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    // Limpiar estado vacío
    const emptyState = notificationsList.querySelector('.empty-notifications');
    if (emptyState) {
        emptyState.remove();
    }
    
    // Limpiar lista actual
    notificationsList.innerHTML = '';
    
    // Crear sección de notificaciones
    const section = document.createElement('div');
    section.className = 'notifications-section';
    
    const title = document.createElement('h4');
    title.className = 'section-title';
    title.textContent = 'Respuestas de Becas';
    section.appendChild(title);
    
    // Agregar cada notificación
    notificaciones.forEach((notif, index) => {
        const item = document.createElement('div');
        item.className = 'notification-item unread';
        
        const iconColor = notif.tipo === 'success' ? 'success' : 'warning';
        const icon = notif.tipo === 'success' ? 
            '<path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' :
            '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>';
        
        const timeAgo = getTimeAgo(new Date(notif.fecha));
        
        item.innerHTML = `
            <div class="notification-avatar">
                <img src="img/logo-tecnm1.png" alt="TECNM">
                <div class="notification-type-icon ${iconColor}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        ${icon}
                    </svg>
                </div>
            </div>
            <div class="notification-content">
                <p><strong>TECNM - Becas:</strong> ${notif.mensaje}</p>
                <span class="notification-time">${timeAgo}</span>
            </div>
            <button class="unread-indicator" onclick="marcarNotificacionLeida(${index})"></button>
        `;
        
        section.appendChild(item);
    });
    
    notificationsList.appendChild(section);
    
    // Mostrar footer
    const footer = document.querySelector('.notifications-footer');
    if (footer) {
        footer.style.display = 'block';
    }
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'Hace un momento';
}

function marcarNotificacionLeida(index) {
    const controlNumber = sessionStorage.getItem('username');
    if (!controlNumber) return;
    
    const key = `notificaciones_${controlNumber}`;
    const notificacionesData = localStorage.getItem(key);
    
    if (!notificacionesData) return;
    
    const notificaciones = JSON.parse(notificacionesData);
    notificaciones.splice(index, 1);
    
    localStorage.setItem(key, JSON.stringify(notificaciones));
    
    // Recargar notificaciones
    setupNotificacionesEstudiante();
    
    showNotification('Notificación eliminada', 'info');
}

// Hacer función global
window.marcarNotificacionLeida = marcarNotificacionLeida;

console.log('✅ Sistema de solicitudes para estudiantes cargado');

// ========================================
// FIN DEL CÓDIGO PARA dashboard.js (ESTUDIANTES)
// ========================================