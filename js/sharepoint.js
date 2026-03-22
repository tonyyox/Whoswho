var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.SharePointService = {
  _siteUrl: null,

  getSiteUrl: function () {
    var CONFIG = WhosWho.CONFIG;
    if (CONFIG.siteUrl) return CONFIG.siteUrl;
    if (this._siteUrl) return this._siteUrl;
    if (window._spPageContextInfo && window._spPageContextInfo.webAbsoluteUrl) {
      this._siteUrl = window._spPageContextInfo.webAbsoluteUrl;
      return this._siteUrl;
    }
    var match = window.location.href.match(/(https:\/\/[^/]+\/sites\/[^/]+)/);
    if (match) {
      this._siteUrl = match[1];
      return this._siteUrl;
    }
    this._siteUrl = window.location.origin;
    return this._siteUrl;
  },

  fetchJson: function (url) {
    return fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json;odata=verbose', 'Content-Type': 'application/json;odata=verbose' },
      credentials: 'same-origin'
    }).then(function (response) {
      if (response.status === 429) {
        return new Promise(function (resolve) { setTimeout(resolve, 1000); }).then(function () {
          return fetch(url, {
            method: 'GET',
            headers: { 'Accept': 'application/json;odata=verbose', 'Content-Type': 'application/json;odata=verbose' },
            credentials: 'same-origin'
          });
        }).then(function (r) {
          if (!r.ok) throw new Error('API returned ' + r.status + ': ' + r.statusText);
          return r.json();
        });
      }
      if (!response.ok) throw new Error('API returned ' + response.status + ': ' + response.statusText);
      return response.json();
    });
  },

  getAllUsers: function (onProgress) {
    var self = this;
    var CONFIG = WhosWho.CONFIG;
    var siteUrl = this.getSiteUrl();
    var users = [];
    var startRow = 0;

    function fetchPage() {
      var searchUrl = siteUrl + '/_api/search/query' +
        "?querytext='*'" +
        "&sourceid='" + CONFIG.peopleSourceId + "'" +
        "&selectproperties='AccountName,PreferredName,JobTitle,Department,WorkEmail,OfficeNumber,WorkPhone,PictureURL,Path,UserProfile_GUID'" +
        '&rowlimit=' + CONFIG.pageSize + '&startrow=' + startRow;

      return self.fetchJson(searchUrl).then(function (data) {
        var results = data.d && data.d.query && data.d.query.PrimaryQueryResult && data.d.query.PrimaryQueryResult.RelevantResults;
        if (!results) return users;
        var totalRows = results.TotalRows || 0;
        var rows = (results.Table && results.Table.Rows && results.Table.Rows.results) || [];
        for (var i = 0; i < rows.length; i++) {
          var cells = {};
          var cellArray = (rows[i].Cells && rows[i].Cells.results) || [];
          for (var j = 0; j < cellArray.length; j++) {
            if (cellArray[j].Key && cellArray[j].Value) cells[cellArray[j].Key] = cellArray[j].Value;
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
        if (startRow < totalRows) return fetchPage();
        return users;
      });
    }
    return fetchPage();
  },

  fetchAllManagers: function (users, onProgress) {
    var self = this;
    var CONFIG = WhosWho.CONFIG;
    var siteUrl = this.getSiteUrl();
    var accountMap = {};
    for (var i = 0; i < users.length; i++) accountMap[users[i].userPrincipalName.toLowerCase()] = users[i];
    var completed = 0, total = users.length, index = 0;

    function processBatch() {
      var batch = users.slice(index, index + CONFIG.managerBatchSize);
      if (batch.length === 0) return Promise.resolve();
      index += batch.length;
      var promises = batch.map(function (user) {
        var encodedAccount = encodeURIComponent('i:0#.f|membership|' + user.userPrincipalName);
        var profileUrl = siteUrl + '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)' +
          "?@v='" + encodedAccount + "'&$select=UserProfileProperties";
        return self.fetchJson(profileUrl).then(function (profileData) {
          var properties = (profileData.d && profileData.d.UserProfileProperties && profileData.d.UserProfileProperties.results) || [];
          for (var p = 0; p < properties.length; p++) {
            if (properties[p].Key === 'Manager' && properties[p].Value) {
              var managerUser = accountMap[properties[p].Value.toLowerCase()];
              if (managerUser) user.parentId = managerUser.id;
              break;
            }
          }
        }).catch(function () {}).then(function () {
          completed++;
          if (onProgress) onProgress('Loading managers... (' + completed + '/' + total + ')');
        });
      });
      return Promise.all(promises).then(function () { if (index < users.length) return processBatch(); });
    }
    return processBatch();
  }
};
