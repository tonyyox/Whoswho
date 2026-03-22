var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.DataUtils = {
  computeDepths: function (users) {
    var idMap = {}, childrenMap = {}, roots = [];
    var i;

    for (i = 0; i < users.length; i++) {
      idMap[users[i].id] = users[i];
      users[i]._depth = 0;
    }

    for (i = 0; i < users.length; i++) {
      var pid = users[i].parentId;
      if (pid && idMap[pid]) {
        if (!childrenMap[pid]) childrenMap[pid] = [];
        childrenMap[pid].push(users[i]);
      } else {
        roots.push(users[i]);
      }
    }

    // BFS
    var queue = roots.slice();
    for (i = 0; i < roots.length; i++) roots[i]._depth = 0;

    while (queue.length > 0) {
      var node = queue.shift();
      var children = childrenMap[node.id] || [];
      for (var c = 0; c < children.length; c++) {
        children[c]._depth = node._depth + 1;
        queue.push(children[c]);
      }
    }
  },

  getUniqueOffices: function (users) {
    var set = {};
    for (var i = 0; i < users.length; i++) {
      if (users[i].officeLocation) set[users[i].officeLocation] = true;
    }
    return Object.keys(set).sort();
  },

  getUniqueDepartments: function (users) {
    var set = {};
    for (var i = 0; i < users.length; i++) {
      if (users[i].department) set[users[i].department] = true;
    }
    return Object.keys(set).sort();
  },

  getMaxDepth: function (users) {
    var max = 0;
    for (var i = 0; i < users.length; i++) {
      if (users[i]._depth > max) max = users[i]._depth;
    }
    return max;
  },

  search: function (users, query) {
    if (!query) return users;
    var q = query.toLowerCase();
    var results = [];
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      if (u.displayName.toLowerCase().indexOf(q) !== -1 ||
          u.jobTitle.toLowerCase().indexOf(q) !== -1 ||
          u.department.toLowerCase().indexOf(q) !== -1 ||
          u.mail.toLowerCase().indexOf(q) !== -1 ||
          u.officeLocation.toLowerCase().indexOf(q) !== -1) {
        results.push(u);
      }
    }
    return results;
  }
};
