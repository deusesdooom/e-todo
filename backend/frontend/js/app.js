let currentUser = null;
let currentFilter = 'all';
let currentView = 'grid';
let currentTheme = 'dark';
let todos = [];
let editingTodoId = null;
let draggedTodo = null;

const API_URL = 'http://localhost:5000/api';

const DEMO_MODE = false;

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    if (token) {
        fetchUserData();
    }

    const savedTheme = localStorage.getItem('theme') || 'dark';
    changeTheme(savedTheme);
    
    const savedView = localStorage.getItem('view') || 'grid';
    currentView = savedView;

    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('todoDueTime').min = now.toISOString().slice(0, 16);
});

function showLogin() {
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('registerPage').classList.add('hidden');
}

function showRegister() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.remove('hidden');
}

function showDashboard() {
    document.getElementById('loginPage').classList.add('hidden');
    document.getElementById('registerPage').classList.add('hidden');
    document.getElementById('dashboard').classList.add('active');
    
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.firstname + ' ' + currentUser.name;
        document.getElementById('userAvatar').textContent = currentUser.firstname.charAt(0).toUpperCase();
    }
    
    loadTodos();
}

async function fetchUserData() {
    if (DEMO_MODE) {
        currentUser = {
            id: 1,
            email: 'demo@etodo.com',
            name: 'User',
            firstname: 'Demo'
        };
        showDashboard();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            currentUser = await response.json();
            showDashboard();
        } else {
            logout();
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        showAlert('loginAlert', 'Error connecting to server', 'error');
    }
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (DEMO_MODE) {
        localStorage.setItem('token', 'demo-token');
        showAlert('loginAlert', 'Login successful! (Demo Mode)', 'success');
        setTimeout(() => fetchUserData(), 1000);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            showAlert('loginAlert', 'Login successful!', 'success');
            setTimeout(() => fetchUserData(), 1000);
        } else {
            showAlert('loginAlert', data.msg || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('loginAlert', 'Error connecting to server', 'error');
    }
});

document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const firstname = document.getElementById('regFirstname').value;
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    
    if (DEMO_MODE) {
        showAlert('registerAlert', 'Account created successfully! (Demo Mode)', 'success');
        setTimeout(showLogin, 1500);
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstname, name, email, password })
        });

        const data = await response.json();

        if (response.ok) {
            showAlert('registerAlert', 'Account created successfully!', 'success');
            setTimeout(showLogin, 1500);
        } else {
            showAlert('registerAlert', data.msg || 'Registration failed', 'error');
        }
    } catch (error) {
        console.error('Registration error:', error);
        showAlert('registerAlert', 'Error connecting to server', 'error');
    }
});

function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    todos = [];
    document.getElementById('dashboard').classList.remove('active');
    showLogin();
}

function showAlert(elementId, message, type) {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => alertDiv.innerHTML = '', 3000);
}

