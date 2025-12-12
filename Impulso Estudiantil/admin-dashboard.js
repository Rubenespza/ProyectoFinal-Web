// ========================================
// VERIFICACIÓN DE AUTENTICACIÓN Y ROL
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Admin Dashboard TECNM cargado correctamente');
    
    // Verificar autenticación
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!isAuthenticated || userRole !== 'admin') {
        console.log('⚠️ Acceso denegado. Redirigiendo al login...');
        showNotification('Acceso restringido solo para administradores', 'error');
        setTimeout(() => {
            window.location.href = 'Login.html';
        }, 1500);
        return;
    }
    
    console.log('✓ Usuario administrador autenticado');
    initializeAdminDashboard();
});

// ========================================
// INICIALIZACIÓN DEL DASHBOARD
// ========================================

function initializeAdminDashboard() {
    console.log('🚀 Inicializando dashboard de administrador...');
    
    loadAdminInfo();
    setupNavigation();
    setupLogout();
    updateDashboardStats();
    setupNotifications();
    
    setTimeout(() => {
        console.log('⏱️ Configurando módulo de estudiantes (con delay)...');
        setupStudentsModule();
    }, 500);
    
    setTimeout(() => {
        console.log('🎓 Configurando módulo de becas (con delay)...');
        setupBecasModule();
    }, 500);
    
    // Inicializar módulo de solicitudes
    setTimeout(() => {
        console.log('📋 Configurando módulo de solicitudes (con delay)...');
        setupSolicitudesModule();
    }, 500);
    
    console.log('✓ Dashboard de administrador inicializado');
}

// ========================================
// MÓDULO DE GESTIÓN DE SOLICITUDES - NUEVO
// ========================================

function setupSolicitudesModule() {
    console.log('🔧 Configurando módulo de solicitudes...');
    
    // Cargar solicitudes cuando se navegue a la sección
    const solicitudesNavItem = document.querySelector('.nav-item[data-section="solicitudes"]');
    if (solicitudesNavItem) {
        solicitudesNavItem.addEventListener('click', function() {
            setTimeout(() => {
                loadSolicitudes();
            }, 100);
        });
    }
    
    // Cargar solicitudes si ya estamos en esa sección
    const currentSection = document.getElementById('solicitudes-section');
    if (currentSection && currentSection.classList.contains('active')) {
        loadSolicitudes();
    }
    
    console.log('✅ Módulo de solicitudes configurado');
}

function loadSolicitudes() {
    console.log('📊 Cargando solicitudes...');
    
    const solicitudesData = localStorage.getItem('tecnm_solicitudes');
    const solicitudes = solicitudesData ? JSON.parse(solicitudesData) : {};
    const solicitudesList = Object.entries(solicitudes);
    
    const solicitudesSection = document.getElementById('solicitudes-section');
    if (!solicitudesSection) {
        console.error('❌ No se encontró la sección de solicitudes');
        return;
    }
    
    // Limpiar contenido actual
    solicitudesSection.innerHTML = '';
    
    if (solicitudesList.length === 0) {
        // Mostrar estado vacío
        solicitudesSection.innerHTML = `
            <div class="placeholder-content">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="80" height="80">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                </svg>
                <h3>No hay solicitudes registradas</h3>
                <p>Las solicitudes de becas aparecerán aquí cuando los estudiantes apliquen</p>
            </div>
        `;
        console.log('ℹ️ No hay solicitudes para mostrar');
        return;
    }
    
    // Crear header de la sección
    const header = document.createElement('div');
    header.className = 'students-header';
    header.style.marginBottom = '30px';
    header.innerHTML = `
        <div class="header-left">
            <h2>Gestión de Solicitudes de Becas</h2>
            <p class="section-description">Revisa y administra las solicitudes de becas de los estudiantes</p>
        </div>
        <div style="display: flex; align-items: center; gap: 15px;">
            <span class="total-students">Total: <strong id="totalSolicitudesCount">${solicitudesList.length}</strong> solicitudes</span>
        </div>
    `;
    solicitudesSection.appendChild(header);
    
    // Crear filtros
    const filters = document.createElement('div');
    filters.className = 'documents-filters';
    filters.style.marginBottom = '25px';
    filters.innerHTML = `
        <button class="doc-filter-btn active" data-filter="todas">
            Todas
            <span class="filter-count">${solicitudesList.length}</span>
        </button>
        <button class="doc-filter-btn" data-filter="pendiente">
            Pendientes
            <span class="filter-count">${solicitudesList.filter(([_, s]) => s.estado === 'pendiente').length}</span>
        </button>
        <button class="doc-filter-btn" data-filter="aprobada">
            Aprobadas
            <span class="filter-count">${solicitudesList.filter(([_, s]) => s.estado === 'aprobada').length}</span>
        </button>
        <button class="doc-filter-btn" data-filter="rechazada">
            Rechazadas
            <span class="filter-count">${solicitudesList.filter(([_, s]) => s.estado === 'rechazada').length}</span>
        </button>
    `;
    solicitudesSection.appendChild(filters);
    
    // Crear contenedor de solicitudes
    const solicitudesGrid = document.createElement('div');
    solicitudesGrid.className = 'orders-grid';
    solicitudesGrid.id = 'solicitudesGrid';
    
    // Ordenar por fecha (más recientes primero)
    solicitudesList.sort((a, b) => new Date(b[1].fecha) - new Date(a[1].fecha));
    
    // Crear tarjetas de solicitudes
    solicitudesList.forEach(([solicitudId, solicitud]) => {
        const card = createSolicitudCard(solicitudId, solicitud);
        solicitudesGrid.appendChild(card);
    });
    
    solicitudesSection.appendChild(solicitudesGrid);
    
    // Setup filtros
    setupSolicitudesFilters();
    
    console.log(`✅ ${solicitudesList.length} solicitudes cargadas`);
}

