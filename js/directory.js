var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.DirectoryController = {
  _toolbarEl: null,
  _gridWrapperEl: null,
  _gridEl: null,
  _countEl: null,
  _users: [],
  _filtered: [],
  _onViewInChart: null,
  _displayLimit: 100,
  _filters: { query: '', offices: [], departments: [] },
  _flippedEl: null,

  init: function (toolbarEl, gridWrapperEl, users, onViewInChart) {
    this._toolbarEl = toolbarEl;
    this._gridWrapperEl = gridWrapperEl;
    this._users = users;
    this._onViewInChart = onViewInChart;

    // Create grid inside wrapper
    this._gridEl = document.createElement('div');
    this._gridEl.className = 'directory-grid';
    this._gridWrapperEl.appendChild(this._gridEl);

    this._buildToolbar();
    this._applyFilters();
  },

  _buildToolbar: function () {
    var self = this;
    var DataUtils = WhosWho.DataUtils;
    this._toolbarEl.innerHTML = '';

    // Search input
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'directory-search';
    searchInput.placeholder = 'Search people...';
    searchInput.autocomplete = 'off';
    searchInput.addEventListener('input', function () {
      self._filters.query = searchInput.value;
      self._displayLimit = 100;
      self._applyFilters();
    });
    this._toolbarEl.appendChild(searchInput);

    // Office multi-select
    this._buildOfficeFilter();

    // Department multi-select
    this._buildDepartmentFilter();

    // Result count
    this._countEl = document.createElement('span');
    this._countEl.className = 'directory-result-count';
    this._toolbarEl.appendChild(this._countEl);
  },

  _buildOfficeFilter: function () {
    var self = this;
    var offices = WhosWho.DataUtils.getUniqueOffices(this._users);

    var wrapper = document.createElement('div');
    wrapper.className = 'filter-multiselect';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-multiselect-btn';
    btn.textContent = 'All Offices';

    var menu = document.createElement('div');
    menu.className = 'filter-multiselect-menu';

    for (var i = 0; i < offices.length; i++) {
      (function (office) {
        var label = document.createElement('label');
        label.className = 'filter-multiselect-option';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = office;
        cb.addEventListener('change', function () {
          var selected = self._filters.offices;
          if (cb.checked) {
            selected.push(office);
          } else {
            var idx = selected.indexOf(office);
            if (idx !== -1) selected.splice(idx, 1);
          }
          btn.textContent = selected.length === 0 ? 'All Offices' : selected.length + ' office' + (selected.length > 1 ? 's' : '');
          self._displayLimit = 100;
          self._applyFilters();
        });
        var span = document.createElement('span');
        span.textContent = office;
        label.appendChild(cb);
        label.appendChild(span);
        menu.appendChild(label);
      })(offices[i]);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('visible');
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) menu.classList.remove('visible');
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    this._toolbarEl.appendChild(wrapper);
  },

  _buildDepartmentFilter: function () {
    var self = this;
    var departments = WhosWho.DataUtils.getUniqueDepartments(this._users);

    var wrapper = document.createElement('div');
    wrapper.className = 'filter-multiselect';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter-multiselect-btn';
    btn.textContent = 'All Departments';

    var menu = document.createElement('div');
    menu.className = 'filter-multiselect-menu';

    for (var i = 0; i < departments.length; i++) {
      (function (dept) {
        var label = document.createElement('label');
        label.className = 'filter-multiselect-option';
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = dept;
        cb.addEventListener('change', function () {
          var selected = self._filters.departments;
          if (cb.checked) {
            selected.push(dept);
          } else {
            var idx = selected.indexOf(dept);
            if (idx !== -1) selected.splice(idx, 1);
          }
          btn.textContent = selected.length === 0 ? 'All Departments' : selected.length + ' dept' + (selected.length > 1 ? 's' : '');
          self._displayLimit = 100;
          self._applyFilters();
        });
        var span = document.createElement('span');
        span.textContent = dept;
        label.appendChild(cb);
        label.appendChild(span);
        menu.appendChild(label);
      })(departments[i]);
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      menu.classList.toggle('visible');
    });

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) menu.classList.remove('visible');
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(menu);
    this._toolbarEl.appendChild(wrapper);
  },

  _applyFilters: function () {
    var DataUtils = WhosWho.DataUtils;
    var results = this._users;

    // Text search
    if (this._filters.query) {
      results = DataUtils.search(results, this._filters.query);
    }

    // Office filter
    if (this._filters.offices.length > 0) {
      var officeSet = {};
      for (var i = 0; i < this._filters.offices.length; i++) officeSet[this._filters.offices[i]] = true;
      results = results.filter(function (u) { return officeSet[u.officeLocation]; });
    }

    // Department filter
    if (this._filters.departments.length > 0) {
      var deptSet = {};
      for (var j = 0; j < this._filters.departments.length; j++) deptSet[this._filters.departments[j]] = true;
      results = results.filter(function (u) { return deptSet[u.department]; });
    }

    this._filtered = results;
    this._renderCards();
  },

  _renderCards: function () {
    var self = this;
    this._gridEl.innerHTML = '';
    var results = this._filtered;
    var total = results.length;

    // Update count
    if (this._countEl) {
      if (total === this._users.length) {
        this._countEl.textContent = total + ' people';
      } else {
        this._countEl.textContent = total + ' of ' + this._users.length + ' people';
      }
    }

    if (total === 0) {
      var empty = document.createElement('div');
      empty.className = 'directory-empty';
      empty.textContent = 'No people match your filters.';
      this._gridEl.appendChild(empty);
      return;
    }

    var limit = Math.min(total, this._displayLimit);
    for (var i = 0; i < limit; i++) {
      this._gridEl.appendChild(this._createCard(results[i]));
    }

    // Show more button
    if (total > limit) {
      var moreDiv = document.createElement('div');
      moreDiv.className = 'directory-show-more';
      var moreBtn = document.createElement('button');
      moreBtn.type = 'button';
      moreBtn.className = 'directory-show-more-btn';
      moreBtn.textContent = 'Show more (' + (total - limit) + ' remaining)';
      moreBtn.addEventListener('click', function () {
        self._displayLimit += 100;
        self._renderCards();
      });
      moreDiv.appendChild(moreBtn);
      this._gridEl.appendChild(moreDiv);
    }
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

  _createCard: function (user) {
    var self = this;

    // Flip wrapper
    var flip = document.createElement('div');
    flip.className = 'directory-card-flip';
    var inner = document.createElement('div');
    inner.className = 'directory-card-inner';

    // ---- FRONT ----
    var card = document.createElement('div');
    card.className = 'directory-card';

    // Avatar
    var avatar = document.createElement('div');
    avatar.className = 'org-avatar';
    var initials = user.displayName.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    if (user.photo) {
      avatar.innerHTML = '<img class="org-avatar-img" src="' + user.photo + '" alt="" />';
    } else {
      avatar.innerHTML = '<span>' + initials + '</span>';
    }
    card.appendChild(avatar);

    // Body
    var body = document.createElement('div');
    body.className = 'directory-card-body';

    var nameEl = document.createElement('div');
    nameEl.className = 'directory-card-name';
    nameEl.textContent = user.displayName;
    body.appendChild(nameEl);

    var titleEl = document.createElement('div');
    titleEl.className = 'directory-card-title';
    titleEl.textContent = user.jobTitle;
    body.appendChild(titleEl);

    var parts = [];
    if (user.department) parts.push(user.department);
    if (user.officeLocation) parts.push(user.officeLocation);
    if (parts.length > 0) {
      var detailEl = document.createElement('div');
      detailEl.className = 'directory-card-detail';
      detailEl.textContent = parts.join(' \u00B7 ');
      body.appendChild(detailEl);
    }

    // Footer with action
    var footer = document.createElement('div');
    footer.className = 'directory-card-footer';

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
    back.className = 'directory-card-back';
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
  },

  _cardBackHtml: function (node, managerName) {
    var self = this;
    var h = '';

    // Avatar + name header
    var initials = node.displayName.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    var avatarHtml = node.photo
      ? '<img class="org-avatar-img" src="' + node.photo + '" alt="" />'
      : '<span>' + initials + '</span>';
    h += '<div class="directory-back-header">';
    h += '<div class="org-avatar">' + avatarHtml + '</div>';
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
  }
};