async function loadTodos() {
    if (DEMO_MODE) {
        todos = [
            {
                id: 1,
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the E-TODO project',
                created_at: '2025-11-01 10:00:00',
                due_time: '2025-11-15 18:00:00',
                status: 'in progress',
                user_id: 1
            },
            {
                id: 2,
                title: 'Review pull requests',
                description: 'Check and approve pending pull requests from team members',
                created_at: '2025-11-05 09:00:00',
                due_time: '2025-11-10 17:00:00',
                status: 'todo',
                user_id: 1
            },
            {
                id: 3,
                title: 'Deploy to production',
                description: 'Final deployment of the application to production environment',
                created_at: '2025-10-28 14:00:00',
                due_time: '2025-11-08 23:59:00',
                status: 'done',
                user_id: 1
            },
            {
                id: 4,
                title: 'Update database schema',
                description: 'Add new fields to user table for profile information',
                created_at: '2025-11-06 11:00:00',
                due_time: '2025-11-12 16:00:00',
                status: 'not started',
                user_id: 1
            }
        ];
        renderTodos();
        updateStats();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/user/todos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            todos = await response.json();
            renderTodos();
            updateStats();
        } else {
            const data = await response.json();
            console.error('Error loading todos:', data.msg);
        }
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

function renderTodos() {
    const container = document.getElementById('todosContainer');
    let filteredTodos = todos;
    
    if (currentFilter !== 'all') {
        filteredTodos = todos.filter(t => t.status === currentFilter);
    }
    
    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3>No tasks found</h3>
                <p>Create your first task to get started</p>
            </div>
        `;
        return;
    }
    
    if (currentView === 'grid') {
        renderGridView(filteredTodos, container);
    } else if (currentView === 'list') {
        renderListView(filteredTodos, container);
    } else if (currentView === 'kanban') {
        renderKanbanView(filteredTodos, container);
    } else if (currentView === 'timeline') {
        renderTimelineView(filteredTodos, container);
    }
}

function renderGridView(filteredTodos, container) {
    container.className = 'todos-grid';
    container.innerHTML = filteredTodos.map(todo => createTodoCard(todo)).join('');
    attachDragListeners();
}

function renderListView(filteredTodos, container) {
    container.className = 'todos-list';
    container.innerHTML = filteredTodos.map(todo => createTodoCard(todo)).join('');
    attachDragListeners();
}

function renderKanbanView(filteredTodos, container) {
    container.className = 'todos-kanban';
    const statuses = ['not started', 'todo', 'in progress', 'done'];
    
    container.innerHTML = statuses.map(status => {
        const statusTodos = filteredTodos.filter(t => t.status === status);
        return `
            <div class="kanban-column" data-status="${status}">
                <h3>${status.toUpperCase()}</h3>
                ${statusTodos.map(todo => createTodoCard(todo)).join('') || '<p style="color: var(--text-secondary); text-align: center;">No tasks</p>'}
            </div>
        `;
    }).join('');
    attachDragListeners();
}

function renderTimelineView(filteredTodos, container) {
    container.className = 'todos-timeline';
    const sortedTodos = [...filteredTodos].sort((a, b) => new Date(a.due_time) - new Date(b.due_time));
    
    let lastDate = '';
    container.innerHTML = sortedTodos.map(todo => {
        const dueDate = new Date(todo.due_time).toLocaleDateString();
        let dateHeader = '';
        
        if (dueDate !== lastDate) {
            dateHeader = `<div class="timeline-date">${formatDate(todo.due_time).split(',')[0]}</div>`;
            lastDate = dueDate;
        }
        
        return `
            <div class="timeline-item">
                ${dateHeader}
                ${createTodoCard(todo)}
            </div>
        `;
    }).join('');
    attachDragListeners();
}

function createTodoCard(todo) {
    return `
        <div class="todo-card" draggable="true" data-id="${todo.id}">
            <div class="todo-header">
                <div>
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                </div>
                <div class="todo-actions">
                    <button class="icon-btn" onclick="editTodo(${todo.id})" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="deleteTodo(${todo.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="todo-description">${escapeHtml(todo.description)}</div>
            <div class="todo-meta">
                <div class="todo-date">📅 ${formatDate(todo.due_time)}</div>
                <span class="status-badge status-${todo.status.replace(' ', '-')}">${todo.status}</span>
            </div>
        </div>
    `;
}

function changeView(view) {
    currentView = view;
    localStorage.setItem('view', view);
    
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderTodos();
}

function changeTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));
    const themeButtons = document.querySelectorAll('.theme-btn');
    themeButtons.forEach(btn => {
        if (btn.textContent.toLowerCase().includes(theme.replace('-', ' '))) {
            btn.classList.add('active');
        }
    });
}

function attachDragListeners() {
    const cards = document.querySelectorAll('.todo-card');
    
    cards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);
        card.addEventListener('dragend', handleDragEnd);
    });
}

function handleDragStart(e) {
    draggedTodo = parseInt(e.target.dataset.id);
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.target.closest('.todo-card')?.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    const targetCard = e.target.closest('.todo-card');
    if (!targetCard) return;
    
    targetCard.classList.remove('drag-over');
    
    const targetId = parseInt(targetCard.dataset.id);
    if (draggedTodo !== targetId) {
        if (currentView === 'kanban') {
            const column = targetCard.closest('.kanban-column');
            if (column) {
                const newStatus = column.dataset.status;
                const todo = todos.find(t => t.id === draggedTodo);
                if (todo) {
                    todo.status = newStatus;
                    updateTodoOnServer(draggedTodo, { status: newStatus });
                    renderTodos();
                }
            }
        } else {
            const draggedIndex = todos.findIndex(t => t.id === draggedTodo);
            const targetIndex = todos.findIndex(t => t.id === targetId);
            const [removed] = todos.splice(draggedIndex, 1);
            todos.splice(targetIndex, 0, removed);
            renderTodos();
        }
    }
    
    return false;
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.todo-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

async function updateTodoOnServer(todoId, updates) {
    if (DEMO_MODE) return;
    
    try {
        const token = localStorage.getItem('token');
        const todo = todos.find(t => t.id === todoId);
        
        await fetch(`${API_URL}/todos/${todoId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...todo, ...updates })
        });
    } catch (error) {
        console.error('Error updating todo:', error);
    }
}

