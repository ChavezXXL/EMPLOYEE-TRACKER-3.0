document.addEventListener('DOMContentLoaded', function () {
  // Initialize variables
  let employees = JSON.parse(localStorage.getItem('employees')) || [];
  let timesheets = JSON.parse(localStorage.getItem('timesheets')) || {};
  let timers = JSON.parse(localStorage.getItem('timers')) || {};
  let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
  let settings = JSON.parse(localStorage.getItem('settings')) || {
      companyName: 'SC DEBURRING',
      companyAddress: '12734 Branford St STE 17, Pacoima, CA',
      adminPIN: '2061',
      businessStartTime: '09:00',
      businessEndTime: '17:00',
      overtimeThreshold: 8,
      overtimeMultiplier: 1.5,
      minimumBreakDuration: 30,
      maximumBreakDuration: 60,
      holidays: [],
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      payrollFrequency: 'weekly',
      enableNotifications: false,
      notificationEmail: '',
      exportFormat: 'csv',
      language: 'en'
  };
  let activeEmployeeId = null;
  let currentInterval = null;

  // Get elements by ID
  const addEmployeeButton = document.getElementById('addEmployeeButton');
  const addEmployeeSubmitButton = document.getElementById('addEmployeeSubmit');
  const employeeList = document.getElementById('employees');
  const employeeManagementList = document.getElementById('employeeManagementList');
  const dashboardContent = document.getElementById('dashboardContent');
  const overviewContent = document.getElementById('overviewContent');
  const employeeManagementContent = document.getElementById('employeeManagementContent');
  const timesheetTableBody = document.querySelector('#timesheetTable tbody');
  const dateFilter = document.getElementById('dateFilter');
  const employeeFilter = document.getElementById('employeeFilter');
  const timeFilter = document.getElementById('timeFilter');
  const customCalendar = document.getElementById('customCalendar');
  const menuIcon = document.getElementById('menuIcon');
  const currentDateElement = document.getElementById('currentDate');
  const currentTimeElement = document.getElementById('currentTime');

  const clockInModal = document.getElementById('clockInModal');
  const employeeNameModal = document.getElementById('employeeNameModal');
  const clockCircle = document.querySelector('.clock-circle');
  const clockInText = document.getElementById('clockInText');
  const breakButton = document.getElementById('breakButton');
  const timerElement = document.getElementById('timer');
  const closeModalButtons = document.getElementsByClassName('close');

  const passwordModal = document.getElementById('passwordModal');
  const passwordInput = document.getElementById('passwordInput');
  const submitPasswordButton = document.getElementById('submitPassword');

  const editEmployeeModal = document.getElementById('editEmployeeModal');
  const editEmployeeId = document.getElementById('editEmployeeId');
  const editEmployeeName = document.getElementById('editEmployeeName');
  const editEmployeeRole = document.getElementById('editEmployeeRole');
  const editEmployeePayRate = document.getElementById('editEmployeePayRate');
  const saveEmployeeChanges = document.getElementById('saveEmployeeChanges');

  const addEmployeeModal = document.getElementById('addEmployeeModal');
  const addEmployeeName = document.getElementById('addEmployeeName');
  const addEmployeeId = document.getElementById('addEmployeeId');
  const addEmployeeRole = document.getElementById('addEmployeeRole');
  const addEmployeePayRate = document.getElementById('addEmployeePayRate');

  const editTimesheetModal = document.getElementById('editTimesheetModal');
  const editStartTime = document.getElementById('editStartTime');
  const editEndTime = document.getElementById('editEndTime');
  const editBreakStartTime = document.getElementById('editBreakStartTime');
  const editBreakEndTime = document.getElementById('editBreakEndTime');
  const saveTimesheetChanges = document.getElementById('saveTimesheetChanges');

  const detailedViewModal = document.getElementById('detailedViewModal');
  const detailedViewEmployeeName = document.getElementById('detailedViewEmployeeName');
  const detailedViewEmployeeRole = document.getElementById('detailedViewEmployeeRole');
  const detailedViewTotalHours = document.getElementById('detailedViewTotalHours');
  const detailedViewTotalPay = document.getElementById('detailedViewTotalPay');
  const detailedViewDaysWorked = document.getElementById('detailedViewDaysWorked');

  const printButton = document.getElementById('overviewPrintButton');
  const emailButton = document.getElementById('emailButton');
  const emailModal = document.getElementById('emailModal');
  const emailAddressInput = document.getElementById('emailAddress');
  const sendEmailButton = document.getElementById('sendEmailButton');

  const settingsContent = document.getElementById('settingsContent');
  const companyNameInput = document.getElementById('companyName');
  const companyAddressInput = document.getElementById('companyAddress');
  const adminPINInput = document.getElementById('adminPIN');

  const businessStartTimeInput = document.getElementById('businessStartTime');
  const businessEndTimeInput = document.getElementById('businessEndTime');
  const overtimeThresholdInput = document.getElementById('overtimeThreshold');
  const overtimeMultiplierInput = document.getElementById('overtimeMultiplier');
  const minimumBreakDurationInput = document.getElementById('minimumBreakDuration');
  const maximumBreakDurationInput = document.getElementById('maximumBreakDuration');
  const timeZoneInput = document.getElementById('timeZone');
  const payrollFrequencyInput = document.getElementById('payrollFrequency');
  const enableNotificationsInput = document.getElementById('enableNotifications');
  const notificationEmailInput = document.getElementById('notificationEmail');
  const exportFormatInput = document.getElementById('exportFormat');
  const languageInput = document.getElementById('language');
  const saveSettingsButton = document.getElementById('saveSettingsButton');

  const exportCSVButton = document.getElementById('exportCSVButton');

  const errorModal = document.getElementById('errorModal');
  const errorMessageElement = document.getElementById('errorMessage');

  // Event listeners
  menuIcon.addEventListener('click', openNav);

  addEmployeeButton.addEventListener('click', () => {
      addEmployeeModal.style.display = 'flex';
  });

  addEmployeeSubmitButton.addEventListener('click', addEmployee);

  submitPasswordButton.addEventListener('click', checkPassword);

  saveEmployeeChanges.addEventListener('click', saveEmployee);

  saveTimesheetChanges.addEventListener('click', saveTimesheet);

  saveSettingsButton.addEventListener('click', saveSettings);

  exportCSVButton.addEventListener('click', exportToCSV);

  Array.from(closeModalButtons).forEach(button => button.addEventListener('click', () => {
      button.closest('.modal').style.display = 'none';
      clearInterval(currentInterval);
  }));

  window.addEventListener('click', (event) => {
      if (event.target == passwordModal) {
          passwordModal.style.display = 'none';
      }
      if (event.target == clockInModal) {
          clockInModal.style.display = 'none';
          clearInterval(currentInterval);
      }
      if (event.target == editEmployeeModal) {
          editEmployeeModal.style.display = 'none';
      }
      if (event.target == addEmployeeModal) {
          addEmployeeModal.style.display = 'none';
      }
      if (event.target == editTimesheetModal) {
          editTimesheetModal.style.display = 'none';
      }
      if (event.target == detailedViewModal) {
          detailedViewModal.style.display = 'none';
      }
      if (event.target == emailModal) {
          emailModal.style.display = 'none';
      }
      if (event.target == errorModal) {
          errorModal.style.display = 'none';
      }
  });

  dateFilter.addEventListener('change', () => {
      displayTimesheet();
      updateCalendar();
  });
  employeeFilter.addEventListener('change', displayTimesheet);
  timeFilter.addEventListener('change', displayTimesheet);

  if (printButton) {
      printButton.addEventListener('click', generatePayDaySheet);
  }

  if (emailButton) {
      emailButton.addEventListener('click', () => {
          emailModal.style.display = 'flex';
      });
  }

  sendEmailButton.addEventListener('click', sendWeeklyEmail);

  // Add Enter key submission for forms
  passwordInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
          checkPassword();
      }
  });

  addEmployeeModal.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
          addEmployee();
      }
  });

  editEmployeeModal.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
          saveEmployee();
      }
  });

  emailAddressInput.addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
          sendWeeklyEmail();
      }
  });

  const prevWeekButton = document.getElementById('prevWeekButton');
  const nextWeekButton = document.getElementById('nextWeekButton');

  prevWeekButton.addEventListener('click', function () {
      changeWeek(-1);
  });

  nextWeekButton.addEventListener('click', function () {
      changeWeek(1);
  });

  // Menu functionality
  function openNav() {
      document.getElementById("myNav").style.width = "100%";
  }

  function closeNav() {
      document.getElementById("myNav").style.width = "0%";
  }

  // Update the PIN based on settings
  function checkPassword() {
      const pin = passwordInput.value;
      if (pin === settings.adminPIN) {
          passwordModal.style.display = 'none';
          showOverview();
      } else {
          showError('Incorrect PIN. Please try again.');
      }
  }

  // Navigation between sections
  function showDashboard() {
      dashboardContent.style.display = 'block';
      employeeManagementContent.style.display = 'none';
      overviewContent.style.display = 'none';
      settingsContent.style.display = 'none';
      document.getElementById('dateTime').style.display = 'block';
      addEmployeeButton.style.display = 'none';
      closeNav();
  }

  function showEmployeeManagement() {
      dashboardContent.style.display = 'none';
      employeeManagementContent.style.display = 'block';
      overviewContent.style.display = 'none';
      settingsContent.style.display = 'none';
      document.getElementById('dateTime').style.display = 'none';
      addEmployeeButton.style.display = 'block';
      closeNav();
  }

  function showOverview() {
      setDateToToday();
      dashboardContent.style.display = 'none';
      employeeManagementContent.style.display = 'none';
      overviewContent.style.display = 'block';
      settingsContent.style.display = 'none';
      document.getElementById('dateTime').style.display = 'none';
      addEmployeeButton.style.display = 'none';
      closeNav();
      displayTimesheet();
      updateCalendar();
  }

  function showSettings() {
      dashboardContent.style.display = 'none';
      employeeManagementContent.style.display = 'none';
      overviewContent.style.display = 'none';
      settingsContent.style.display = 'block';
      document.getElementById('dateTime').style.display = 'none';
      addEmployeeButton.style.display = 'none';
      closeNav();
      loadSettings();
  }

  function showPasswordModal() {
      passwordModal.style.display = 'flex';
      closeNav();
  }

  // Expose functions to the global scope
  window.openNav = openNav;
  window.closeNav = closeNav;
  window.checkPassword = checkPassword;
  window.showDashboard = showDashboard;
  window.showEmployeeManagement = showEmployeeManagement;
  window.showOverview = showOverview;
  window.showPasswordModal = showPasswordModal;
  window.showSettings = showSettings;
  window.closeDetailedViewModal = closeDetailedViewModal;
  window.closeErrorModal = closeErrorModal;

  // Load settings into form
  function loadSettings() {
      companyNameInput.value = settings.companyName;
      companyAddressInput.value = settings.companyAddress;
      adminPINInput.value = settings.adminPIN;
      businessStartTimeInput.value = settings.businessStartTime || '09:00';
      businessEndTimeInput.value = settings.businessEndTime || '17:00';
      overtimeThresholdInput.value = settings.overtimeThreshold;
      overtimeMultiplierInput.value = settings.overtimeMultiplier;
      minimumBreakDurationInput.value = settings.minimumBreakDuration;
      maximumBreakDurationInput.value = settings.maximumBreakDuration;
      timeZoneInput.value = settings.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
      payrollFrequencyInput.value = settings.payrollFrequency || 'weekly';
      enableNotificationsInput.checked = settings.enableNotifications || false;
      notificationEmailInput.value = settings.notificationEmail || '';
      exportFormatInput.value = settings.exportFormat || 'csv';
      languageInput.value = settings.language || 'en';
  }

  function saveSettings() {
      settings.companyName = companyNameInput.value;
      settings.companyAddress = companyAddressInput.value;
      settings.adminPIN = adminPINInput.value;
      settings.businessStartTime = businessStartTimeInput.value;
      settings.businessEndTime = businessEndTimeInput.value;
      settings.overtimeThreshold = parseFloat(overtimeThresholdInput.value);
      settings.overtimeMultiplier = parseFloat(overtimeMultiplierInput.value);
      settings.minimumBreakDuration = parseInt(minimumBreakDurationInput.value);
      settings.maximumBreakDuration = parseInt(maximumBreakDurationInput.value);
      settings.timeZone = timeZoneInput.value;
      settings.payrollFrequency = payrollFrequencyInput.value;
      settings.enableNotifications = enableNotificationsInput.checked;
      settings.notificationEmail = notificationEmailInput.value;
      settings.exportFormat = exportFormatInput.value;
      settings.language = languageInput.value;

      localStorage.setItem('settings', JSON.stringify(settings));
      alert('Settings saved successfully.');
  }

  // Add Employee Functionality
  function addEmployee() {
      const name = addEmployeeName.value;
      const id = addEmployeeId.value;
      const payRate = addEmployeePayRate.value;
      const role = addEmployeeRole.value;
      if (name && id && payRate && role) {
          employees.push({ name, id, payRate: parseFloat(payRate), role });
          timesheets[id] = [];
          timers[id] = { mainTime: 0, breakTime: 0, startTime: null, breakStartTime: null, isRunning: false, isOnBreak: false };
          updateLocalStorage();
          updateEmployeeList();
          updateEmployeeManagementList();
          updateEmployeeFilter();
          addEmployeeModal.style.display = 'none';
          addEmployeeName.value = '';
          addEmployeeId.value = '';
          addEmployeeRole.value = '';
          addEmployeePayRate.value = '';
      } else {
          showError('Please fill out all fields.');
      }
  }

  function deleteEmployee(id) {
      if (confirm('Are you sure you want to delete this employee?')) {
          employees = employees.filter(employee => employee.id !== id);
          delete timesheets[id];
          delete timers[id];
          updateLocalStorage();
          updateEmployeeList();
          updateEmployeeManagementList();
          updateEmployeeFilter();
      }
  }

  function editEmployee(id) {
      const employee = employees.find(emp => emp.id === id);
      if (employee) {
          editEmployeeId.value = employee.id;
          editEmployeeName.value = employee.name;
          editEmployeeRole.value = employee.role;
          editEmployeePayRate.value = employee.payRate;
          editEmployeeModal.style.display = 'flex';
      }
  }

  function saveEmployee() {
      const id = editEmployeeId.value;
      const employee = employees.find(emp => emp.id === id);
      if (employee) {
          employee.name = editEmployeeName.value;
          employee.role = editEmployeeRole.value;
          employee.payRate = parseFloat(editEmployeePayRate.value);
          updateLocalStorage();
          updateEmployeeList();
          updateEmployeeManagementList();
          updateEmployeeFilter();
          editEmployeeModal.style.display = 'none';
      }
  }

  function saveTimesheet() {
      const id = editTimesheetModal.getAttribute('data-employee-id');
      const date = editTimesheetModal.getAttribute('data-date');
      const startTime = editStartTime.value;
      const endTime = editEndTime.value;
      const breakStartTime = editBreakStartTime.value;
      const breakEndTime = editBreakEndTime.value;

      if (timesheets[id]) {
          if (startTime) {
              updateTimesheetEntry(id, 'clockin', date, startTime);
          }
          if (endTime) {
              updateTimesheetEntry(id, 'clockout', date, endTime);
          }
          if (breakStartTime) {
              updateTimesheetEntry(id, 'startbreak', date, breakStartTime);
          }
          if (breakEndTime) {
              updateTimesheetEntry(id, 'endbreak', date, breakEndTime);
          }

          updateLocalStorage();
          displayTimesheet();
          editTimesheetModal.style.display = 'none';
      }
  }

  function updateTimesheetEntry(id, type, dateString, time) {
      const timestamp = new Date(`${dateString} ${time}`).getTime();
      const employeeTimesheet = timesheets[id] || [];
      let entry = employeeTimesheet.find(entry => entry.type === type && new Date(entry.timestamp).toDateString() === dateString);
      if (entry) {
          entry.timestamp = timestamp;
      } else {
          employeeTimesheet.push({ type, timestamp });
      }
      timesheets[id] = employeeTimesheet;
  }

  function updateLocalStorage() {
      localStorage.setItem('employees', JSON.stringify(employees));
      localStorage.setItem('timesheets', JSON.stringify(timesheets));
      localStorage.setItem('timers', JSON.stringify(timers));
      localStorage.setItem('settings', JSON.stringify(settings));
      localStorage.setItem('attendance', JSON.stringify(attendance));
  }

  function updateEmployeeList() {
      employeeList.innerHTML = '';
      employees.forEach(employee => {
          const li = document.createElement('li');
          li.innerHTML = `<span>${employee.name}</span>`;
          li.addEventListener('click', () => showClockInModal(employee));
          employeeList.appendChild(li);
      });
  }

  function updateEmployeeManagementList() {
      employeeManagementList.innerHTML = '';
      employees.forEach(employee => {
          const li = document.createElement('li');
          li.innerHTML = `
              <span>${employee.name} (${employee.id})</span>
              <div class="employee-actions">
                  <button class="view-button" data-id="${employee.id}">View</button>
                  <button class="edit-button" data-id="${employee.id}">Edit</button>
                  <button class="delete-button" data-id="${employee.id}">Delete</button>
              </div>
          `;
          employeeManagementList.appendChild(li);
      });

      const viewButtons = document.querySelectorAll('.view-button');
      const editButtons = document.querySelectorAll('.edit-button');
      const deleteButtons = document.querySelectorAll('.delete-button');

      viewButtons.forEach(button => {
          button.addEventListener('click', () => {
              const id = button.getAttribute('data-id');
              showDetailedView(id);
          });
      });

      editButtons.forEach(button => {
          button.addEventListener('click', () => {
              const id = button.getAttribute('data-id');
              editEmployee(id);
          });
      });

      deleteButtons.forEach(button => {
          button.addEventListener('click', () => {
              const id = button.getAttribute('data-id');
              deleteEmployee(id);
          });
      });
  }

  function updateEmployeeFilter() {
      employeeFilter.innerHTML = '<option value="">All Employees</option>';
      employees.forEach(employee => {
          const option = document.createElement('option');
          option.value = employee.id;
          option.textContent = employee.name;
          employeeFilter.appendChild(option);
      });
  }

  function showClockInModal(employee) {
      const { id } = employee;
      activeEmployeeId = id;

      employeeNameModal.textContent = `${employee.name} (${employee.id})`;
      clockInModal.style.display = 'flex';

      clockInModal.classList.add('modal-overlay');

      if (timers[id].isRunning || timers[id].isOnBreak) {
          if (timers[id].isRunning) {
              startMainInterval(id, timerElement);
              clockCircle.classList.add('red');
              clockInText.textContent = 'Clock Out';
          } else if (timers[id].isOnBreak) {
              breakButton.textContent = 'End Break';
              startBreakInterval(id, timerElement);
          }
          breakButton.style.display = 'block';
      } else {
          updateTimer(timerElement, timers[id].mainTime);
          breakButton.style.display = 'none';
          clockCircle.classList.remove('red');
          clockInText.textContent = 'Clock In';
      }

      clockCircle.onclick = () => {
          if (!timers[id].isRunning && !timers[id].isOnBreak) {
              // Clock In
              timers[id].startTime = Date.now();
              timers[id].isRunning = true;
              logTimesheet(id, 'clockin');
              startMainInterval(id, timerElement);
              breakButton.style.display = 'block';
              clockCircle.classList.add('red');
              clockInText.textContent = 'Clock Out';
          } else if (timers[id].isRunning) {
              // Clock Out
              stopActiveEmployeeTimer(id);
              logTimesheet(id, 'clockout');
              resetTimer(id);
              breakButton.style.display = 'none';
              clockCircle.classList.remove('red');
              clockInText.textContent = 'Clock In';
              updateEmployeeList();
              displayTimesheet();
          }
          updateLocalStorage();
          clockInModal.style.display = 'none';
      };

      breakButton.onclick = () => {
          if (!timers[id].isOnBreak) {
              // Start Break
              timers[id].mainTime += Math.floor((Date.now() - timers[id].startTime) / 1000);
              timers[id].breakStartTime = Date.now();
              timers[id].isRunning = false;
              timers[id].isOnBreak = true;
              logTimesheet(id, 'startbreak');
              breakButton.textContent = 'End Break';
              startBreakInterval(id, timerElement);
          } else {
              // End Break
              const breakDuration = Math.floor((Date.now() - timers[id].breakStartTime) / 60000); // in minutes
              if (breakDuration < settings.minimumBreakDuration) {
                  showError(`Break must be at least ${settings.minimumBreakDuration} minutes.`);
                  return;
              }
              if (breakDuration > settings.maximumBreakDuration) {
                  showError(`Break cannot exceed ${settings.maximumBreakDuration} minutes.`);
                  return;
              }
              timers[id].breakTime += Math.floor((Date.now() - timers[id].breakStartTime) / 1000);
              timers[id].startTime = Date.now();
              timers[id].isRunning = true;
              timers[id].isOnBreak = false;
              logTimesheet(id, 'endbreak');
              breakButton.textContent = 'Start Break';
              startMainInterval(id, timerElement);
          }
          updateLocalStorage();
          clockInModal.style.display = 'none';
      };
  }

  function resetModalState() {
      clearInterval(currentInterval);
      updateTimer(timerElement, 0);
      breakButton.style.display = 'none';
      breakButton.textContent = 'Start Break';
      clockInModal.classList.remove('modal-overlay');
  }

  function startMainInterval(id, timerElement) {
      clearInterval(currentInterval);
      currentInterval = setInterval(() => {
          const duration = Math.floor((Date.now() - timers[id].startTime) / 1000);
          updateTimer(timerElement, timers[id].mainTime + duration);
      }, 1000);
  }

  function startBreakInterval(id, timerElement) {
      clearInterval(currentInterval);
      currentInterval = setInterval(() => {
          const duration = Math.floor((Date.now() - timers[id].breakStartTime) / 1000);
          updateTimer(timerElement, timers[id].breakTime + duration);
      }, 1000);
  }

  function stopActiveEmployeeTimer(id) {
      const timer = timers[id];
      if (timer.isRunning) {
          timer.mainTime += Math.floor((Date.now() - timer.startTime) / 1000);
      } else if (timer.isOnBreak) {
          timer.breakTime += Math.floor((Date.now() - timer.breakStartTime) / 1000);
      }
      clearInterval(currentInterval);
      timer.isRunning = false;
      timer.isOnBreak = false;
      updateLocalStorage();
  }

  function resetTimer(id) {
      timers[id] = { mainTime: 0, breakTime: 0, startTime: null, breakStartTime: null, isRunning: false, isOnBreak: false };
      updateLocalStorage();
  }

  function updateTimer(element, time) {
      element.textContent = formatTotalTime(time);
  }

  function logTimesheet(id, type) {
      const timestamp = Date.now();
      const timesheet = timesheets[id] || [];
      const entry = {
          type: type,
          timestamp: timestamp
      };
      timesheet.push(entry);
      timesheets[id] = timesheet;
      updateLocalStorage();
  }

  function displayTimesheet() {
      const selectedDate = new Date(dateFilter.value + ' 00:00:00');
      const selectedEmployee = employeeFilter.value;
      timesheetTableBody.innerHTML = '';

      const filteredEmployees = selectedEmployee ? employees.filter(employee => employee.id === selectedEmployee) : employees;

      if (timeFilter.value === 'day') {
          // Display timesheet for a single day
          filteredEmployees.forEach(employee => {
              const timesheet = (timesheets[employee.id] || []).filter(entry => {
                  const entryDate = new Date(entry.timestamp);
                  return entryDate.toDateString() === selectedDate.toDateString();
              });

              renderTimesheetRow(employee, timesheet, selectedDate);
          });
      } else {
          // Display timesheet for the week
          const startOfWeek = new Date(selectedDate);
          const dayOfWeek = selectedDate.getDay();
          const dayDiff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
          startOfWeek.setDate(selectedDate.getDate() + dayDiff);

          for (let i = 0; i < 7; i++) {
              const currentDate = new Date(startOfWeek);
              currentDate.setDate(startOfWeek.getDate() + i);

              filteredEmployees.forEach(employee => {
                  const timesheet = (timesheets[employee.id] || []).filter(entry => {
                      const entryDate = new Date(entry.timestamp);
                      return entryDate.toDateString() === currentDate.toDateString();
                  });

                  renderTimesheetRow(employee, timesheet, currentDate);
              });
          }
      }

      addAttendanceButtonListeners();
      addEditableCellListeners();
      checkForIncompleteTimesheets();
  }

  function renderTimesheetRow(employee, timesheet, date) {
      let totalWorkMilliseconds = 0;
      let totalBreakMilliseconds = 0;
      let lastClockInTime = null;

      timesheet.forEach((entry, index) => {
          if (entry.type === 'clockin') {
              lastClockInTime = entry.timestamp;
          }
          if (entry.type === 'clockout' && lastClockInTime) {
              totalWorkMilliseconds += (entry.timestamp - lastClockInTime);
              lastClockInTime = null;
          }
          if (entry.type === 'startbreak' && timesheet[index + 1] && timesheet[index + 1].type === 'endbreak') {
              totalBreakMilliseconds += (timesheet[index + 1].timestamp - entry.timestamp);
          }
      });

      // Calculate the total payable work hours by subtracting the break hours from the total work hours
      const totalWorkHours = totalWorkMilliseconds / 3600000; // Convert ms to hours
      const totalBreakHours = totalBreakMilliseconds / 3600000; // Convert ms to hours
      let payableWorkHours = Math.max(0, totalWorkHours - totalBreakHours); // Subtract break hours from work hours

      // Overtime calculation
      let regularHours = payableWorkHours;
      let overtimeHours = 0;
      if (payableWorkHours > settings.overtimeThreshold) {
          overtimeHours = payableWorkHours - settings.overtimeThreshold;
          regularHours = settings.overtimeThreshold;
      }
      const regularPay = (regularHours * employee.payRate).toFixed(2);
      const overtimePay = (overtimeHours * employee.payRate * settings.overtimeMultiplier).toFixed(2);
      const dailyPay = (parseFloat(regularPay) + parseFloat(overtimePay)).toFixed(2);

      // Attendance status
      const attendanceStatus = attendance[employee.id] && attendance[employee.id][date.toDateString()] ? attendance[employee.id][date.toDateString()] : '';

      const row = document.createElement('tr');
      row.innerHTML = `
          <td>${date.toDateString()}</td>
          <td>${employee.name}</td>
          <td>${employee.role}</td>
          <td class="editable" data-type="clockin" data-id="${employee.id}" data-date="${date.toDateString()}">${formatTime(timesheet.find(entry => entry.type === 'clockin')?.timestamp)}</td>
          <td class="editable" data-type="startbreak" data-id="${employee.id}" data-date="${date.toDateString()}">${formatTime(timesheet.find(entry => entry.type === 'startbreak')?.timestamp)}</td>
          <td class="editable" data-type="endbreak" data-id="${employee.id}" data-date="${date.toDateString()}">${formatTime(timesheet.find(entry => entry.type === 'endbreak')?.timestamp)}</td>
          <td class="editable" data-type="clockout" data-id="${employee.id}" data-date="${date.toDateString()}">${formatTime(timesheet.find(entry => entry.type === 'clockout')?.timestamp)}</td>
          <td>${regularHours.toFixed(2)}</td>
          <td>${overtimeHours.toFixed(2)}</td>
          <td>${totalBreakHours.toFixed(2)}</td>
          <td>$${dailyPay}</td>
          <td>${attendanceStatus}</td>
          <td>
              <button class="attendance-button" data-id="${employee.id}" data-date="${date.toDateString()}" data-status="Called Out">Called Out</button>
              <button class="attendance-button" data-id="${employee.id}" data-date="${date.toDateString()}" data-status="No Show">No Show</button>
          </td>
      `;
      timesheetTableBody.appendChild(row);
  }

  function addAttendanceButtonListeners() {
      document.querySelectorAll('.attendance-button').forEach(button => {
          button.addEventListener('click', function() {
              const id = button.getAttribute('data-id');
              const date = button.getAttribute('data-date');
              const status = button.getAttribute('data-status');
              if (!attendance[id]) {
                  attendance[id] = {};
              }
              attendance[id][date] = status;
              updateLocalStorage();
              displayTimesheet();
          });
      });
  }

  function addEditableCellListeners() {
      document.querySelectorAll('.editable').forEach(cell => {
          cell.addEventListener('click', function () {
              const currentValue = cell.textContent;
              const input = document.createElement('input');
              input.type = 'time';
              input.value = convertTo24HourFormat(currentValue);
              cell.textContent = '';
              cell.appendChild(input);
              input.focus();

              input.addEventListener('keydown', function (event) {
                  if (event.key === 'Enter') {
                      input.blur();
                  }
              });

              input.addEventListener('blur', function () {
                  const newValue = input.value;
                  if (newValue) {
                      saveInlineEdit(cell.getAttribute('data-id'), cell.getAttribute('data-type'), cell.getAttribute('data-date'), newValue);
                  }
                  cell.textContent = formatTime(convertTimeToTimestamp(newValue));
              });
          });
      });
  }

  function convertTo24HourFormat(timeString) {
      if (!timeString) return '';
      const date = new Date(`1970-01-01T${timeString}`);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
  }

  function convertTimeToTimestamp(time) {
      if (!time) return null;
      const [hours, minutes] = time.split(':');
      const date = new Date();
      date.setHours(parseInt(hours));
      date.setMinutes(parseInt(minutes));
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date.getTime();
  }

  function saveInlineEdit(id, type, dateString, time) {
      updateTimesheetEntry(id, type, dateString, time);
      updateLocalStorage();
      displayTimesheet();
  }

  function formatTime(timestamp) {
      return timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  }

  function formatTotalTime(totalTime) {
      const hours = String(Math.floor(totalTime / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((totalTime % 3600) / 60)).padStart(2, '0');
      const seconds = String(totalTime % 60).padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
  }

  function changeWeek(offset) {
      const currentDate = new Date(dateFilter.value);
      currentDate.setDate(currentDate.getDate() + offset * 7);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      dateFilter.value = `${year}-${month}-${day}`;
      displayTimesheet();
      updateCalendar();
  }

  function updateCalendar() {
      customCalendar.innerHTML = '';
      const today = new Date();
      const selectedDate = new Date(dateFilter.value + ' 00:00:00');
      const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

      // Calculate the start of the week (Monday)
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = selectedDate.getDay();
      const dayDiff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startOfWeek.setDate(selectedDate.getDate() + dayDiff);

      for (let i = 0; i < 7; i++) {
          const dayDate = new Date(startOfWeek);
          dayDate.setDate(startOfWeek.getDate() + i);
          const day = dayDate.getDate();
          const dayOfWeek = daysOfWeek[i];

          const dayElement = document.createElement('div');
          dayElement.className = 'day';
          dayElement.innerHTML = `
              ${dayOfWeek} <div class="date">${day}</div>
              <div class="dot"></div>
          `;

          if (dayDate.toDateString() === selectedDate.toDateString()) {
              dayElement.classList.add('active');
          }

          dayElement.addEventListener('click', () => {
              const year = dayDate.getFullYear();
              const month = String(dayDate.getMonth() + 1).padStart(2, '0');
              const day = String(dayDate.getDate()).padStart(2, '0');
              dateFilter.value = `${year}-${month}-${day}`;
              updateCalendar();
              displayTimesheet();
          });

          customCalendar.appendChild(dayElement);
      }

      displayTimesheet();
  }

  function updateDateTime() {
      const now = new Date();
      currentDateElement.textContent = now.toDateString();
      currentTimeElement.textContent = now.toLocaleTimeString();
  }

  function showDetailedView(employeeId) {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return;

      detailedViewEmployeeName.textContent = `${employee.name} (${employee.id})`;
      detailedViewEmployeeRole.textContent = `Role: ${employee.role}`;

      // Calculate total hours worked
      const employeeTimesheet = timesheets[employeeId] || [];
      let totalWorkMilliseconds = 0;
      let totalBreakMilliseconds = 0;
      let lastClockInTime = null;

      const daysWorkedMap = new Map();

      employeeTimesheet.forEach((entry, index) => {
          const entryDate = new Date(entry.timestamp).toDateString();

          if (!daysWorkedMap.has(entryDate)) {
              daysWorkedMap.set(entryDate, {
                  clockIn: null,
                  startBreak: null,
                  endBreak: null,
                  clockOut: null
              });
          }

          const dayEntries = daysWorkedMap.get(entryDate);

          switch (entry.type) {
              case 'clockin':
                  dayEntries.clockIn = entry.timestamp;
                  lastClockInTime = entry.timestamp;
                  break;
              case 'startbreak':
                  dayEntries.startBreak = entry.timestamp;
                  break;
              case 'endbreak':
                  dayEntries.endBreak = entry.timestamp;
                  break;
              case 'clockout':
                  dayEntries.clockOut = entry.timestamp;
                  if (lastClockInTime) {
                      totalWorkMilliseconds += (entry.timestamp - lastClockInTime);
                      lastClockInTime = null;
                  }
                  break;
              default:
                  break;
          }

          if (entry.type === 'startbreak' && employeeTimesheet[index + 1] && employeeTimesheet[index + 1].type === 'endbreak') {
              totalBreakMilliseconds += (employeeTimesheet[index + 1].timestamp - entry.timestamp);
          }
      });

      const totalWorkHours = totalWorkMilliseconds / 3600000; // Convert ms to hours
      const totalBreakHours = totalBreakMilliseconds / 3600000; // Convert ms to hours
      const payableWorkHours = Math.max(0, totalWorkHours - totalBreakHours); // Subtract break hours from work hours
      const totalPay = (payableWorkHours * employee.payRate).toFixed(2);

      detailedViewTotalHours.textContent = `Total Hours: ${payableWorkHours.toFixed(2)}`;
      detailedViewTotalPay.textContent = `Total Pay: $${totalPay}`;

      // List days worked with details
      detailedViewDaysWorked.innerHTML = '';
      daysWorkedMap.forEach((entries, date) => {
          const li = document.createElement('li');
          li.innerHTML = `
              <strong>${date}</strong><br>
              Clock In: ${formatTime(entries.clockIn)}<br>
              Start Break: ${formatTime(entries.startBreak)}<br>
              End Break: ${formatTime(entries.endBreak)}<br>
              Clock Out: ${formatTime(entries.clockOut)}
          `;
          detailedViewDaysWorked.appendChild(li);
      });

      detailedViewModal.style.display = 'flex';
  }

  function closeDetailedViewModal() {
      detailedViewModal.style.display = 'none';
  }

  function showError(message) {
      errorMessageElement.textContent = message;
      errorModal.style.display = 'flex';
  }

  function closeErrorModal() {
      errorModal.style.display = 'none';
  }

  // Function to check for incomplete timesheets
  function checkForIncompleteTimesheets() {
      let incompleteEntries = [];
      const selectedDate = new Date(dateFilter.value + ' 00:00:00');
      employees.forEach(employee => {
          const timesheet = (timesheets[employee.id] || []).filter(entry => {
              const entryDate = new Date(entry.timestamp);
              return entryDate.toDateString() === selectedDate.toDateString();
          });

          const hasClockIn = timesheet.some(entry => entry.type === 'clockin');
          const hasClockOut = timesheet.some(entry => entry.type === 'clockout');

          if ((hasClockIn && !hasClockOut) || (!hasClockIn && hasClockOut)) {
              incompleteEntries.push(employee.name);
          }
      });

      if (incompleteEntries.length > 0) {
          showError(`Incomplete timesheets for: ${incompleteEntries.join(', ')}`);
      }
  }

  // Set date to today using local date components
  function setDateToToday() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(today.getDate()).padStart(2, '0');
      dateFilter.value = `${year}-${month}-${day}`;
  }

  // Updated generatePayDaySheet function to display report in a modal
  function generatePayDaySheet() {
      // Get the week range based on selected date
      const selectedDate = new Date(dateFilter.value);
      const startOfWeek = new Date(selectedDate);
      const dayOfWeek = selectedDate.getDay();
      const dayDiff = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
      startOfWeek.setDate(selectedDate.getDate() + dayDiff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Format the week range
      const weekRange = `${startOfWeek.toDateString()} - ${endOfWeek.toDateString()}`;

      // Open a modal instead of a new window
      const reportModal = document.createElement('div');
      reportModal.classList.add('modal');
      reportModal.innerHTML = `
        <div class="modal-content report-modal">
          <span class="close">&times;</span>
          <h1>${settings.companyName}</h1>
          <h2>${settings.companyAddress}</h2>
          <h3>Employee Pay Stub</h3>
          <p>Week: ${weekRange}</p>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee Name</th>
                <th>Attendance</th>
                <th>Regular Hours</th>
                <th>Overtime Hours</th>
                <th>Total Pay</th>
              </tr>
            </thead>
            <tbody id="paydayReportBody"></tbody>
          </table>
        </div>
      `;

      document.body.appendChild(reportModal);

      const closeReportModal = reportModal.querySelector('.close');
      closeReportModal.onclick = function () {
          reportModal.style.display = 'none';
          reportModal.remove();
      };

      // Append employee report data
      const paydayReportBody = reportModal.querySelector('#paydayReportBody');
      const selectedEmployee = employeeFilter.value;
      const filteredEmployees = selectedEmployee ? employees.filter((employee) => employee.id === selectedEmployee) : employees;

      filteredEmployees.forEach((employee) => {
          let weeklyRegularHours = 0;
          let weeklyOvertimeHours = 0;
          let weeklyPay = 0;

          for (let i = 0; i < 7; i++) {
              const currentDate = new Date(startOfWeek);
              currentDate.setDate(startOfWeek.getDate() + i);
              const dateString = currentDate.toDateString();

              const timesheet = (timesheets[employee.id] || []).filter((entry) => {
                  const entryDate = new Date(entry.timestamp).toDateString();
                  return entryDate === dateString;
              });

              let totalWorkMilliseconds = 0;
              let totalBreakMilliseconds = 0;
              let lastClockInTime = null;

              timesheet.forEach((entry, index) => {
                  if (entry.type === 'clockin') {
                      lastClockInTime = entry.timestamp;
                  }
                  if (entry.type === 'clockout' && lastClockInTime) {
                      totalWorkMilliseconds += entry.timestamp - lastClockInTime;
                      lastClockInTime = null;
                  }
                  if (entry.type === 'startbreak' && timesheet[index + 1] && timesheet[index + 1].type === 'endbreak') {
                      totalBreakMilliseconds += timesheet[index + 1].timestamp - entry.timestamp;
                  }
              });

              const totalWorkHours = totalWorkMilliseconds / 3600000;
              const totalBreakHours = totalBreakMilliseconds / 3600000;
              let payableWorkHours = Math.max(0, totalWorkHours - totalBreakHours);

              // Overtime calculation
              let regularHours = payableWorkHours;
              let overtimeHours = 0;
              if (payableWorkHours > settings.overtimeThreshold) {
                  overtimeHours = payableWorkHours - settings.overtimeThreshold;
                  regularHours = settings.overtimeThreshold;
              }
              const regularPay = (regularHours * employee.payRate).toFixed(2);
              const overtimePay = (overtimeHours * employee.payRate * settings.overtimeMultiplier).toFixed(2);
              const dailyPay = (parseFloat(regularPay) + parseFloat(overtimePay)).toFixed(2);

              weeklyRegularHours += regularHours;
              weeklyOvertimeHours += overtimeHours;
              weeklyPay += parseFloat(dailyPay);

              const attendanceStatus = attendance[employee.id] && attendance[employee.id][dateString] ? attendance[employee.id][dateString] : '';

              // Append data to report modal
              const reportRow = document.createElement('tr');
              reportRow.innerHTML = `
                <td>${dateString}</td>
                <td>${employee.name}</td>
                <td>${attendanceStatus}</td>
                <td>${regularHours.toFixed(2)}</td>
                <td>${overtimeHours.toFixed(2)}</td>
                <td>$${dailyPay}</td>
              `;
              paydayReportBody.appendChild(reportRow);
          }

          // Add a weekly total for the employee
          const reportTotalRow = document.createElement('tr');
          reportTotalRow.innerHTML = `
              <td colspan="3"><strong>${employee.name}'s Weekly Total</strong></td>
              <td><strong>${weeklyRegularHours.toFixed(2)} hours</strong></td>
              <td><strong>${weeklyOvertimeHours.toFixed(2)} hours</strong></td>
              <td><strong>$${weeklyPay.toFixed(2)}</strong></td>
            `;
          paydayReportBody.appendChild(reportTotalRow);
      });

      reportModal.style.display = 'flex';
  }

  // Function to export timesheet data to CSV
  function exportToCSV() {
      let csvContent = "data:text/csv;charset=utf-8,";
      const headers = ["Date", "Employee Name", "Role", "Clock In", "Start Break", "End Break", "Clock Out", "Regular Hours", "Overtime Hours", "Break Hours", "Total Pay", "Attendance"];
      csvContent += headers.join(",") + "\r\n";

      const rows = timesheetTableBody.querySelectorAll('tr');
      rows.forEach(row => {
          const cols = row.querySelectorAll('td');
          const rowData = [];
          cols.forEach(col => {
              rowData.push(col.textContent.trim());
          });
          csvContent += rowData.join(",") + "\r\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "timesheet.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  }

  // Updated sendWeeklyEmail function
  function sendWeeklyEmail() {
      const email = emailAddressInput.value || 'scprecisiondeburring@gmail.com'; // Use input email or default
      if (!email) {
          showError('Please enter a valid email address.');
          return;
      }

      // Prepare the email content
      const templateParams = {
          to_email: email,
          message_html: generateEmailContent()
      };

      // Send email using EmailJS
      emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
          .then(function(response) {
              alert('Weekly timesheet sent successfully.');
              emailModal.style.display = 'none';
          }, function(error) {
              showError('Failed to send email. Please check your EmailJS configuration and try again.');
              console.error('EmailJS Error:', error);
          });
  }

  // Function to generate email content
  function generateEmailContent() {
      // Generate email content similar to the print report
      // Implement the logic to generate the email content here
      return `<p>Please find the weekly timesheet attached.</p>`;
  }

  // Initialization
  setDateToToday();
  updateEmployeeList();
  updateEmployeeManagementList();
  updateEmployeeFilter();
  setInterval(updateDateTime, 1000);
  loadSettings();
  displayTimesheet();
  updateCalendar();
  updateDateTime();
});