function createSolicitudCard(solicitudId, solicitud) {
    const card = document.createElement('div');
    card.className = 'order-card solicitud-card';
    card.setAttribute('data-solicitud-id', solicitudId);
    card.setAttribute('data-estado', solicitud.estado);
    
    const fechaSolicitud = new Date(solicitud.fecha);
    const fechaFormateada = fechaSolicitud.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    const inicial = solicitud.estudianteNombre.split(' ')[0][0] + 
                    (solicitud.estudianteNombre.split(' ')[1] ? solicitud.estudianteNombre.split(' ')[1][0] : '');
    
    const estadoClass = {
        'pendiente': 'pending',
        'aprobada': 'approved',
        'rechazada': 'rejected'
    }[solicitud.estado] || 'pending';
    
    const estadoTexto = {
        'pendiente': 'Pendiente',
        'aprobada': 'Aprobada',
        'rechazada': 'Rechazada'
    }[solicitud.estado] || 'Pendiente';
    
    const estadoColor = {
        'pendiente': '#e8f5e9',
        'aprobada': '#d4edda',
        'rechazada': '#ffebee'
    }[solicitud.estado] || '#e8f5e9';
    
    card.innerHTML = `
        <div class="order-header">
            <div>
                <h3>Solicitud: ${solicitud.becaNombre}</h3>
                <p class="order-date">${fechaFormateada}</p>
            </div>
            <div class="user-badge" style="background: ${estadoColor};">
                <div class="user-initial" style="background: #667eea;">${inicial}</div>
            </div>
        </div>
        <div class="order-items">
            <div class="order-item" style="display: block; padding: 15px; background: #f8f9fc; border-radius: 8px; border: none;">
                <div style="margin-bottom: 12px;">
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">👤 Estudiante:</h4>
                    <p style="color: #5c6f8c; font-size: 13px; line-height: 1.5;">${solicitud.estudianteNombre}</p>
                    <p style="color: #8a99b3; font-size: 12px;">Matrícula: ${solicitud.estudianteId}</p>
                </div>
                <div style="margin-bottom: 12px;">
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📄 Documentos Presentados:</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                        ${solicitud.documentos.slice(0, 3).map(doc => {
                            const nombresDocumentos = {
                                'acta-nacimiento': 'Acta de Nacimiento',
                                'curp': 'CURP',
                                'identificacion': 'Identificación',
                                'comprobante-domicilio': 'Comp. Domicilio',
                                'fotografia': 'Fotografía',
                                'cuenta-bancaria': 'Cuenta Bancaria'
                            };
                            return `
                                <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: white; border: 1px solid #e8eef5; border-radius: 6px; font-size: 12px; color: #5c6f8c;">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    ${nombresDocumentos[doc] || doc}
                                </span>
                            `;
                        }).join('')}
                        ${solicitud.documentos.length > 3 ? `
                            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 6px 12px; background: #667eea; color: white; border-radius: 6px; font-size: 12px; font-weight: 600;">
                                +${solicitud.documentos.length - 3} más
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div>
                    <h4 style="color: #19326c; font-size: 14px; font-weight: 600; margin-bottom: 8px;">📊 Estado:</h4>
                    <span class="item-status ${estadoClass}">${estadoTexto}</span>
                </div>
                ${solicitud.motivoRechazo ? `
                    <div style="margin-top: 12px; padding: 10px; background: #fff3cd; border-left: 3px solid #f59e0b; border-radius: 6px;">
                        <p style="color: #856404; font-size: 12px; margin: 0;"><strong>Motivo de rechazo:</strong> ${solicitud.motivoRechazo}</p>
                    </div>
                ` : ''}
            </div>
        </div>
        <div class="order-footer">
            <span class="order-requirements">${solicitud.documentos.length} documento(s) presentado(s)</span>
            <div class="order-actions">
                ${solicitud.estado === 'pendiente' ? `
                    <button class="btn-reject" onclick="rechazarSolicitud('${solicitudId}')" title="Rechazar">
                        ✕
                    </button>
                    <button class="btn-approve" onclick="aprobarSolicitud('${solicitudId}')" title="Aprobar">
                        ✓
                    </button>
                ` : solicitud.estado === 'aprobada' ? `
                    <button class="btn-status completed" style="cursor: default;">APROBADA</button>
                ` : `
                    <button class="btn-status rejected" style="cursor: default;">RECHAZADA</button>
                `}
            </div>
        </div>
    `;
    
    // Hacer clickeable para ver detalles
    card.style.cursor = 'pointer';
    card.addEventListener('click', function(e) {
        if (!e.target.closest('.btn-approve') && !e.target.closest('.btn-reject') && !e.target.closest('.btn-status')) {
            verDetallesSolicitud(solicitudId, solicitud);
        }
    });
    
    return card;
}

function setupSolicitudesFilters() {
    const filterButtons = document.querySelectorAll('.doc-filter-btn[data-filter]');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover active de todos
            filterButtons.forEach(b => b.classList.remove('active'));
            
            // Agregar active al clickeado
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterSolicitudes(filter);
        });
    });
}

function filterSolicitudes(filter) {
    const cards = document.querySelectorAll('.solicitud-card');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const estado = card.getAttribute('data-estado');
        
        if (filter === 'todas' || estado === filter) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    console.log(`🔍 Filtro aplicado: ${filter} - ${visibleCount} resultados`);
}

function aprobarSolicitud(solicitudId) {
    if (confirm('¿Estás seguro de aprobar esta solicitud?\n\nEl estudiante será notificado de la aprobación.')) {
        const solicitudesData = localStorage.getItem('tecnm_solicitudes');
        const solicitudes = solicitudesData ? JSON.parse(solicitudesData) : {};
        
        if (solicitudes[solicitudId]) {
            solicitudes[solicitudId].estado = 'aprobada';
            solicitudes[solicitudId].fechaResolucion = new Date().toISOString();
            
            localStorage.setItem('tecnm_solicitudes', JSON.stringify(solicitudes));
            
            showNotification('✅ Solicitud aprobada exitosamente', 'success');
            loadSolicitudes();
            
            console.log(`✓ Solicitud aprobada: ${solicitudId}`);
        }
    }
}

function rechazarSolicitud(solicitudId) {
    const motivo = prompt('¿Por qué deseas rechazar esta solicitud?\n\nEscribe el motivo (será visible para el estudiante):');
    
    if (motivo !== null && motivo.trim() !== '') {
        const solicitudesData = localStorage.getItem('tecnm_solicitudes');
        const solicitudes = solicitudesData ? JSON.parse(solicitudesData) : {};
        
        if (solicitudes[solicitudId]) {
            solicitudes[solicitudId].estado = 'rechazada';
            solicitudes[solicitudId].motivoRechazo = motivo.trim();
            solicitudes[solicitudId].fechaResolucion = new Date().toISOString();
            
            localStorage.setItem('tecnm_solicitudes', JSON.stringify(solicitudes));
            
            showNotification('❌ Solicitud rechazada', 'info');
            loadSolicitudes();
            
            console.log(`✓ Solicitud rechazada: ${solicitudId}`);
        }
    } else if (motivo !== null) {
        showNotification('Debes proporcionar un motivo para rechazar la solicitud', 'error');
    }
}

function verDetallesSolicitud(solicitudId, solicitud) {
    console.log('👁️ Ver detalles de solicitud:', solicitudId);
    
    const detalles = `
DETALLES DE LA SOLICITUD
========================
Beca: ${solicitud.becaNombre}
Estudiante: ${solicitud.estudianteNombre}
Matrícula: ${solicitud.estudianteId}
Estado: ${solicitud.estado}
Fecha: ${new Date(solicitud.fecha).toLocaleString('es-MX')}
Documentos: ${solicitud.documentos.length}
${solicitud.motivoRechazo ? '\nMotivo de rechazo: ' + solicitud.motivoRechazo : ''}
    `;
    
    console.log(detalles);
    showNotification('Detalles mostrados en consola (F12)', 'info');
}

// ========================================
// MÓDULO DE GESTIÓN DE BECAS
// ========================================

function setupBecasModule() {
    console.log('🔧 Configurando módulo de becas...');
    
    loadBecas();
    
    const btnCreateBeca = document.getElementById('btnCreateBeca');
    if (btnCreateBeca) {
        console.log('✓ Botón de crear beca encontrado');
        btnCreateBeca.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Clic en botón Crear Nueva Beca');
            openBecaModal();
        });
    } else {
        console.error('❌ No se encontró el botón btnCreateBeca');
    }
    
    const becaForm = document.getElementById('becaForm');
    if (becaForm) {
        console.log('✓ Formulario de beca encontrado');
        becaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Enviando formulario de beca');
            handleBecaSubmit(e);
        });
    } else {
        console.error('❌ No se encontró el formulario becaForm');
    }
    
    const searchBeca = document.getElementById('searchBeca');
    if (searchBeca) {
        searchBeca.addEventListener('input', filterBecas);
    }
    
    const fechaApertura = document.getElementById('becaFechaApertura');
    const fechaCierre = document.getElementById('becaFechaCierre');
    
    if (fechaApertura && fechaCierre) {
        fechaApertura.addEventListener('change', function() {
            fechaCierre.min = this.value;
        });
    }
    
    console.log('✅ Módulo de becas configurado completamente');
}

function getBecasFromStorage() {
    const becasData = localStorage.getItem('tecnm_becas');
    return becasData ? JSON.parse(becasData) : {};
}

function saveBecasToStorage(becas) {
    localStorage.setItem('tecnm_becas', JSON.stringify(becas));
}

function loadBecas() {
    const becas = getBecasFromStorage();
    const becasList = Object.entries(becas);
    
    const tableBody = document.getElementById('becasTableBody');
    const emptyState = document.getElementById('emptyStateBecas');
    const tableContainer = document.getElementById('becasTableContainer');
    const totalCount = document.getElementById('totalBecasCount');
    
    if (!tableBody) return;
    
    if (totalCount) {
        totalCount.textContent = becasList.length;
    }
    
    if (becasList.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    tableBody.innerHTML = '';
    
    becasList.forEach(([id, beca]) => {
        const row = document.createElement('tr');
        row.setAttribute('data-beca-id', id);
        
        const estado = getBecaEstado(beca.fechaApertura, beca.fechaCierre);
        
        row.innerHTML = `
            <td><strong>${beca.nombre}</strong></td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${beca.objetivo}</td>
            <td>${formatDateBeca(beca.fechaApertura)}</td>
            <td>${formatDateBeca(beca.fechaCierre)}</td>
            <td><span class="beca-status ${estado.class}">${estado.text}</span></td>
            <td>
                <div class="student-actions">
                    <button class="action-btn edit" onclick="viewBecaDetails('${id}')" title="Ver detalles">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                    </button>
                    <button class="action-btn reset" onclick="openEditBecaModal('${id}')" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteBeca('${id}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log(`✓ ${becasList.length} becas cargadas en la tabla`);
}

function getBecaEstado(fechaApertura, fechaCierre) {
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

function formatDateBeca(dateString) {
    const date = new Date(dateString + 'T00:00:00');
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('es-MX', options);
}

function openBecaModal() {
    console.log('📂 Abriendo modal de beca...');
    
    const modal = document.getElementById('becaModal');
    if (!modal) {
        console.error('❌ Modal becaModal no encontrado');
        showNotification('Error: Modal no encontrado', 'error');
        return;
    }
    
    const form = document.getElementById('becaForm');
    const title = document.getElementById('modalBecaTitle');
    const submitBtn = form.querySelector('.btn-save-student');
    
    form.reset();
    document.getElementById('becaId').value = '';
    title.textContent = 'Crear Nueva Beca';
    submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Crear Beca
    `;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('becaFechaApertura').min = today;
    document.getElementById('becaFechaCierre').min = today;
    
    modal.style.display = 'flex';
    console.log('✅ Modal abierto correctamente');
}

function closeBecaModal() {
    const modal = document.getElementById('becaModal');
    if (modal) modal.style.display = 'none';
}

function handleBecaSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('becaId').value;
    const nombre = document.getElementById('becaNombre').value.trim();
    const descripcion = document.getElementById('becaDescripcion').value.trim();
    const objetivo = document.getElementById('becaObjetivo').value.trim();
    const fechaApertura = document.getElementById('becaFechaApertura').value;
    const fechaCierre = document.getElementById('becaFechaCierre').value;
    
    const documentos = [];
    const checkboxes = document.querySelectorAll('.checkbox-documento input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        documentos.push(checkbox.value);
    });
    
    if (!nombre || !descripcion || !objetivo || !fechaApertura || !fechaCierre) {
        showNotification('Por favor completa todos los campos obligatorios', 'error');
        return;
    }
    
    if (documentos.length === 0) {
        showNotification('Debes seleccionar al menos un documento requerido', 'error');
        return;
    }
    
    if (new Date(fechaCierre) < new Date(fechaApertura)) {
        showNotification('La fecha de cierre debe ser posterior a la fecha de apertura', 'error');
        return;
    }
    
    const becas = getBecasFromStorage();
    const becaId = id || 'beca_' + Date.now();
    
    const becaData = {
        nombre,
        descripcion,
        objetivo,
        fechaApertura,
        fechaCierre,
        documentos,
        fechaCreacion: id ? becas[id].fechaCreacion : new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };
    
    becas[becaId] = becaData;
    saveBecasToStorage(becas);
    
    loadBecas();
    closeBecaModal();
    
    const mensaje = id ? 'Beca actualizada exitosamente' : 'Beca creada exitosamente';
    showNotification(`✅ ${mensaje}`, 'success');
    
    console.log(`✓ Beca ${id ? 'actualizada' : 'creada'}: ${nombre}`);
}

function viewBecaDetails(becaId) {
    const becas = getBecasFromStorage();
    const beca = becas[becaId];
    
    if (!beca) {
        showNotification('Beca no encontrada', 'error');
        return;
    }
    
    document.getElementById('detailNombre').textContent = beca.nombre;
    document.getElementById('detailDescripcion').textContent = beca.descripcion;
    document.getElementById('detailObjetivo').textContent = beca.objetivo;
    document.getElementById('detailFechaApertura').textContent = formatDateBeca(beca.fechaApertura);
    document.getElementById('detailFechaCierre').textContent = formatDateBeca(beca.fechaCierre);
    
    const documentosContainer = document.getElementById('detailDocumentos');
    const nombresDocumentos = {
        'acta-nacimiento': 'Acta de Nacimiento',
        'curp': 'CURP',
        'identificacion': 'Identificación Oficial',
        'comprobante-domicilio': 'Comprobante de Domicilio',
        'fotografia': 'Fotografía',
        'cuenta-bancaria': 'Cuenta Bancaria'
    };
    
    documentosContainer.innerHTML = beca.documentos.map(doc => `
        <span class="doc-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            ${nombresDocumentos[doc]}
        </span>
    `).join('');
    
    const estado = getBecaEstado(beca.fechaApertura, beca.fechaCierre);
    document.getElementById('detailEstado').innerHTML = `<span class="beca-status ${estado.class}">${estado.text}</span>`;
    
    document.getElementById('becaDetailsModal').style.display = 'flex';
}

function closeBecaDetailsModal() {
    document.getElementById('becaDetailsModal').style.display = 'none';
}

function openEditBecaModal(becaId) {
    const becas = getBecasFromStorage();
    const beca = becas[becaId];
    
    if (!beca) {
        showNotification('Beca no encontrada', 'error');
        return;
    }
    
    const modal = document.getElementById('becaModal');
    const form = document.getElementById('becaForm');
    const title = document.getElementById('modalBecaTitle');
    const submitBtn = form.querySelector('.btn-save-student');
    
    document.getElementById('becaId').value = becaId;
    document.getElementById('becaNombre').value = beca.nombre;
    document.getElementById('becaDescripcion').value = beca.descripcion;
    document.getElementById('becaObjetivo').value = beca.objetivo;
    document.getElementById('becaFechaApertura').value = beca.fechaApertura;
    document.getElementById('becaFechaCierre').value = beca.fechaCierre;
    
    document.querySelectorAll('.checkbox-documento input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = beca.documentos.includes(checkbox.value);
    });
    
    title.textContent = 'Editar Beca';
    submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
        </svg>
        Guardar Cambios
    `;
    
    modal.style.display = 'flex';
}

function deleteBeca(becaId) {
    const becas = getBecasFromStorage();
    const beca = becas[becaId];
    
    if (!beca) {
        showNotification('Beca no encontrada', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar la beca "${beca.nombre}"?\n\nEsta acción no se puede deshacer y la beca ya no aparecerá para los estudiantes.`)) {
        delete becas[becaId];
        saveBecasToStorage(becas);
        
        loadBecas();
        
        showNotification(`🗑️ Beca "${beca.nombre}" eliminada`, 'info');
        console.log(`✓ Beca eliminada: ${becaId}`);
    }
}

function filterBecas() {
    const searchTerm = document.getElementById('searchBeca').value.toLowerCase();
    const rows = document.querySelectorAll('#becasTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const nombre = row.children[0].textContent.toLowerCase();
        const objetivo = row.children[1].textContent.toLowerCase();
        
        if (nombre.includes(searchTerm) || objetivo.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    console.log(`🔍 Búsqueda de becas: "${searchTerm}" - ${visibleCount} resultados`);
}

// ========================================
// CARGAR INFORMACIÓN DEL ADMINISTRADOR
// ========================================

function loadAdminInfo() {
    const adminName = sessionStorage.getItem('adminName') || 'Administrador';
    const adminEmail = sessionStorage.getItem('adminEmail') || 'admin@tecnm.mx';
    
    const adminNameElement = document.getElementById('adminName');
    if (adminNameElement) {
        adminNameElement.textContent = adminName;
    }
    
    console.log(`✓ Sesión activa: ${adminName} (${adminEmail})`);
}

// ========================================
// NAVEGACIÓN DEL SIDEBAR
// ========================================

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionName = this.getAttribute('data-section');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            changeSection(sectionName);
        });
    });
    
    console.log('✓ Navegación configurada');
}

function changeSection(sectionName) {
    const allSections = document.querySelectorAll('.section-content');
    allSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.add('active');
        
        updateHeaderTitle(sectionName);
        
        if (sectionName === 'estudiantes') {
            console.log('📊 Recargando módulo de estudiantes...');
            setTimeout(() => {
                loadStudents();
            }, 100);
        } else if (sectionName === 'solicitudes') {
            console.log('📊 Recargando módulo de solicitudes...');
            setTimeout(() => {
                loadSolicitudes();
            }, 100);
        }
        
        console.log(`📍 Navegando a: ${sectionName.toUpperCase()}`);
        showNotification(`Navegando a ${getSectionTitle(sectionName)}`, 'info');
    }
}

function updateHeaderTitle(sectionName) {
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');
    
    const titles = {
        'dashboard': {
            title: 'Dashboard Administrativo',
            subtitle: 'Vista general del sistema'
        },
        'solicitudes': {
            title: 'Gestión de Solicitudes',
            subtitle: 'Administra las solicitudes de becas'
        },
        'estudiantes': {
            title: 'Base de Datos de Estudiantes',
            subtitle: 'Administra la información de estudiantes'
        },
        'becas': {
            title: 'Catálogo de Becas',
            subtitle: 'Gestiona los programas de becas disponibles'
        },
        'reportes': {
            title: 'Reportes y Estadísticas',
            subtitle: 'Genera reportes detallados del sistema'
        },
        'configuracion': {
            title: 'Configuración del Sistema',
            subtitle: 'Ajusta parámetros y configuraciones generales'
        }
    };
    
    if (titles[sectionName]) {
        if (pageTitle) pageTitle.textContent = titles[sectionName].title;
        if (pageSubtitle) pageSubtitle.textContent = titles[sectionName].subtitle;
    }
}

function getSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'Dashboard',
        'solicitudes': 'Solicitudes',
        'estudiantes': 'Estudiantes',
        'becas': 'Becas',
        'reportes': 'Reportes',
        'configuracion': 'Configuración'
    };
    return titles[sectionName] || sectionName;
}

// ========================================
// ACTUALIZAR ESTADÍSTICAS DEL DASHBOARD
// ========================================

function updateDashboardStats() {
    const stats = {
        totalStudents: 1234,
        pendingRequests: 47,
        approvedScholarships: 892,
        budget: '$2.5M'
    };
    
    animateValue('totalStudents', 0, stats.totalStudents, 2000);
    animateValue('pendingRequests', 0, stats.pendingRequests, 1500);
    animateValue('approvedScholarships', 0, stats.approvedScholarships, 2500);
    
    console.log('✓ Estadísticas actualizadas');
    console.log('📊 Dashboard Stats:', stats);
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current).toLocaleString();
    }, 16);
}

// ========================================
// SISTEMA DE NOTIFICACIONES
// ========================================

function setupNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            showNotification('Panel de notificaciones en desarrollo', 'info');
        });
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '12px';
    notification.style.color = 'white';
    notification.style.fontWeight = '600';
    notification.style.fontSize = '14px';
    notification.style.zIndex = '9999';
    notification.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
    notification.style.animation = 'slideIn 0.3s ease-out';
    notification.style.minWidth = '300px';
    
    if (type === 'success') {
        notification.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    } else if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

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
`;
document.head.appendChild(style);

// ========================================
// CERRAR SESIÓN
// ========================================

function setupLogout() {
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
                console.log('🚪 Cerrando sesión de administrador...');
                
                sessionStorage.clear();
                
                showNotification('Cerrando sesión...', 'info');
                setTimeout(() => {
                    window.location.href = 'Login.html';
                }, 1000);
            }
        });
    }
}

// ========================================
// ATAJOS DE TECLADO
// ========================================

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="dashboard"]').click();
    }
    
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="solicitudes"]').click();
    }
    
    if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="estudiantes"]').click();
    }
    
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="becas"]').click();
    }
    
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        document.querySelector('.nav-item[data-section="reportes"]').click();
    }
});

