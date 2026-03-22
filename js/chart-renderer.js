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
    this._drawTree();
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
    var card = document.createElement('div');
    card.className = 'org-card';
    if (node.data.id === this._highlightedId) card.classList.add('org-card--highlighted');
    card.setAttribute('data-id', node.data.id);
    card.innerHTML = this._cardHtml(node.data, node.children.length);

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
    wrapper.appendChild(card);

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

  highlightAndCenter: function (userId) {
    this._highlightedId = userId;
    var parentMap = {};
    for (var i = 0; i < this._data.length; i++) parentMap[this._data[i].id] = this._data[i].parentId;
    var current = parentMap[userId];
    while (current) { this._collapsed[current] = false; current = parentMap[current]; }
    this._drawTree();
    var el = this._container.querySelector('[data-id="' + userId + '"]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  },

  clearHighlight: function () {
    this._highlightedId = null;
    this._drawTree();
  }
};
