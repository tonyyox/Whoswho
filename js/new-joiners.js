var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.NewJoinersController = {
  _containerEl: null,
  _users: [],
  _onViewInChart: null,
  _flippedEl: null,

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

  _escHtml: function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  _getManagerName: function (parentId) {
    if (!parentId) return null;
    for (var i = 0; i < this._users.length; i++) {
      if (this._users[i].id === parentId) return this._users[i].displayName;
    }
    return null;
  },

  _cardBackHtml: function (node, managerName) {
    var self = this;
    var h = '';

    var initials = node.displayName.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    var avatarHtml = node.photo
      ? '<img class="org-avatar-img" src="' + node.photo + '" alt="" />'
      : '<span>' + initials + '</span>';
    h += '<div class="newjoiners-back-header">';
    h += '<div class="org-avatar newjoiners-avatar">' + avatarHtml + '</div>';
    h += '<div><div class="org-card-back-name">' + self._escHtml(node.displayName) + '</div>';
    h += '<div class="org-card-back-title">' + self._escHtml(node.jobTitle || '') + '</div></div>';
    h += '</div>';
    h += '<hr class="org-card-back-divider">';

    function section(label, value) {
      if (!value) return '';
      return '<div class="org-card-back-section">' +
        '<div class="org-card-back-section-label">' + label + '</div>' +
        '<div class="org-card-back-section-value">' + value + '</div></div>';
    }

    function tagSection(label, items) {
      if (!items || !items.length) return '';
      var tags = '';
      for (var i = 0; i < items.length; i++) tags += '<span class="org-card-back-tag">' + self._escHtml(items[i]) + '</span>';
      return '<div class="org-card-back-section">' +
        '<div class="org-card-back-section-label">' + label + '</div>' +
        '<div class="org-card-back-tags">' + tags + '</div></div>';
    }

    h += section('Department', self._escHtml(node.department || ''));
    h += section('Office', self._escHtml((node.city ? node.city + ', ' : '') + (node.country || node.officeLocation || '')));
    h += section('Email', node.mail ? '<a href="mailto:' + self._escHtml(node.mail) + '">' + self._escHtml(node.mail) + '</a>' : '');

    var phones = [];
    if (node.businessPhones && node.businessPhones.length) phones.push(self._escHtml(node.businessPhones[0]));
    if (node.mobilePhone) phones.push(self._escHtml(node.mobilePhone) + ' (mobile)');
    h += section('Phone', phones.join('<br>'));

    h += section('Manager', managerName ? self._escHtml(managerName) : '&mdash;');
    h += '<hr class="org-card-back-divider">';

    h += section('Job Description', self._escHtml(node.jobDescription || ''));
    h += section('About', self._escHtml(node.aboutMe || ''));
    h += tagSection('Skills', node.skills);
    h += tagSection('Interests', node.interests);
    h += tagSection('Responsibilities', node.responsibilities);

    return h;
  },

  _createCard: function (user) {
    var self = this;

    // Flip wrapper
    var flip = document.createElement('div');
    flip.className = 'newjoiners-card-flip';
    var inner = document.createElement('div');
    inner.className = 'newjoiners-card-inner';

    // ---- FRONT ----
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
    actionBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self._onViewInChart(user.id);
    });
    footer.appendChild(actionBtn);
    body.appendChild(footer);

    card.appendChild(body);

    // ---- BACK ----
    var back = document.createElement('div');
    back.className = 'newjoiners-card-back';
    var managerName = this._getManagerName(user.parentId);
    back.innerHTML = this._cardBackHtml(user, managerName);

    inner.appendChild(card);
    inner.appendChild(back);
    flip.appendChild(inner);

    // Flip on click
    card.addEventListener('click', function () {
      if (self._flippedEl && self._flippedEl !== flip) {
        self._flippedEl.classList.remove('flipped');
      }
      flip.classList.add('flipped');
      self._flippedEl = flip;
    });
    back.addEventListener('click', function (e) {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
      flip.classList.remove('flipped');
      if (self._flippedEl === flip) self._flippedEl = null;
    });

    return flip;
  }
};
