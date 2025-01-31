function startTimer(seconds, task) {
    setTimeout(() => {
        alert(`Время для выполнения задачи: "${task}"!`);
    }, seconds * 1000);
}

function getTasksFromLocalStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function setTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function displayTasks(filter = 'all') {
    const containerList = document.querySelector('.containerList');
    containerList.innerHTML = '';

    const filteredTasks = getFilteredTasks(filter);

    filteredTasks.forEach(task => {
        const taskDiv = createTaskElement(task);
        containerList.appendChild(taskDiv);
        setupTaskEventListeners(task, taskDiv);
    });

    updateFilterButtons(filter);
}

function getFilteredTasks(filter) {
    return tasks.filter(task => {
        if (filter === 'completed') return task.completed;
        if (filter === 'unfulfilled') return !task.completed;
        return true;
    });
}

function createTaskElement(task) {
    const taskDiv = document.createElement('div');
    taskDiv.classList.add('task');
    taskDiv.innerHTML = `
        <div class="text-task-area">
            <input id="task-checkbox-${task.id}" class="task-checkbox" type="checkbox" ${task.completed ? 'checked' : ''}>
            <label for="task-checkbox-${task.id}" class="text-task ${task.completed ? 'completed' : ''}">${task.title}</label>
        </div>
        <div class="img-task-area ${task.completed ? 'hidden' : ''}">
            <img class="img-task" src="reminder.png" alt="reminder">
        </div>
        <button class="action-button" id="delete-task-${task.id}">Удалить</button>`;
    return taskDiv;
}

function setupTaskEventListeners(task, taskDiv) {
    const checkbox = taskDiv.querySelector('.task-checkbox');
    const label = taskDiv.querySelector('.text-task');
    const reminderArea = taskDiv.querySelector('.img-task-area');
    const deleteButton = taskDiv.querySelector(`#delete-task-${task.id}`);

    reminderArea.addEventListener('click', () => {
        handleReminderClick(task, taskDiv);
    });

    checkbox.addEventListener('change', () => {
        handleCheckboxChange(task, checkbox, label, reminderArea);
    });

    deleteButton.addEventListener('click', () => {
        handleDeleteTask(task);
    });
}

function handleReminderClick(task, taskDiv) {
    const taskLabel = taskDiv.querySelector('.text-task').innerText;
    const seconds = prompt(`Введите время в секундах для задачи: "${taskLabel}"`);

    if (seconds && !isNaN(seconds) && seconds > 0) {
        alert(`Таймер установлен на ${seconds} секунд(ы) для задачи: "${taskLabel}"`);
        startTimer(seconds, taskLabel);
    } else {
        alert('Пожалуйста, введите корректное число секунд.');
    }
}

function handleCheckboxChange(task, checkbox, label, reminderArea) {
    task.completed = checkbox.checked;
    if (task.completed) {
        label.classList.add('completed');
        reminderArea.classList.add('hidden');
    } else {
        label.classList.remove('completed');
        reminderArea.classList.remove('hidden');
    }
    setTasksToLocalStorage();
}

function handleDeleteTask(task) {
    tasks = tasks.filter(t => t.id !== task.id);
    setTasksToLocalStorage();
    displayTasks();
}

function updateFilterButtons(activeFilter) {
    const filterButtons = document.querySelectorAll('.filtr-button');
    filterButtons.forEach(button => {
        button.classList.toggle('active', button.id === activeFilter);
    });
}

function addFilterButtonListeners() {
    function addFilterButton(id, filter) {
        document.getElementById(id).addEventListener('click', () => {
            displayTasks(filter);
        });
    }

    addFilterButton('all', 'all');
    addFilterButton('completed', 'completed');
    addFilterButton('unfulfilled', 'unfulfilled');
}

addFilterButtonListeners();

document.getElementById('add-button').addEventListener('click', () => {
    const taskInput = document.getElementById('add-task');
    const taskTitle = taskInput.value.trim();

    if (!taskTitle) {
        alert('Пожалуйста, введите название задачи.');
        return; 
    }

    if (taskTitle.length > 50) {
        alert('Название задачи не должно превышать 50 символов.');
        return; 
    }

    const newTask = {
        id: Date.now(),
        title: taskTitle,
        completed: false
    };

    tasks.push(newTask);
    setTasksToLocalStorage();
    displayTasks();
    taskInput.value = ''; 
});

let tasks = getTasksFromLocalStorage();
if (tasks.length === 0) {
    fetch('https://jsonplaceholder.typicode.com/todos')
        .then(response => {
            if (!response.ok) throw new Error('Сетевая ошибка!');
            return response.json();
        })
        .then(fetchedTasks => {
            const shuffledTasks = fetchedTasks.sort(() => 0.5 - Math.random());
            const randomTasks = shuffledTasks.slice(0, 5).map(task => ({
                id: task.id,
                title: task.title,
                completed: false
            }));
            tasks.push(...randomTasks);
            setTasksToLocalStorage();
            displayTasks();
        })
        .catch(error => {
            console.error('Ошибка при получении задач:', error);
        });
}else{
    displayTasks();
}