// ========================================
// MENSAJE DE BIENVENIDA Y DEBUG
// ========================================

setTimeout(() => {
    const adminName = sessionStorage.getItem('adminName') || 'Administrador';
    showNotification(`¡Bienvenido ${adminName}! 👋`, 'success');
    
    setTimeout(() => {
        const btn = document.getElementById('btnAddStudent');
        if (btn) {
            console.log('✅ DEBUG: Botón btnAddStudent existe en el DOM');
            console.log('📍 Ubicación del botón:', btn);
        } else {
            console.error('❌ DEBUG: Botón btnAddStudent NO existe en el DOM');
        }
    }, 1000);
}, 500);

// ========================================
// INFORMACIÓN EN CONSOLA
// ========================================

console.log('╔════════════════════════════════════════╗');
console.log('║     PANEL DE ADMINISTRACIÓN TECNM     ║');
console.log('╚════════════════════════════════════════╝');
console.log('\n🔐 ATAJOS DE TECLADO:');
console.log('  Ctrl + D → Dashboard');
console.log('  Ctrl + S → Solicitudes');
console.log('  Ctrl + E → Estudiantes');
console.log('  Ctrl + B → Becas');
console.log('  Ctrl + R → Reportes');
console.log('\n✓ Sistema listo para administrar');
console.log('════════════════════════════════════════\n');

