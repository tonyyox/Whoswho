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

  _createCard: function (user) {
    var self = this;
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

    // Footer with action + depth badge
    var footer = document.createElement('div');
    footer.className = 'directory-card-footer';

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
