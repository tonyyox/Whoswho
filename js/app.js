var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.App = {
  _activeView: 'newjoiners',
  _data: null,

  init: function () {
    var CONFIG = WhosWho.CONFIG;
    var loadingEl = document.getElementById('loading-overlay');
    var loadingTextEl = document.getElementById('loading-text');
    var errorEl = document.getElementById('error-container');
    var errorMsgEl = document.getElementById('error-message');
    var retryBtn = document.getElementById('retry-button');

    var chartContainer = document.getElementById('chart-container');
    var directoryToolbar = document.getElementById('directory-toolbar');
    var directoryGridWrapper = document.getElementById('directory-grid-wrapper');
    var newjoinersContainer = document.getElementById('newjoiners-container');
    var searchInput = document.getElementById('search-input');
    var searchResults = document.getElementById('search-results');

    // Reset UI
    loadingEl.classList.remove('hidden');
    errorEl.classList.remove('visible');
    chartContainer.innerHTML = '';
    searchInput.value = '';

    retryBtn.addEventListener('click', function () { WhosWho.App.init(); });

    this._setupTabs();

    WhosWho.ChartRenderer.init(chartContainer);

    var dataPromise;

    if (CONFIG.useMockData) {
      loadingTextEl.textContent = 'Generating mock directory...';
      dataPromise = new Promise(function (resolve) {
        setTimeout(function () { resolve(WhosWho.generateMockData()); }, 200);
      });
    } else {
      dataPromise = WhosWho.SharePointService.getAllUsers(function (msg) { loadingTextEl.textContent = msg; })
        .then(function (users) {
          loadingTextEl.textContent = 'Loading manager relationships...';
          return WhosWho.SharePointService.fetchAllManagers(users, function (msg) { loadingTextEl.textContent = msg; })
            .then(function () {
              return users.map(function (u) {
                return { id: u.id, parentId: u.parentId, displayName: u.displayName, jobTitle: u.jobTitle,
                  department: u.department, mail: u.mail, officeLocation: u.officeLocation, photo: u.photo };
              });
            });
        });
    }

    var self = this;

    dataPromise.then(function (data) {
      self._data = data;

      // Compute depths for filtering
      WhosWho.DataUtils.computeDepths(data);

      loadingEl.classList.add('hidden');

      // Org Chart
      WhosWho.ChartRenderer.render(data);

      // Header search (quick-jump to org chart)
      WhosWho.SearchController.init(searchInput, searchResults, data, function (userId) {
        if (userId) {
          self.switchView('chart');
          WhosWho.ChartRenderer.highlightAndCenter(userId);
        } else {
          WhosWho.ChartRenderer.clearHighlight();
        }
      });

      // Directory
      WhosWho.DirectoryController.init(directoryToolbar, directoryGridWrapper, data, function (userId) {
        self.viewInChart(userId);
      });

      // New Joiners
      WhosWho.NewJoinersController.init(newjoinersContainer, data, function (userId) {
        self.viewInChart(userId);
      });

    }).catch(function (err) {
      console.error('Failed to load org chart data:', err);
      loadingEl.classList.add('hidden');
      errorMsgEl.textContent = 'Something went wrong: ' + (err.message || err) + '. Please try again.';
      errorEl.classList.add('visible');
    });
  },

  _setupTabs: function () {
    var self = this;
    var tabs = document.querySelectorAll('.view-tab');
    for (var i = 0; i < tabs.length; i++) {
      (function (tab) {
        tab.addEventListener('click', function () {
          self.switchView(tab.getAttribute('data-view'));
        });
      })(tabs[i]);
    }
  },

  switchView: function (viewName) {
    this._activeView = viewName;

    // Update tabs
    var tabs = document.querySelectorAll('.view-tab');
    for (var i = 0; i < tabs.length; i++) {
      if (tabs[i].getAttribute('data-view') === viewName) {
        tabs[i].classList.add('view-tab--active');
      } else {
        tabs[i].classList.remove('view-tab--active');
      }
    }

    // Update views
    var views = document.querySelectorAll('.view');
    for (var j = 0; j < views.length; j++) {
      if (views[j].id === viewName + '-view') {
        views[j].classList.add('view--active');
      } else {
        views[j].classList.remove('view--active');
      }
    }
  },

  viewInChart: function (userId) {
    this.switchView('chart');
    WhosWho.ChartRenderer.highlightAndCenter(userId);
  }
};

document.addEventListener('DOMContentLoaded', function () {
  WhosWho.App.init();
});
