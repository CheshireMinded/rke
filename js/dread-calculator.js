/**
 * DreadCalculator - Main application class for tracking alliance dreadnought kills
 */
class DreadCalculator {
  constructor() {
    this.players = [];
    this.playerCounter = 1;
    this.defaultTarget = 50;
    this.weeklyData = {};
    this.currentWeek = this.getCurrentWeek();
    this.achievements = [];
    this.customTargets = {};
    this.teamGoal = 0;
    this.notificationSettings = {
      enabled: true,
      targetReached: true,
      weeklyComplete: true,
      achievementUnlocked: true
    };
    this.syncStatus = 'Not synced';
    this.cloudData = null;
    this.achievementDefinitions = this.initializeAchievements();
    this.milestones = this.initializeMilestones();
    this.charts = {};
    this.voiceRecognition = null;
    this.isRecording = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.addPlayer(); // Add first player by default
  }

  bindEvents() {
    const addBtn = document.getElementById('addBtn');
    console.log('Add button element:', addBtn);
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        console.log('Add Player button clicked!');
        console.log('this context:', this);
        console.log('this.players:', this.players);
        this.addPlayer();
      });
      console.log('Event listener added to Add button');
    } else {
      console.error('Add button not found!');
    }
    document.getElementById('removeBtn').addEventListener('click', () => this.removeLastPlayer());
    document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllPlayers());
    document.getElementById('exportJsonBtn').addEventListener('click', () => this.exportJson());
    document.getElementById('exportCsvBtn').addEventListener('click', () => this.exportCsv());
    document.getElementById('copyResultsBtn').addEventListener('click', () => this.copyResults());
    document.getElementById('importDataBtn').addEventListener('click', () => document.getElementById('importFile').click());
    document.getElementById('importFile').addEventListener('change', (e) => this.importData(e));
    
    // Weekly management events
    document.getElementById('saveWeekBtn').addEventListener('click', () => this.saveCurrentWeek());
    document.getElementById('loadWeekBtn').addEventListener('click', () => this.showWeekSelector());
    document.getElementById('newWeekBtn').addEventListener('click', () => this.startNewWeek());
    document.getElementById('viewHistoryBtn').addEventListener('click', () => this.toggleHistoryView());
    
    // Load saved data on startup
    this.loadSavedData();
  }

  addPlayer() {
    try {
      console.log('addPlayer method started');
      const playerId = `player_${this.playerCounter++}`;
      const player = {
        id: playerId,
        name: `Player ${this.playerCounter - 1}`,
        startDreads: 0,
        endDreads: 0,
        coverage: [],
        note: ''
      };
      
      this.players.push(player);
      console.log('addPlayer: Added player', player.name, 'Total players now:', this.players.length);
      console.log('About to call renderPlayer for:', player.name);
      this.renderPlayer(player);
      console.log('About to call updateUI');
      this.updateUI();
      console.log('addPlayer method completed');
    } catch (error) {
      console.error('Error in addPlayer method:', error);
    }
  }

  removeLastPlayer() {
    if (this.players.length > 0) {
      this.players.pop();
      this.updateUI();
    }
  }

  clearAllPlayers() {
    if (confirm('Are you sure you want to clear all players?')) {
      this.players = [];
      this.playerCounter = 1;
      this.updateUI();
    }
  }

  renderPlayer(player) {
    const container = document.getElementById('playersContainer');
    const playerDiv = document.createElement('div');
    playerDiv.className = 'player';
    playerDiv.id = player.id;
    
    const isComplete = this.isPlayerComplete(player);
    const checkboxClass = isComplete ? 'complete-checkbox' : 'incomplete-checkbox';
    const checkboxDisabled = isComplete ? 'disabled' : '';
    
    playerDiv.innerHTML = `
      <div class="flex-row" role="listitem">
        <input type="checkbox" class="${checkboxClass}" ${checkboxDisabled} 
               id="checkbox_${player.id}" onchange="dreadCalculator.togglePlayerComplete('${player.id}', this.checked)"
               aria-label="Player completion status for ${player.name}">
        <input type="text" class="name-input" placeholder="Player name" value="${player.name}" 
               onchange="dreadCalculator.updatePlayerName('${player.id}', this.value)"
               aria-label="Player name for ${player.name}">
        <button class="copy-player-btn" onclick="dreadCalculator.copyPlayer('${player.id}')" 
                aria-label="Copy player data for ${player.name}">Copy</button>
        <button class="remove-player-btn" onclick="dreadCalculator.removePlayer('${player.id}')" 
                aria-label="Remove player ${player.name}">Remove</button>
      </div>
      
      <div class="flex-row" style="margin-top: 10px; gap: 8px; align-items: center;">
        <span class="dread-label">Start Dreads</span>
        <input type="number" placeholder="Starting dread count" value="${player.startDreads}" 
               onchange="dreadCalculator.updatePlayerStart('${player.id}', parseInt(this.value) || 0)"
               aria-label="Starting dread count for ${player.name}"
               style="flex: 1; min-width: 120px;">
        <span class="dread-label">End Dreads</span>
        <input type="number" placeholder="Ending dread count" value="${player.endDreads}" 
               onchange="dreadCalculator.updatePlayerEnd('${player.id}', parseInt(this.value) || 0)"
               aria-label="Ending dread count for ${player.name}"
               style="flex: 1; min-width: 120px;">
      </div>
      
      <div class="dread-count" id="count_${player.id}">
        Dreads Killed: <span id="kills_${player.id}">0</span>
      </div>
      
      <div class="coverage-section">
        <h4>Base Coverage (Optional)</h4>
        <input type="text" class="coverage-input" placeholder="Player covering this base (e.g., Player 2)" 
               value="${player.coverage.join(', ')}" 
               onchange="dreadCalculator.updateCoverage('${player.id}', this.value)">
        <div class="small">Enter names of players who are covering this base, separated by commas</div>
      </div>
      
      <div class="note-section">
        <h4>Player Note (Optional)</h4>
        <textarea class="note-input" placeholder="Add a note for this player..." 
                  onchange="dreadCalculator.updatePlayerNote('${player.id}', this.value)"
                  aria-label="Note for ${player.name}">${player.note || ''}</textarea>
        <div class="small">Track additional information about this player</div>
      </div>
    `;
    
    container.appendChild(playerDiv);
  }

  updatePlayerName(playerId, name) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.name = name;
      this.updateUI();
    }
  }

  updatePlayerStart(playerId, startDreads) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.startDreads = startDreads;
      this.updatePlayerKills(playerId);
      this.updatePlayerCompletion(player);
      this.updateUI();
    }
  }

  updatePlayerEnd(playerId, endDreads) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.endDreads = endDreads;
      this.updatePlayerKills(playerId);
      this.updatePlayerCompletion(player);
      this.updateUI();
    }
  }

  updateCoverage(playerId, coverageText) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.coverage = coverageText.split(',').map(name => name.trim()).filter(name => name);
      this.updatePlayerCompletion(player);
      this.updateUI();
    }
  }

  updatePlayerNote(playerId, note) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      player.note = note;
      this.updateUI();
    }
  }

  updatePlayerKills(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      const kills = player.endDreads - player.startDreads;
      const killsElement = document.getElementById(`kills_${playerId}`);
      const countElement = document.getElementById(`count_${playerId}`);
      
      if (killsElement) {
        killsElement.textContent = kills;
        killsElement.className = kills > 0 ? 'positive' : kills < 0 ? 'negative' : 'zero';
      }
      
      if (countElement) {
        countElement.className = `dread-count ${kills > 0 ? 'positive' : kills < 0 ? 'negative' : 'zero'}`;
      }
    }
  }

  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    const playerElement = document.getElementById(playerId);
    if (playerElement) {
      playerElement.remove();
    }
    this.updateUI();
  }

  copyPlayer(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (player) {
      const playerData = {
        name: player.name,
        startDreads: player.startDreads,
        endDreads: player.endDreads,
        coverage: player.coverage
      };
      
      navigator.clipboard.writeText(JSON.stringify(playerData, null, 2)).then(() => {
        alert('Player data copied to clipboard!');
      });
    }
  }

  updateTarget(newTarget) {
    this.defaultTarget = newTarget;
    this.updateAllPlayerCompletions();
    this.updateUI();
  }

  isPlayerComplete(player) {
    const dreadsKilled = player.endDreads - player.startDreads;
    return dreadsKilled >= this.defaultTarget;
  }

  isPlayerCompleteByCoverage(player) {
    // Check if any of the players this player is covering have reached the target
    return player.coverage.some(coveredPlayerName => {
      const coveredPlayer = this.players.find(p => p.name === coveredPlayerName);
      return coveredPlayer && this.isPlayerComplete(coveredPlayer);
    });
  }

  updateAllPlayerCompletions() {
    this.players.forEach(player => {
      this.updatePlayerCompletion(player);
    });
  }

  updatePlayerCompletion(player) {
    const isComplete = this.isPlayerComplete(player) || this.isPlayerCompleteByCoverage(player);
    const checkbox = document.getElementById(`checkbox_${player.id}`);
    const playerElement = document.getElementById(player.id);
    
    if (checkbox) {
      checkbox.checked = isComplete;
      checkbox.disabled = isComplete;
      checkbox.className = isComplete ? 'complete-checkbox' : 'incomplete-checkbox';
    }
    
    if (playerElement) {
      if (isComplete) {
        playerElement.classList.add('complete');
      } else {
        playerElement.classList.remove('complete');
      }
    }
  }

  togglePlayerComplete(playerId, checked) {
    // This method is for manual toggling, but we'll prevent it if auto-complete
    const player = this.players.find(p => p.id === playerId);
    if (player && !this.isPlayerComplete(player) && !this.isPlayerCompleteByCoverage(player)) {
      // Only allow manual toggle if not auto-complete
      console.log(`Player ${player.name} manually ${checked ? 'completed' : 'uncompleted'}`);
    }
  }

  updateUI() {
    this.updateRemoveButton();
    this.updateSummary();
    this.updateLeaderboard();
    this.updatePlayerProfileSelector();
    this.updateAllPlayerCompletions();
    this.updateCharts(); // Update charts with current data
    this.autoSave(); // Auto-save on any UI update
  }

  updateRemoveButton() {
    const removeBtn = document.getElementById('removeBtn');
    removeBtn.disabled = this.players.length <= 1;
  }

  updateSummary() {
    const totalPlayers = this.players.length;
    const totalDreads = this.players.reduce((sum, player) => sum + (player.endDreads - player.startDreads), 0);
    const averageDreads = totalPlayers > 0 ? Math.round(totalDreads / totalPlayers) : 0;
    const completedPlayers = this.players.filter(player => 
      this.isPlayerComplete(player) || this.isPlayerCompleteByCoverage(player)
    ).length;
    const topPlayer = this.players.reduce((top, player) => {
      const kills = player.endDreads - player.startDreads;
      const topKills = top.endDreads - top.startDreads;
      return kills > topKills ? player : top;
    }, this.players[0]);

    document.getElementById('totalPlayers').textContent = totalPlayers;
    document.getElementById('totalDreads').textContent = totalDreads;
    document.getElementById('averageDreads').textContent = averageDreads;
    document.getElementById('topPerformer').textContent = topPlayer ? `${topPlayer.name} (${topPlayer.endDreads - topPlayer.startDreads})` : '-';

    // Update the summary cards to show completion stats
    const totalPlayersCard = document.querySelector('.stat-card h3');
    if (totalPlayersCard) {
      totalPlayersCard.textContent = `Total Players: ${totalPlayers}`;
    }

    // Show/hide summary section based on whether there are players
    const summarySection = document.getElementById('summarySection');
    if (summarySection) {
      summarySection.style.display = totalPlayers > 0 ? 'block' : 'none';
    }
  }

  updateLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';

    const sortedPlayers = [...this.players].sort((a, b) => {
      const killsA = a.endDreads - a.startDreads;
      const killsB = b.endDreads - b.startDreads;
      return killsB - killsA;
    });

    sortedPlayers.forEach((player, index) => {
      const kills = player.endDreads - player.startDreads;
      const isComplete = this.isPlayerComplete(player) || this.isPlayerCompleteByCoverage(player);
      const item = document.createElement('div');
      item.className = `leaderboard-item ${index < 3 ? 'top-3' : ''} ${isComplete ? 'complete' : ''}`;
      
      const completionIcon = isComplete ? '✅ ' : '';
      const coverageNote = this.isPlayerCompleteByCoverage(player) && !this.isPlayerComplete(player) ? ' (via coverage)' : '';
      
      item.innerHTML = `
        <div class="rank">#${index + 1}</div>
        <div class="player-name">${completionIcon}${player.name}${coverageNote}</div>
        <div class="dread-kills">${kills} dreads</div>
      `;
      
      leaderboard.appendChild(item);
    });
  }

  updatePlayerProfileSelector() {
    const selector = document.getElementById('playerProfileSelect');
    console.log('updatePlayerProfileSelector called, selector found:', !!selector, 'players count:', this.players.length);
    if (!selector) return;

    // Clear existing options except the first one
    selector.innerHTML = '<option value="">Select a player...</option>';

    // Add all current players to the selector
    this.players.forEach(player => {
      const option = document.createElement('option');
      option.value = player.id;
      option.textContent = player.name;
      selector.appendChild(option);
      console.log('Added player to selector:', player.name, player.id);
    });
  }

  // Player Profiles
  showPlayerProfile(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    const profileDetails = document.getElementById('playerProfileDetails');
    const totalKills = this.getPlayerTotalKills(player);
    const averageKills = this.getPlayerAverageKills(player);
    const weeksActive = this.getPlayerWeeksActive(player);
    const bestWeek = this.getPlayerBestWeek(player);

    profileDetails.innerHTML = `
      <h3>${player.name} - Player Profile</h3>
      <div class="profile-stats">
        <div class="profile-stat">
          <div class="profile-stat-value">${totalKills}</div>
          <div class="profile-stat-label">Total Kills</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${averageKills.toFixed(1)}</div>
          <div class="profile-stat-label">Average/Week</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${weeksActive}</div>
          <div class="profile-stat-label">Weeks Active</div>
        </div>
        <div class="profile-stat">
          <div class="profile-stat-value">${bestWeek}</div>
          <div class="profile-stat-label">Best Week</div>
        </div>
      </div>
    `;
    
    profileDetails.style.display = 'block';
  }

  getPlayerTotalKills(player) {
    return this.players.reduce((total, p) => {
      if (p.name === player.name) {
        return total + (p.endDreads - p.startDreads);
      }
      return total;
    }, 0);
  }

  getPlayerAverageKills(player) {
    const weeks = Object.keys(this.weeklyData).length;
    return weeks > 0 ? this.getPlayerTotalKills(player) / weeks : 0;
  }

  getPlayerWeeksActive(player) {
    return Object.values(this.weeklyData).filter(week => 
      week.players.some(p => p.name === player.name)
    ).length;
  }

  getPlayerBestWeek(player) {
    let bestKills = 0;
    Object.values(this.weeklyData).forEach(week => {
      const weekPlayer = week.players.find(p => p.name === player.name);
      if (weekPlayer) {
        const kills = weekPlayer.endDreads - weekPlayer.startDreads;
        if (kills > bestKills) {
          bestKills = kills;
        }
      }
    });
    return bestKills;
  }

  // Weekly Management Methods
  getCurrentWeek() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber.toString().padStart(2, '0')}`;
  }

  saveCurrentWeek() {
    const weekData = {
      week: this.currentWeek,
      date: new Date().toISOString(),
      target: this.defaultTarget,
      players: this.players.map(player => ({
        ...player,
        dreadsKilled: player.endDreads - player.startDreads,
        isComplete: this.isPlayerComplete(player) || this.isPlayerCompleteByCoverage(player)
      })),
      summary: {
        totalPlayers: this.players.length,
        totalDreads: this.players.reduce((sum, player) => sum + (player.endDreads - player.startDreads), 0),
        completedPlayers: this.players.filter(player => 
          this.isPlayerComplete(player) || this.isPlayerCompleteByCoverage(player)
        ).length
      }
    };

    this.weeklyData[this.currentWeek] = weekData;
    this.saveToLocalStorage();
    
    alert(`Week ${this.currentWeek} saved successfully!`);
    this.updateWeekSelector();
  }

  loadSelectedWeek() {
    const weekSelect = document.getElementById('weekSelect');
    const selectedWeek = weekSelect.value;
    
    if (selectedWeek && this.weeklyData[selectedWeek]) {
      const weekData = this.weeklyData[selectedWeek];
      this.loadWeekData(weekData);
      this.currentWeek = selectedWeek;
      alert(`Loaded week ${selectedWeek}`);
    }
  }

  loadWeekData(weekData) {
    // Clear current players
    this.players = [];
    this.playerCounter = 1;
    
    // Load week data
    this.defaultTarget = weekData.target;
    document.getElementById('defaultTarget').value = this.defaultTarget;
    
    // Restore players
    weekData.players.forEach(playerData => {
      const player = {
        id: `player_${this.playerCounter++}`,
        name: playerData.name,
        startDreads: playerData.startDreads,
        endDreads: playerData.endDreads,
        coverage: playerData.coverage || [],
        note: playerData.note || ''
      };
      this.players.push(player);
    });
    
    this.renderAllPlayers();
    this.updateUI();
  }

  startNewWeek() {
    if (confirm('Start a new week? This will clear current data and create a new week entry.')) {
      // Save current week if there's data
      if (this.players.length > 0 && this.players.some(p => p.startDreads > 0 || p.endDreads > 0)) {
        this.saveCurrentWeek();
      }
      
      // Clear current data
      this.players = [];
      this.playerCounter = 1;
      this.currentWeek = this.getCurrentWeek();
      
      // Reset to default target
      this.defaultTarget = 50;
      document.getElementById('defaultTarget').value = this.defaultTarget;
      
      // Add one empty player
      this.addPlayer();
      this.updateUI();
      
      alert(`Started new week: ${this.currentWeek}`);
    }
  }

  showWeekSelector() {
    this.updateWeekSelector();
    document.getElementById('historySection').style.display = 'block';
    document.getElementById('weekSelector').scrollIntoView({ behavior: 'smooth' });
  }

  toggleHistoryView() {
    const historySection = document.getElementById('historySection');
    if (historySection.style.display === 'none') {
      this.updateWeekSelector();
      historySection.style.display = 'block';
    } else {
      historySection.style.display = 'none';
    }
  }

  updateWeekSelector() {
    const weekSelect = document.getElementById('weekSelect');
    weekSelect.innerHTML = '<option value="">Choose a week...</option>';
    
    const weeks = Object.keys(this.weeklyData).sort().reverse();
    weeks.forEach(week => {
      const option = document.createElement('option');
      option.value = week;
      option.textContent = week;
      weekSelect.appendChild(option);
    });
  }

  copyPlayersFromWeek() {
    const sourceWeekSelect = document.getElementById('copySourceWeek');
    const sourceWeek = sourceWeekSelect.value;
    
    if (!sourceWeek || !this.weeklyData[sourceWeek]) {
      alert('Please select a valid source week');
      return;
    }
    
    if (confirm(`Copy players from ${sourceWeek}? This will replace current players.`)) {
      const sourceWeekData = this.weeklyData[sourceWeek];
      
      // Clear current players
      this.players = [];
      this.playerCounter = 1;
      
      // Copy players but reset dread counts
      sourceWeekData.players.forEach(playerData => {
        const player = {
          id: `player_${this.playerCounter++}`,
          name: playerData.name,
          startDreads: 0,
          endDreads: 0,
          coverage: playerData.coverage || [],
          note: playerData.note || ''
        };
        this.players.push(player);
      });
      
      // Re-render all players
      this.renderAllPlayers();
      this.updateUI();
      
      alert(`Copied ${this.players.length} players from ${sourceWeek}. Dread counts reset to 0.`);
    }
  }

  // Data Persistence Methods
  saveToLocalStorage() {
    const data = {
      weeklyData: this.weeklyData,
      currentWeek: this.currentWeek,
      defaultTarget: this.defaultTarget,
      customTargets: this.customTargets,
      teamGoal: this.teamGoal,
      notificationSettings: this.notificationSettings,
      achievements: this.achievements,
      lastSaved: new Date().toISOString()
    };
    localStorage.setItem('dreadCalculatorData', JSON.stringify(data));
  }

  loadSavedData() {
    try {
      const savedData = localStorage.getItem('dreadCalculatorData');
      console.log('loadSavedData called, savedData exists:', !!savedData);
      if (savedData) {
        const data = JSON.parse(savedData);
        this.weeklyData = data.weeklyData || {};
        this.currentWeek = data.currentWeek || this.getCurrentWeek();
        this.defaultTarget = data.defaultTarget || 50;
        
        document.getElementById('defaultTarget').value = this.defaultTarget;
        this.updateWeekSelector();
        this.updateCurrentWeekDisplay();
        
        // Load current week if it exists
        if (this.weeklyData[this.currentWeek]) {
          console.log('Loading saved week data for:', this.currentWeek);
          this.loadWeekData(this.weeklyData[this.currentWeek]);
        } else {
          console.log('No saved data for current week:', this.currentWeek);
        }
      } else {
        console.log('No saved data found');
        this.updateCurrentWeekDisplay();
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      this.updateCurrentWeekDisplay();
    }
  }

  updateCurrentWeekDisplay() {
    const display = document.getElementById('currentWeekDisplay');
    if (display) {
      display.textContent = `Current Week: ${this.currentWeek}`;
    }
  }

  // Auto-save functionality
  autoSave() {
    if (this.players.length > 0) {
      this.saveToLocalStorage();
    }
  }

  // Export/Import functionality
  exportJson() {
    const data = {
      players: this.players,
      exportDate: new Date().toISOString(),
      totalDreads: this.players.reduce((sum, player) => sum + (player.endDreads - player.startDreads), 0)
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dread-calculator-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  exportCsv() {
    const headers = ['Player Name', 'Start Dreads', 'End Dreads', 'Dreads Killed', 'Target Reached', 'Coverage'];
    const rows = this.players.map(player => [
      player.name,
      player.startDreads,
      player.endDreads,
      player.endDreads - player.startDreads,
      this.isPlayerComplete(player) ? 'Yes' : 'No',
      player.coverage.join(', ')
    ]);
    
    const csvContent = [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dread-calculator-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  copyResults() {
    const results = this.players.map(player => 
      `${player.name}: ${player.endDreads - player.startDreads} dreads killed`
    ).join('\n');
    
    navigator.clipboard.writeText(results).then(() => {
      alert('Results copied to clipboard!');
    });
  }

  importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.players && Array.isArray(data.players)) {
          this.players = data.players;
          this.playerCounter = Math.max(...this.players.map(p => parseInt(p.id.split('_')[1]) || 0)) + 1;
          this.renderAllPlayers();
          this.updateUI();
          alert('Data imported successfully!');
        } else {
          throw new Error('Invalid data format');
        }
      } catch (error) {
        alert('Error importing data: ' + error.message);
      }
    };
    reader.readAsText(file);
  }

  renderAllPlayers() {
    const container = document.getElementById('playersContainer');
    container.innerHTML = '';
    this.players.forEach(player => this.renderPlayer(player));
  }

  // Initialize achievements and milestones
  initializeAchievements() {
    return [
      {
        id: 'first_kill',
        title: 'First Blood',
        description: 'Kill your first dreadnought',
        icon: '⚔️',
        condition: (player) => this.getPlayerTotalKills(player) >= 1,
        unlocked: false
      },
      {
        id: 'perfect_week',
        title: 'Perfect Week',
        description: 'All players reach their targets',
        icon: '⭐',
        condition: () => this.players.every(p => this.isPlayerComplete(p)),
        unlocked: false
      },
      {
        id: 'dread_master',
        title: 'Dread Master',
        description: 'Kill 100 dreadnoughts total',
        icon: '👑',
        condition: (player) => this.getPlayerTotalKills(player) >= 100,
        unlocked: false
      }
    ];
  }

  initializeMilestones() {
    return [
      {
        id: 'total_kills_50',
        title: '50 Total Kills',
        description: 'Reach 50 total alliance kills',
        target: 50,
        current: 0,
        icon: '🎯'
      },
      {
        id: 'total_kills_100',
        title: '100 Total Kills',
        description: 'Reach 100 total alliance kills',
        target: 100,
        current: 0,
        icon: '🏆'
      },
      {
        id: 'active_players_10',
        title: '10 Active Players',
        description: 'Have 10 active players in a week',
        target: 10,
        current: 0,
        icon: '👥'
      },
      {
        id: 'active_players_20',
        title: '20 Active Players',
        description: 'Have 20 active players in a week',
        target: 20,
        current: 0,
        icon: '👥'
      }
    ];
  }

  // Analytics and Charts
  initializeCharts() {
    this.createWeeklyTrendChart();
    this.createPlayerComparisonChart();
    this.createCompletionRateChart();
    this.createTopPerformersChart();
  }

  createWeeklyTrendChart() {
    const ctx = document.getElementById('weeklyTrendChart');
    if (!ctx) return;

    const weeks = Object.keys(this.weeklyData).sort();
    const totalKills = weeks.map(week => {
      const weekData = this.weeklyData[week];
      return weekData.players.reduce((sum, player) => sum + (player.endDreads - player.startDreads), 0);
    });

    this.charts.weeklyTrend = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Total Kills',
          data: totalKills,
          borderColor: '#64b5f6',
          backgroundColor: 'rgba(100, 181, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  createPlayerComparisonChart() {
    const ctx = document.getElementById('playerComparisonChart');
    if (!ctx) return;

    const playerData = this.players.map(player => ({
      name: player.name,
      kills: player.endDreads - player.startDreads
    })).sort((a, b) => b.kills - a.kills);

    this.charts.playerComparison = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: playerData.map(p => p.name),
        datasets: [{
          label: 'Dreads Killed',
          data: playerData.map(p => p.kills),
          backgroundColor: [
            '#10b981',
            '#3b82f6',
            '#f59e0b',
            '#ef4444',
            '#8b5cf6',
            '#06b6d4',
            '#84cc16',
            '#f97316'
          ],
          borderColor: '#ffffff',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  createCompletionRateChart() {
    const ctx = document.getElementById('completionRateChart');
    if (!ctx) return;

    const weeks = Object.keys(this.weeklyData).sort();
    const completionRates = weeks.map(week => {
      const weekData = this.weeklyData[week];
      const totalPlayers = weekData.players.length;
      const completedPlayers = weekData.players.filter(p => this.isPlayerComplete(p)).length;
      return totalPlayers > 0 ? (completedPlayers / totalPlayers) * 100 : 0;
    });

    this.charts.completionRate = new Chart(ctx, {
      type: 'line',
      data: {
        labels: weeks,
        datasets: [{
          label: 'Completion Rate %',
          data: completionRates,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: '#ffffff'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#ffffff'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            beginAtZero: true,
            max: 100,
            ticks: {
              color: '#ffffff',
              callback: function(value) {
                return value + '%';
              }
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }

  createTopPerformersChart() {
    const ctx = document.getElementById('topPerformersChart');
    if (!ctx) return;

    // Get top 5 performers this month
    const monthlyData = this.getMonthlyTopPerformers();
    
    this.charts.topPerformers = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: monthlyData.map(p => p.name),
        datasets: [{
          data: monthlyData.map(p => p.kills),
          backgroundColor: [
            '#ffd700',
            '#c0c0c0',
            '#cd7f32',
            '#10b981',
            '#3b82f6'
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#ffffff',
              padding: 20
            }
          }
        }
      }
    });
  }

  getMonthlyTopPerformers() {
    // Get current month's data
    const currentMonth = new Date().toISOString().substring(0, 7); // YYYY-MM
    const monthlyWeeks = Object.keys(this.weeklyData).filter(week => 
      week.startsWith(currentMonth.substring(0, 4)) && 
      week.includes(`-W${Math.ceil(new Date().getDate() / 7)}`)
    );

    const playerTotals = {};
    
    monthlyWeeks.forEach(week => {
      const weekData = this.weeklyData[week];
      weekData.players.forEach(player => {
        if (!playerTotals[player.name]) {
          playerTotals[player.name] = 0;
        }
        playerTotals[player.name] += player.endDreads - player.startDreads;
      });
    });

    return Object.entries(playerTotals)
      .map(([name, kills]) => ({ name, kills }))
      .sort((a, b) => b.kills - a.kills)
      .slice(0, 5);
  }

  updateCharts() {
    // Update all charts with current data
    if (this.charts.weeklyTrend) {
      this.charts.weeklyTrend.destroy();
      this.createWeeklyTrendChart();
    }
    if (this.charts.playerComparison) {
      this.charts.playerComparison.destroy();
      this.createPlayerComparisonChart();
    }
    if (this.charts.completionRate) {
      this.charts.completionRate.destroy();
      this.createCompletionRateChart();
    }
    if (this.charts.topPerformers) {
      this.charts.topPerformers.destroy();
      this.createTopPerformersChart();
    }
  }

  // Voice Input Methods
  startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.voiceRecognition = new SpeechRecognition();
    
    this.voiceRecognition.continuous = true;
    this.voiceRecognition.interimResults = true;
    this.voiceRecognition.lang = 'en-US';

    this.voiceRecognition.onstart = () => {
      this.isRecording = true;
      const voiceStatus = document.getElementById('voiceStatus');
      const voiceInputBtn = document.getElementById('voiceInputBtn');
      const stopVoiceBtn = document.getElementById('stopVoiceBtn');
      
      if (voiceStatus) voiceStatus.textContent = 'Listening... Speak now!';
      if (voiceInputBtn) voiceInputBtn.style.display = 'none';
      if (stopVoiceBtn) stopVoiceBtn.style.display = 'inline-block';
      if (voiceStatus) voiceStatus.classList.add('voice-recording');
    };

    this.voiceRecognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      
      if (finalTranscript) {
        this.processVoiceInput(finalTranscript);
      }
    };

    this.voiceRecognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopVoiceInput();
    };

    this.voiceRecognition.start();
  }

  stopVoiceInput() {
    if (this.voiceRecognition) {
      this.voiceRecognition.stop();
    }
    this.isRecording = false;
    const voiceStatus = document.getElementById('voiceStatus');
    const voiceInputBtn = document.getElementById('voiceInputBtn');
    const stopVoiceBtn = document.getElementById('stopVoiceBtn');
    
    if (voiceStatus) voiceStatus.textContent = 'Voice input stopped';
    if (voiceInputBtn) voiceInputBtn.style.display = 'inline-block';
    if (stopVoiceBtn) stopVoiceBtn.style.display = 'none';
    if (voiceStatus) voiceStatus.classList.remove('voice-recording');
  }

  processVoiceInput(transcript) {
    const results = document.getElementById('voiceResults');
    if (!results) return;
    
    results.innerHTML += `<p>Heard: "${transcript}"</p>`;
    
    // Simple voice command processing
    const lowerTranscript = transcript.toLowerCase();
    
    if (lowerTranscript.includes('add player')) {
      this.addPlayer();
      results.innerHTML += '<p>✅ Added new player</p>';
    } else if (lowerTranscript.includes('clear all')) {
      this.clearAllPlayers();
      results.innerHTML += '<p>✅ Cleared all players</p>';
    } else if (lowerTranscript.includes('save week')) {
      this.saveCurrentWeek();
      results.innerHTML += '<p>✅ Saved current week</p>';
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DreadCalculator;
}
