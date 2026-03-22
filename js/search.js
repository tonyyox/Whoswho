var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.SearchController = {
  _inputEl: null,
  _resultsEl: null,
  _users: [],
  _onSelect: null,

  init: function (inputEl, resultsEl, users, onSelect) {
    this._inputEl = inputEl;
    this._resultsEl = resultsEl;
    this._users = users;
    this._onSelect = onSelect;

    var self = this;
    inputEl.addEventListener('input', function () {
      var query = inputEl.value;
      if (!query || query.length < 2) { self.hideResults(); if (!query) onSelect(null); return; }
      self.showResults(self.search(query));
    });
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Escape') self.hideResults(); });
    document.addEventListener('click', function (e) {
      if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) self.hideResults();
    });
  },

  search: function (query) {
    var q = query.toLowerCase(), results = [];
    for (var i = 0; i < this._users.length && results.length < 10; i++) {
      var u = this._users[i];
      if (u.displayName.toLowerCase().indexOf(q) !== -1 || u.jobTitle.toLowerCase().indexOf(q) !== -1 ||
          u.department.toLowerCase().indexOf(q) !== -1 || u.mail.toLowerCase().indexOf(q) !== -1)
        results.push(u);
    }
    return results;
  },

  showResults: function (results) {
    var self = this;
    this._resultsEl.innerHTML = '';
    if (results.length === 0) { this.hideResults(); return; }
    for (var i = 0; i < results.length; i++) {
      (function (user) {
        var btn = document.createElement('button');
        btn.className = 'search-result-item';
        btn.type = 'button';
        btn.innerHTML = '<div class="search-result-name">' + user.displayName + '</div>' +
          '<div class="search-result-detail">' + user.jobTitle + (user.department ? ' \u2022 ' + user.department : '') + '</div>';
        btn.addEventListener('click', function () {
          self._inputEl.value = user.displayName;
          self.hideResults();
          self._onSelect(user.id);
        });
        self._resultsEl.appendChild(btn);
      })(results[i]);
    }
    this._resultsEl.classList.add('visible');
  },

  hideResults: function () {
    this._resultsEl.classList.remove('visible');
  }
};