function updateStats() {
    document.getElementById('totalTasks').textContent = todos.length;
    document.getElementById('inProgressTasks').textContent = todos.filter(t => t.status === 'in progress').length;
    document.getElementById('completedTasks').textContent = todos.filter(t => t.status === 'done').length;
    document.getElementById('notStartedTasks').textContent = todos.filter(t => t.status === 'not started').length;
}

function filterTodos(status) {
    currentFilter = status;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    renderTodos();
}

function searchTodos(query) {
    const container = document.getElementById('todosContainer');
    const filteredTodos = todos.filter(t => 
        t.title.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredTodos.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Try adjusting your search</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTodos.map(todo => `
        <div class="todo-card">
            <div class="todo-header">
                <div>
                    <div class="todo-title">${escapeHtml(todo.title)}</div>
                </div>
                <div class="todo-actions">
                    <button class="icon-btn" onclick="editTodo(${todo.id})" title="Edit">✏️</button>
                    <button class="icon-btn" onclick="deleteTodo(${todo.id})" title="Delete">🗑️</button>
                </div>
            </div>
            <div class="todo-description">${escapeHtml(todo.description)}</div>
            <div class="todo-meta">
                <div class="todo-date">📅 ${formatDate(todo.due_time)}</div>
                <span class="status-badge status-${todo.status.replace(' ', '-')}">${todo.status}</span>
            </div>
        </div>
    `).join('');
}

function openAddModal() {
    editingTodoId = null;
    document.getElementById('modalTitle').textContent = 'Add New Task';
    document.getElementById('todoForm').reset();
    document.getElementById('todoModal').classList.add('active');
}

function editTodo(id) {
    editingTodoId = id;
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Task';
    document.getElementById('todoTitle').value = todo.title;
    document.getElementById('todoDescription').value = todo.description;
    document.getElementById('todoDueTime').value = todo.due_time.replace(' ', 'T').slice(0, 16);
    document.getElementById('todoStatus').value = todo.status;
    document.getElementById('todoModal').classList.add('active');
}

function closeModal() {
    document.getElementById('todoModal').classList.remove('active');
    document.getElementById('todoForm').reset();
    editingTodoId = null;
}

async function deleteTodo(id) {
    // IMPORTANT: Replacing alert/confirm with a safer UI method is recommended, 
    // but sticking to the original code structure for this conflict resolution.
    // If running in an iFrame, this confirmation will not show.
    if (!confirm('Are you sure you want to delete this task?')) return; 
    
    if (DEMO_MODE) {
        todos = todos.filter(t => t.id !== id);
        renderTodos();
        updateStats();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/todos/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            todos = todos.filter(t => t.id !== id);
            renderTodos();
            updateStats();
        } else {
            const data = await response.json();
            alert(data.msg || 'Error deleting task');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Error deleting task');
    }
}

document.getElementById('todoForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const todoData = {
        title: document.getElementById('todoTitle').value,
        description: document.getElementById('todoDescription').value,
        due_time: document.getElementById('todoDueTime').value.replace('T', ' ') + ':00',
        status: document.getElementById('todoStatus').value,
        user_id: currentUser.id
    };
    
    if (DEMO_MODE) {
        if (editingTodoId) {
            const todo = todos.find(t => t.id === editingTodoId);
            Object.assign(todo, todoData);
        } else {
            const newTodo = {
                id: Math.max(...todos.map(t => t.id), 0) + 1,
                ...todoData,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            };
            todos.push(newTodo);
        }
        renderTodos();
        updateStats();
        closeModal();
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        let response;

        if (editingTodoId) {
            response = await fetch(`${API_URL}/todos/${editingTodoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoData)
            });
        } else {
            response = await fetch(`${API_URL}/todos`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(todoData)
            });
        }

        if (response.ok) {
            closeModal();
            await loadTodos();
        } else {
            const data = await response.json();
            alert(data.msg || 'Error saving task');
        }
    } catch (error) {
        console.error('Error saving todo:', error);
        alert('Error saving task');
    }
});

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('todoModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeModal();
    }
});