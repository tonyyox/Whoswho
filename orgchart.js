(function () {
  'use strict';

  // =========================================================================
  // Configuration
  // =========================================================================

  var CONFIG = {
    // Set to true to test locally with mock data (no SharePoint needed).
    // Set to false when deployed to a SharePoint document library.
    useMockData: true,

    // Override if auto-detection fails. Leave blank for auto-detect.
    // Example: 'https://mintelgroup.sharepoint.com/sites/MySite'
    siteUrl: '',

    // SharePoint Search People result source ID
    peopleSourceId: 'b09a7990-05ea-4af9-81ef-edfab16c4e31',

    // How many users to fetch per page
    pageSize: 500,

    // How many manager lookups to run in parallel
    managerBatchSize: 8
  };

  // =========================================================================
  // Mock Data (for local testing)
  // =========================================================================

  var MOCK_USERS = [
    { id: '1',  parentId: null, displayName: 'Sarah Chen',       jobTitle: 'CEO',                   department: 'Executive',   mail: 'sarah.chen@example.com',     officeLocation: 'London',    photo: null },
    { id: '2',  parentId: '1',  displayName: 'James Wilson',     jobTitle: 'CTO',                   department: 'Technology',  mail: 'james.wilson@example.com',   officeLocation: 'London',    photo: null },
    { id: '3',  parentId: '1',  displayName: 'Maria Garcia',     jobTitle: 'CFO',                   department: 'Finance',     mail: 'maria.garcia@example.com',   officeLocation: 'New York',  photo: null },
    { id: '4',  parentId: '1',  displayName: 'David Kim',        jobTitle: 'VP of People',          department: 'HR',          mail: 'david.kim@example.com',      officeLocation: 'London',    photo: null },
    { id: '5',  parentId: '2',  displayName: 'Emma Thompson',    jobTitle: 'Engineering Manager',   department: 'Technology',  mail: 'emma.thompson@example.com',  officeLocation: 'London',    photo: null },
    { id: '6',  parentId: '2',  displayName: 'Alex Patel',       jobTitle: 'Product Manager',       department: 'Product',     mail: 'alex.patel@example.com',     officeLocation: 'Berlin',    photo: null },
    { id: '7',  parentId: '3',  displayName: 'Lisa Wang',        jobTitle: 'Financial Analyst',     department: 'Finance',     mail: 'lisa.wang@example.com',      officeLocation: 'New York',  photo: null },
    { id: '8',  parentId: '5',  displayName: 'Tom Brown',        jobTitle: 'Senior Developer',      department: 'Technology',  mail: 'tom.brown@example.com',      officeLocation: 'London',    photo: null },
    { id: '9',  parentId: '5',  displayName: 'Priya Sharma',     jobTitle: 'Senior Developer',      department: 'Technology',  mail: 'priya.sharma@example.com',   officeLocation: 'Mumbai',    photo: null },
    { id: '10', parentId: '6',  displayName: 'Chris Johnson',    jobTitle: 'UX Designer',           department: 'Product',     mail: 'chris.johnson@example.com',  officeLocation: 'Berlin',    photo: null },
    { id: '11', parentId: '4',  displayName: 'Rachel Adams',     jobTitle: 'HR Business Partner',   department: 'HR',          mail: 'rachel.adams@example.com',   officeLocation: 'London',    photo: null },
    { id: '12', parentId: '5',  displayName: 'Marcus Lee',       jobTitle: 'DevOps Engineer',       department: 'Technology',  mail: 'marcus.lee@example.com',     officeLocation: 'Sydney',    photo: null }
  ];

  // =========================================================================
  // SharePoint API Service
  // =========================================================================

  var SharePointService = {
    _siteUrl: null,

    getSiteUrl: function () {
      if (CONFIG.siteUrl) return CONFIG.siteUrl;
      if (this._siteUrl) return this._siteUrl;

      // Try SharePoint page context
      if (window._spPageContextInfo && window._spPageContextInfo.webAbsoluteUrl) {
        this._siteUrl = window._spPageContextInfo.webAbsoluteUrl;
        return this._siteUrl;
      }

      // Parse from URL: https://tenant.sharepoint.com/sites/SiteName/...
      var match = window.location.href.match(/(https:\/\/[^/]+\/sites\/[^/]+)/);
      if (match) {
        this._siteUrl = match[1];
        return this._siteUrl;
      }

      // Fallback to origin
      this._siteUrl = window.location.origin;
      return this._siteUrl;
    },

    fetchJson: function (url) {
      return fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json;odata=verbose',
          'Content-Type': 'application/json;odata=verbose'
        },
        credentials: 'same-origin'
      }).then(function (response) {
        if (response.status === 429) {
          // Throttled - wait 1s and retry once
          return new Promise(function (resolve) {
            setTimeout(resolve, 1000);
          }).then(function () {
            return fetch(url, {
              method: 'GET',
              headers: {
                'Accept': 'application/json;odata=verbose',
                'Content-Type': 'application/json;odata=verbose'
              },
              credentials: 'same-origin'
            });
          }).then(function (retryResponse) {
            if (!retryResponse.ok) {
              throw new Error('API returned ' + retryResponse.status + ': ' + retryResponse.statusText);
            }
            return retryResponse.json();
          });
        }
        if (!response.ok) {
          throw new Error('API returned ' + response.status + ': ' + response.statusText);
        }
        return response.json();
      });
    },

    getAllUsers: function (onProgress) {
      var self = this;
      var siteUrl = this.getSiteUrl();
      var users = [];
      var startRow = 0;

      function fetchPage() {
        var searchUrl =
          siteUrl + '/_api/search/query' +
          "?querytext='*'" +
          "&sourceid='" + CONFIG.peopleSourceId + "'" +
          "&selectproperties='AccountName,PreferredName,JobTitle,Department,WorkEmail,OfficeNumber,WorkPhone,PictureURL,Path,UserProfile_GUID'" +
          '&rowlimit=' + CONFIG.pageSize +
          '&startrow=' + startRow;

        return self.fetchJson(searchUrl).then(function (data) {
          var results = data.d && data.d.query &&
            data.d.query.PrimaryQueryResult &&
            data.d.query.PrimaryQueryResult.RelevantResults;

          if (!results) return users;

          var totalRows = results.TotalRows || 0;
          var rows = (results.Table && results.Table.Rows && results.Table.Rows.results) || [];

          for (var i = 0; i < rows.length; i++) {
            var cells = {};
            var cellArray = (rows[i].Cells && rows[i].Cells.results) || [];
            for (var j = 0; j < cellArray.length; j++) {
              if (cellArray[j].Key && cellArray[j].Value) {
                cells[cellArray[j].Key] = cellArray[j].Value;
              }
            }

            var accountName = cells['AccountName'] || '';
            if (!accountName) continue;

            users.push({
              id: cells['UserProfile_GUID'] || accountName,
              displayName: cells['PreferredName'] || 'Unknown',
              jobTitle: cells['JobTitle'] || '',
              department: cells['Department'] || '',
              mail: cells['WorkEmail'] || '',
              officeLocation: cells['OfficeNumber'] || '',
              userPrincipalName: accountName,
              parentId: null,
              photo: cells['PictureURL'] || null
            });
          }

          if (onProgress) onProgress('Loading users... (' + users.length + '/' + totalRows + ')');

          startRow += CONFIG.pageSize;
          if (startRow < totalRows) {
            return fetchPage();
          }
          return users;
        });
      }

      return fetchPage();
    },

    fetchAllManagers: function (users, onProgress) {
      var self = this;
      var siteUrl = this.getSiteUrl();

      // Build lookup: accountName -> user
      var accountMap = {};
      for (var i = 0; i < users.length; i++) {
        accountMap[users[i].userPrincipalName.toLowerCase()] = users[i];
      }

      var completed = 0;
      var total = users.length;
      var index = 0;

      function processBatch() {
        var batch = users.slice(index, index + CONFIG.managerBatchSize);
        if (batch.length === 0) return Promise.resolve();

        index += batch.length;

        var promises = batch.map(function (user) {
          var encodedAccount = encodeURIComponent('i:0#.f|membership|' + user.userPrincipalName);
          var profileUrl =
            siteUrl + '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)' +
            "?@v='" + encodedAccount + "'" +
            '&$select=UserProfileProperties';

          return self.fetchJson(profileUrl).then(function (profileData) {
            var properties = (profileData.d && profileData.d.UserProfileProperties &&
              profileData.d.UserProfileProperties.results) || [];

            for (var p = 0; p < properties.length; p++) {
              if (properties[p].Key === 'Manager' && properties[p].Value) {
                var managerAccount = properties[p].Value.toLowerCase();
                var managerUser = accountMap[managerAccount];
                if (managerUser) {
                  user.parentId = managerUser.id;
                }
                break;
              }
            }
          }).catch(function () {
            // Skip - user will appear as root node
          }).then(function () {
            completed++;
            if (onProgress) onProgress('Loading managers... (' + completed + '/' + total + ')');
          });
        });

        return Promise.all(promises).then(function () {
          if (index < users.length) return processBatch();
        });
      }

      return processBatch();
    }
  };

  // =========================================================================
  // Chart Renderer
  // =========================================================================

  var ChartRenderer = {
    _chart: null,
    _data: null,
    _highlightedId: null,

    init: function (containerEl) {
      this._container = containerEl;
    },

    render: function (data) {
      this._data = data;
      this._container.innerHTML = '';

      this._chart = new d3.OrgChart()
        .container(this._container)
        .data(data)
        .nodeId(function (d) { return d.id; })
        .parentNodeId(function (d) { return d.parentId; })
        .nodeWidth(function () { return 280; })
        .nodeHeight(function () { return 140; })
        .childrenMargin(function () { return 60; })
        .siblingsMargin(function () { return 30; })
        .compactMarginBetween(function () { return 35; })
        .compactMarginPair(function () { return 30; })
        .neighbourMargin(function () { return 30; })
        .nodeContent(function (d) {
          return ChartRenderer._nodeTemplate(d.data, d.height);
        })
        .render();
    },

    highlightAndCenter: function (userId) {
      this._highlightedId = userId;
      // Re-render with new highlight, then center
      this._chart
        .nodeContent(function (d) {
          return ChartRenderer._nodeTemplate(d.data, d.height);
        })
        .render();

      try {
        this._chart.setCentered(userId).render();
      } catch (e) {
        console.warn('Could not center on node:', e);
      }
    },

    clearHighlight: function () {
      this._highlightedId = null;
      this._chart
        .nodeContent(function (d) {
          return ChartRenderer._nodeTemplate(d.data, d.height);
        })
        .render();
    },

    _nodeTemplate: function (node, height) {
      var isHighlighted = node.id === ChartRenderer._highlightedId;
      var borderColor = isHighlighted ? '#0078d4' : '#e1e1e1';
      var bgColor = isHighlighted ? '#f0f6ff' : '#ffffff';

      var initials = node.displayName
        .split(' ')
        .map(function (n) { return n[0]; })
        .join('')
        .substring(0, 2)
        .toUpperCase();

      var photoHtml = node.photo
        ? '<img src="' + node.photo + '" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" />'
        : initials;

      var deptHtml = node.department ? '<div>\uD83D\uDCC1 ' + node.department + '</div>' : '';
      var officeHtml = node.officeLocation ? '<div>\uD83D\uDCCD ' + node.officeLocation + '</div>' : '';

      return '' +
        '<div style="' +
          'padding: 16px;' +
          'border-radius: 8px;' +
          'border: 2px solid ' + borderColor + ';' +
          'background-color: ' + bgColor + ';' +
          'font-family: Segoe UI, Tahoma, Geneva, Verdana, sans-serif;' +
          'height: ' + height + 'px;' +
          'box-sizing: border-box;' +
          'display: flex;' +
          'flex-direction: column;' +
          'transition: all 0.3s ease;' +
          'box-shadow: 0 2px 4px rgba(0,0,0,0.1);' +
        '">' +
          '<div style="display: flex; align-items: center; margin-bottom: 8px;">' +
            '<div style="' +
              'width: 40px;' +
              'height: 40px;' +
              'border-radius: 50%;' +
              'background: linear-gradient(135deg, #0078d4, #106ebe);' +
              'color: white;' +
              'display: flex;' +
              'align-items: center;' +
              'justify-content: center;' +
              'font-size: 16px;' +
              'font-weight: 600;' +
              'margin-right: 12px;' +
              'flex-shrink: 0;' +
            '">' + photoHtml + '</div>' +
            '<div style="overflow: hidden;">' +
              '<div style="font-weight: 600; font-size: 14px; color: #323130; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                node.displayName +
              '</div>' +
              '<div style="font-size: 12px; color: #605e5c; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' +
                node.jobTitle +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div style="font-size: 11px; color: #8a8886; margin-top: auto;">' +
            deptHtml + officeHtml +
          '</div>' +
        '</div>';
    }
  };

  // =========================================================================
  // Search Controller
  // =========================================================================

  var SearchController = {
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
        if (!query || query.length < 2) {
          self.hideResults();
          if (!query) onSelect(null);
          return;
        }
        var results = self.search(query);
        self.showResults(results);
      });

      inputEl.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          self.hideResults();
        }
      });

      // Close results when clicking outside
      document.addEventListener('click', function (e) {
        if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
          self.hideResults();
        }
      });
    },

    search: function (query) {
      var q = query.toLowerCase();
      var results = [];

      for (var i = 0; i < this._users.length && results.length < 10; i++) {
        var user = this._users[i];
        if (
          user.displayName.toLowerCase().indexOf(q) !== -1 ||
          user.jobTitle.toLowerCase().indexOf(q) !== -1 ||
          user.department.toLowerCase().indexOf(q) !== -1 ||
          user.mail.toLowerCase().indexOf(q) !== -1
        ) {
          results.push(user);
        }
      }

      return results;
    },

    showResults: function (results) {
      var self = this;
      this._resultsEl.innerHTML = '';

      if (results.length === 0) {
        this.hideResults();
        return;
      }

      for (var i = 0; i < results.length; i++) {
        (function (user) {
          var btn = document.createElement('button');
          btn.className = 'search-result-item';
          btn.type = 'button';
          btn.innerHTML =
            '<div class="search-result-name">' + user.displayName + '</div>' +
            '<div class="search-result-detail">' +
              user.jobTitle +
              (user.department ? ' \u2022 ' + user.department : '') +
            '</div>';
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

  // =========================================================================
  // App Controller
  // =========================================================================

  var App = {
    init: function () {
      var loadingEl = document.getElementById('loading-overlay');
      var loadingTextEl = document.getElementById('loading-text');
      var errorEl = document.getElementById('error-container');
      var errorMsgEl = document.getElementById('error-message');
      var chartEl = document.getElementById('chart-container');
      var searchInput = document.getElementById('search-input');
      var searchResults = document.getElementById('search-results');
      var retryBtn = document.getElementById('retry-button');

      // Reset UI
      loadingEl.classList.remove('hidden');
      errorEl.classList.remove('visible');
      chartEl.innerHTML = '';
      searchInput.value = '';

      retryBtn.addEventListener('click', function () {
        App.init();
      });

      ChartRenderer.init(chartEl);

      var dataPromise;

      if (CONFIG.useMockData) {
        loadingTextEl.textContent = 'Loading mock data...';
        dataPromise = new Promise(function (resolve) {
          setTimeout(function () { resolve(MOCK_USERS); }, 300);
        });
      } else {
        dataPromise = SharePointService.getAllUsers(function (msg) {
          loadingTextEl.textContent = msg;
        }).then(function (users) {
          loadingTextEl.textContent = 'Loading manager relationships...';
          return SharePointService.fetchAllManagers(users, function (msg) {
            loadingTextEl.textContent = msg;
          }).then(function () {
            // Remove SP-specific field before passing to chart
            return users.map(function (u) {
              return {
                id: u.id,
                parentId: u.parentId,
                displayName: u.displayName,
                jobTitle: u.jobTitle,
                department: u.department,
                mail: u.mail,
                officeLocation: u.officeLocation,
                photo: u.photo
              };
            });
          });
        });
      }

      dataPromise.then(function (data) {
        loadingEl.classList.add('hidden');
        ChartRenderer.render(data);
        SearchController.init(searchInput, searchResults, data, function (userId) {
          if (userId) {
            ChartRenderer.highlightAndCenter(userId);
          } else {
            ChartRenderer.clearHighlight();
          }
        });
      }).catch(function (err) {
        console.error('Failed to load org chart data:', err);
        loadingEl.classList.add('hidden');
        errorMsgEl.textContent = err.message && err.message.indexOf('40') !== -1
          ? 'You may not have permission to access this data. Make sure you are signed into SharePoint.'
          : 'Something went wrong loading the directory. Please try again.';
        errorEl.classList.add('visible');
      });
    }
  };

  // =========================================================================
  // Start
  // =========================================================================

  document.addEventListener('DOMContentLoaded', function () {
    App.init();
  });

})();
