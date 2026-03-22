var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.ChartRenderer = {
  _container: null,
  _data: null,
  _tree: null,
  _highlightedId: null,
  _collapsed: {},

  init: function (containerEl) {
    this._container = containerEl;
  },

  _buildTree: function (data) {
    var map = {}, roots = [], i;
    for (i = 0; i < data.length; i++) map[data[i].id] = { data: data[i], children: [] };
    for (i = 0; i < data.length; i++) {
      var node = map[data[i].id], parentId = data[i].parentId;
      if (parentId && map[parentId]) map[parentId].children.push(node);
      else roots.push(node);
    }
    return roots;
  },

  render: function (data) {
    this._data = data;
    this._tree = this._buildTree(data);
    this._collapseAll();
    this._drawTree();
  },

  _collapseAll: function () {
    this._collapsed = {};
    for (var i = 0; i < this._data.length; i++) {
      this._collapsed[this._data[i].id] = true;
    }
  },

  _drawTree: function () {
    this._container.innerHTML = '';
    var viewport = document.createElement('div');
    viewport.className = 'org-viewport';
    var treeEl = document.createElement('div');
    treeEl.className = 'org-tree';
    for (var i = 0; i < this._tree.length; i++) treeEl.appendChild(this._renderNode(this._tree[i]));
    viewport.appendChild(treeEl);
    this._container.appendChild(viewport);
  },

  _renderNode: function (node) {
    var self = this;
    var wrapper = document.createElement('div');
    wrapper.className = 'org-node-wrapper';

    // Flip container
    var flipEl = document.createElement('div');
    flipEl.className = 'org-card-flip';
    flipEl.setAttribute('data-id', node.data.id);
    var inner = document.createElement('div');
    inner.className = 'org-card-inner';

    // Front
    var card = document.createElement('div');
    card.className = 'org-card';
    if (node.data.id === this._highlightedId) card.classList.add('org-card--highlighted');
    card.innerHTML = this._cardHtml(node.data, node.children.length);

    // Back
    var back = document.createElement('div');
    back.className = 'org-card-back';
    var managerName = this._getManagerName(node.data.parentId);
    back.innerHTML = this._cardBackHtml(node.data, managerName);

    inner.appendChild(card);
    inner.appendChild(back);
    flipEl.appendChild(inner);

    // Flip on card click (not on toggle button)
    card.addEventListener('click', function () {
      flipEl.classList.add('flipped');
    });
    back.addEventListener('click', function () {
      flipEl.classList.remove('flipped');
    });

    if (node.children.length > 0) {
      var toggleBtn = card.querySelector('.org-toggle');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          self._collapsed[node.data.id] = !self._collapsed[node.data.id];
          self._drawTree();
        });
      }
    }
    wrapper.appendChild(flipEl);

    if (node.children.length > 0 && !this._collapsed[node.data.id]) {
      var childrenContainer = document.createElement('div');
      childrenContainer.className = 'org-children';
      for (var i = 0; i < node.children.length; i++) childrenContainer.appendChild(this._renderNode(node.children[i]));
      wrapper.appendChild(childrenContainer);
    }
    return wrapper;
  },

  _cardHtml: function (node, childCount) {
    var initials = node.displayName.split(' ').map(function (n) { return n[0]; }).join('').substring(0, 2).toUpperCase();
    var photoHtml = node.photo
      ? '<img class="org-avatar-img" src="' + node.photo + '" alt="" />'
      : '<span>' + initials + '</span>';

    var toggleHtml = '';
    if (childCount > 0) {
      var isCollapsed = this._collapsed[node.id];
      var arrow = isCollapsed ? '&#9654;' : '&#9660;';
      toggleHtml = '<button class="org-toggle" title="Expand/Collapse">' + arrow + ' ' + childCount + '</button>';
    }

    var parts = [];
    if (node.department) parts.push(node.department);
    if (node.officeLocation) parts.push(node.officeLocation);
    var metaHtml = parts.length > 0 ? '<div class="org-card-meta">' + parts.join(' &middot; ') + '</div>' : '';

    return '<div class="org-avatar">' + photoHtml + '</div>' +
      '<div class="org-card-info">' +
        '<div class="org-card-name">' + node.displayName + '</div>' +
        '<div class="org-card-title">' + (node.jobTitle || '') + '</div>' +
        metaHtml +
      '</div>' + toggleHtml;
  },

  _getManagerName: function (parentId) {
    if (!parentId || !this._data) return null;
    for (var i = 0; i < this._data.length; i++) {
      if (this._data[i].id === parentId) return this._data[i].displayName;
    }
    return null;
  },

  _escHtml: function (str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  },

  _cardBackHtml: function (node, managerName) {
    var self = this;
    var h = '';
    h += '<div class="org-card-back-name">' + self._escHtml(node.displayName) + '</div>';
    h += '<div class="org-card-back-title">' + self._escHtml(node.jobTitle || '') + '</div>';
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

    // Contact
    h += section('Department', self._escHtml(node.department || ''));
    h += section('Office', self._escHtml((node.city ? node.city + ', ' : '') + (node.country || node.officeLocation || '')));
    h += section('Email', node.mail ? '<a href="mailto:' + self._escHtml(node.mail) + '">' + self._escHtml(node.mail) + '</a>' : '');

    var phones = [];
    if (node.businessPhones && node.businessPhones.length) phones.push(self._escHtml(node.businessPhones[0]));
    if (node.mobilePhone) phones.push(self._escHtml(node.mobilePhone) + ' (mobile)');
    h += section('Phone', phones.join('<br>'));

    h += section('Manager', managerName ? self._escHtml(managerName) : '&mdash;');
    h += '<hr class="org-card-back-divider">';

    // Role
    h += section('Job Description', self._escHtml(node.jobDescription || ''));
    h += section('About', self._escHtml(node.aboutMe || ''));
    h += tagSection('Skills', node.skills);
    h += tagSection('Interests', node.interests);
    h += tagSection('Responsibilities', node.responsibilities);

    return h;
  },

  highlightAndCenter: function (userId) {
    this._highlightedId = userId;

    // Collapse everything first
    this._collapseAll();

    // Build parent lookup
    var parentMap = {};
    for (var i = 0; i < this._data.length; i++) parentMap[this._data[i].id] = this._data[i].parentId;

    // Open the ancestor chain from target to root
    var current = parentMap[userId];
    while (current) { this._collapsed[current] = false; current = parentMap[current]; }

    // Open the target node itself so its direct children are visible
    this._collapsed[userId] = false;

    this._drawTree();
    var el = this._container.querySelector('[data-id="' + userId + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  },

  clearHighlight: function () {
    this._highlightedId = null;
    this._drawTree();
  }
};
