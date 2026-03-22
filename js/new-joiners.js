var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.NewJoinersController = {
  _containerEl: null,
  _users: [],
  _onViewInChart: null,

  init: function (containerEl, users, onViewInChart) {
    this._containerEl = containerEl;
    this._users = users;
    this._onViewInChart = onViewInChart;
    this._render();
  },

  _getNewJoiners: function () {
    var now = new Date();
    var cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - 30);
    var cutoffStr = cutoff.toISOString().split('T')[0];

    var joiners = [];
    for (var i = 0; i < this._users.length; i++) {
      var u = this._users[i];
      if (u.startDate && u.startDate >= cutoffStr) {
        joiners.push(u);
      }
    }

    // Sort most recent first
    joiners.sort(function (a, b) {
      return a.startDate < b.startDate ? 1 : a.startDate > b.startDate ? -1 : 0;
    });

    return joiners;
  },

  _render: function () {
    var self = this;
    this._containerEl.innerHTML = '';
    var joiners = this._getNewJoiners();

    // Header bar
    var header = document.createElement('div');
    header.className = 'newjoiners-header';
    header.innerHTML = '<span class="newjoiners-count">' + joiners.length + ' new joiner' + (joiners.length !== 1 ? 's' : '') + ' in the past 30 days</span>';
    this._containerEl.appendChild(header);

    if (joiners.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'newjoiners-empty';
      empty.textContent = 'No new joiners in the past 30 days.';
      this._containerEl.appendChild(empty);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'newjoiners-grid';

    for (var i = 0; i < joiners.length; i++) {
      grid.appendChild(this._createCard(joiners[i]));
    }

    this._containerEl.appendChild(grid);
  },

  _formatDate: function (dateStr) {
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
  },

  _daysAgo: function (dateStr) {
    var now = new Date();
    var parts = dateStr.split('-');
    var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    var diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return '1 day ago';
    return diff + ' days ago';
  },

  _createCard: function (user) {
    var self = this;
    var card = document.createElement('div');
    card.className = 'newjoiners-card';

    // Avatar
    var avatar = document.createElement('div');
    avatar.className = 'org-avatar newjoiners-avatar';
    var initials = user.displayName.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    if (user.photo) {
      avatar.innerHTML = '<img class="org-avatar-img" src="' + user.photo + '" alt="" />';
    } else {
      avatar.innerHTML = '<span>' + initials + '</span>';
    }
    card.appendChild(avatar);

    // Body
    var body = document.createElement('div');
    body.className = 'newjoiners-card-body';

    var nameEl = document.createElement('div');
    nameEl.className = 'newjoiners-card-name';
    nameEl.textContent = user.displayName;
    body.appendChild(nameEl);

    var titleEl = document.createElement('div');
    titleEl.className = 'newjoiners-card-title';
    titleEl.textContent = user.jobTitle;
    body.appendChild(titleEl);

    var parts = [];
    if (user.department) parts.push(user.department);
    if (user.officeLocation) parts.push(user.officeLocation);
    if (parts.length > 0) {
      var detailEl = document.createElement('div');
      detailEl.className = 'newjoiners-card-detail';
      detailEl.textContent = parts.join(' \u00B7 ');
      body.appendChild(detailEl);
    }

    // Start date
    var dateEl = document.createElement('div');
    dateEl.className = 'newjoiners-card-date';
    dateEl.innerHTML = 'Started ' + this._formatDate(user.startDate) + ' <span class="newjoiners-days-ago">(' + this._daysAgo(user.startDate) + ')</span>';
    body.appendChild(dateEl);

    // Action
    var footer = document.createElement('div');
    footer.className = 'newjoiners-card-footer';
    var actionBtn = document.createElement('button');
    actionBtn.type = 'button';
    actionBtn.className = 'directory-card-action';
    actionBtn.textContent = 'View in Org Chart \u2192';
    actionBtn.addEventListener('click', function () {
      self._onViewInChart(user.id);
    });
    footer.appendChild(actionBtn);
    body.appendChild(footer);

    card.appendChild(body);
    return card;
  }
};