// ========================================
// MÓDULO DE GESTIÓN DE ESTUDIANTES
// ========================================

function setupStudentsModule() {
    console.log('🔧 Configurando módulo de estudiantes...');
    
    loadStudents();
    
    const btnAddStudent = document.getElementById('btnAddStudent');
    if (btnAddStudent) {
        console.log('✓ Botón de agregar estudiante encontrado');
        btnAddStudent.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Clic en botón Registrar Estudiante');
            openStudentModal();
        });
    } else {
        console.error('❌ No se encontró el botón btnAddStudent');
    }
    
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        console.log('✓ Formulario de registro encontrado');
        studentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Enviando formulario de registro');
            handleStudentSubmit(e);
        });
    } else {
        console.error('❌ No se encontró el formulario studentForm');
    }
    
    const editStudentForm = document.getElementById('editStudentForm');
    if (editStudentForm) {
        editStudentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleEditStudentSubmit(e);
        });
    }
    
    const searchStudent = document.getElementById('searchStudent');
    if (searchStudent) {
        searchStudent.addEventListener('input', filterStudents);
    }
    
    const studentMatricula = document.getElementById('studentMatricula');
    if (studentMatricula) {
        studentMatricula.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            
            if (this.value.length === 8) {
                const students = getStudentsFromStorage();
                if (students[this.value]) {
                    this.style.borderColor = '#ef4444';
                    showNotification('Esta matrícula ya está registrada', 'error');
                } else {
                    this.style.borderColor = '#10b981';
                }
            }
        });
    }
    
    console.log('✅ Módulo de estudiantes configurado completamente');
}

function getStudentsFromStorage() {
    const studentsData = localStorage.getItem('tecnm_students');
    return studentsData ? JSON.parse(studentsData) : {};
}

function saveStudentsToStorage(students) {
    localStorage.setItem('tecnm_students', JSON.stringify(students));
}

function loadStudents() {
    const students = getStudentsFromStorage();
    const studentsList = Object.entries(students);
    
    const tableBody = document.getElementById('studentsTableBody');
    const emptyState = document.getElementById('emptyState');
    const tableContainer = document.querySelector('.students-table-container');
    const totalCount = document.getElementById('totalStudentsCount');
    
    if (!tableBody) return;
    
    if (totalCount) {
        totalCount.textContent = studentsList.length;
    }
    
    if (studentsList.length === 0) {
        if (tableContainer) tableContainer.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
    }
    
    if (tableContainer) tableContainer.style.display = 'block';
    if (emptyState) emptyState.style.display = 'none';
    
    tableBody.innerHTML = '';
    
    studentsList.forEach(([matricula, student]) => {
        const row = document.createElement('tr');
        row.setAttribute('data-matricula', matricula);
        
        row.innerHTML = `
            <td><strong>${matricula}</strong></td>
            <td>${student.name}</td>
            <td>${student.email}</td>
            <td>${student.registrationDate || 'N/A'}</td>
            <td><span class="student-status active">Activo</span></td>
            <td>
                <div class="student-actions">
                    <button class="action-btn edit" onclick="openEditStudentModal('${matricula}')" title="Editar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="action-btn reset" onclick="resetStudentPassword('${matricula}')" title="Restablecer contraseña">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path>
                        </svg>
                    </button>
                    <button class="action-btn delete" onclick="deleteStudent('${matricula}')" title="Eliminar">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                        </svg>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log(`✓ ${studentsList.length} estudiantes cargados en la tabla`);
}

function openStudentModal() {
    console.log('📂 Abriendo modal de registro de estudiante...');
    
    const modal = document.getElementById('studentModal');
    
    if (!modal) {
        console.error('❌ Modal studentModal no encontrado en el DOM');
        showNotification('Error: Modal no encontrado', 'error');
        return;
    }
    
    console.log('✓ Modal encontrado, mostrando...');
    modal.style.display = 'flex';
    
    const form = document.getElementById('studentForm');
    if (form) {
        form.reset();
        console.log('✓ Formulario limpiado');
    }
    
    const matriculaInput = document.getElementById('studentMatricula');
    if (matriculaInput) {
        matriculaInput.style.borderColor = '#e5e7eb';
    }
    
    console.log('✅ Modal abierto correctamente');
}

function closeStudentModal() {
    const modal = document.getElementById('studentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleStudentSubmit(e) {
    e.preventDefault();
    
    const matricula = document.getElementById('studentMatricula').value.trim();
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    
    if (matricula.length !== 8) {
        showNotification('La matrícula debe tener 8 dígitos', 'error');
        return;
    }
    
    const students = getStudentsFromStorage();
    
    if (students[matricula]) {
        showNotification('Esta matrícula ya está registrada', 'error');
        return;
    }
    
    const newStudent = {
        name: name,
        email: email,
        role: 'student',
        registrationDate: new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    };
    
    students[matricula] = newStudent;
    saveStudentsToStorage(students);
    
    localStorage.setItem(`userPassword_${matricula}`, 'tecnm2025');
    localStorage.setItem(`userEmail_${matricula}`, email);
    
    console.log(`✓ Estudiante guardado con email: ${email}`);
    
    loadStudents();
    closeStudentModal();
    
    showNotification(`✅ Estudiante ${name} registrado exitosamente con matrícula ${matricula}`, 'success');
    
    console.log(`✓ Nuevo estudiante registrado: ${matricula} - ${name} - ${email}`);
}

function openEditStudentModal(matricula) {
    const students = getStudentsFromStorage();
    const student = students[matricula];
    
    if (!student) {
        showNotification('Estudiante no encontrado', 'error');
        return;
    }
    
    document.getElementById('editStudentMatricula').value = matricula;
    document.getElementById('editStudentName').value = student.name;
    document.getElementById('editStudentEmail').value = student.email;
    
    const modal = document.getElementById('editStudentModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeEditStudentModal() {
    const modal = document.getElementById('editStudentModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleEditStudentSubmit(e) {
    e.preventDefault();
    
    const matricula = document.getElementById('editStudentMatricula').value;
    const name = document.getElementById('editStudentName').value.trim();
    const email = document.getElementById('editStudentEmail').value.trim();
    
    const students = getStudentsFromStorage();
    
    if (!students[matricula]) {
        showNotification('Estudiante no encontrado', 'error');
        return;
    }
    
    students[matricula].name = name;
    students[matricula].email = email;
    
    saveStudentsToStorage(students);
    localStorage.setItem(`userEmail_${matricula}`, email);
    
    console.log(`✓ Email actualizado para ${matricula}: ${email}`);
    
    loadStudents();
    closeEditStudentModal();
    
    showNotification(`✅ Información de ${name} actualizada correctamente`, 'success');
    
    console.log(`✓ Estudiante actualizado: ${matricula} - ${name} - ${email}`);
}

function deleteStudent(matricula) {
    const students = getStudentsFromStorage();
    const student = students[matricula];
    
    if (!student) {
        showNotification('Estudiante no encontrado', 'error');
        return;
    }
    
    if (confirm(`¿Estás seguro de eliminar al estudiante ${student.name} (${matricula})?\n\nEsta acción no se puede deshacer.`)) {
        delete students[matricula];
        saveStudentsToStorage(students);
        
        localStorage.removeItem(`userPassword_${matricula}`);
        localStorage.removeItem(`userEmail_${matricula}`);
        
        console.log(`✓ Datos eliminados para matrícula: ${matricula}`);
        
        loadStudents();
        
        showNotification(`🗑️ Estudiante ${student.name} eliminado`, 'info');
        
        console.log(`✓ Estudiante eliminado: ${matricula} - ${student.name}`);
    }
}

function resetStudentPassword(matricula) {
    const students = getStudentsFromStorage();
    const student = students[matricula];
    
    if (!student) {
        showNotification('Estudiante no encontrado', 'error');
        return;
    }
    
    if (confirm(`¿Restablecer la contraseña de ${student.name} a la contraseña por defecto?\n\nNueva contraseña: tecnm2025`)) {
        localStorage.setItem(`userPassword_${matricula}`, 'tecnm2025');
        
        showNotification(`🔑 Contraseña restablecida para ${student.name}`, 'success');
        
        console.log(`✓ Contraseña restablecida: ${matricula}`);
    }
}

function filterStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const rows = document.querySelectorAll('#studentsTableBody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
        const matricula = row.getAttribute('data-matricula').toLowerCase();
        const name = row.children[1].textContent.toLowerCase();
        const email = row.children[2].textContent.toLowerCase();
        
        if (matricula.includes(searchTerm) || name.includes(searchTerm) || email.includes(searchTerm)) {
            row.style.display = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
    
    console.log(`🔍 Búsqueda: "${searchTerm}" - ${visibleCount} resultados`);
}

window.openEditStudentModal = openEditStudentModal;
window.closeEditStudentModal = closeEditStudentModal;
window.deleteStudent = deleteStudent;
window.resetStudentPassword = resetStudentPassword;
window.closeStudentModal = closeStudentModal;

function migrateExistingStudentsEmails() {
    const predefinedStudents = {
        '20401234': 'juan.perez@tecnm.mx',
        '20401235': 'maria.lopez@tecnm.mx',
        '20401236': 'carlos.ramirez@tecnm.mx'
    };
    
    Object.entries(predefinedStudents).forEach(([matricula, email]) => {
        const emailKey = `userEmail_${matricula}`;
        if (!localStorage.getItem(emailKey)) {
            localStorage.setItem(emailKey, email);
            console.log(`✓ Email migrado para ${matricula}: ${email}`);
        }
    });
}

migrateExistingStudentsEmails();

// Hacer funciones globales para becas
window.openBecaModal = openBecaModal;
window.closeBecaModal = closeBecaModal;
window.viewBecaDetails = viewBecaDetails;
window.closeBecaDetailsModal = closeBecaDetails