import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IOrgUser } from '../IWhosWhoProps';

export class PeopleService {
  private _spHttpClient: SPHttpClient;
  private _siteUrl: string;

  constructor(spHttpClient: SPHttpClient, siteUrl: string) {
    this._spHttpClient = spHttpClient;
    this._siteUrl = siteUrl;
  }

  /**
   * Fetches all users via SharePoint Search API (People result source).
   * Uses the logged-in user's existing permissions - no admin consent needed.
   */
  public async getAllUsersWithManagers(): Promise<IOrgUser[]> {
    const users: IOrgUser[] = [];
    const pageSize = 500;
    let startRow = 0;
    let totalRows = 0;

    // Step 1: Fetch all people using SharePoint Search
    do {
      const searchUrl =
        `${this._siteUrl}/_api/search/query` +
        `?querytext='*'` +
        `&sourceid='b09a7990-05ea-4af9-81ef-edfab16c4e31'` +  // People result source
        `&selectproperties='AccountName,PreferredName,JobTitle,Department,WorkEmail,OfficeNumber,WorkPhone,PictureURL,Path,UserProfile_GUID'` +
        `&rowlimit=${pageSize}` +
        `&startrow=${startRow}`;

      const response: SPHttpClientResponse = await this._spHttpClient.get(
        searchUrl,
        SPHttpClient.configurations.v1
      );

      if (!response.ok) {
        throw new Error(`Search API returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const relevantResults = data?.PrimaryQueryResult?.RelevantResults;

      if (!relevantResults) break;

      totalRows = relevantResults.TotalRows || 0;
      const rows = relevantResults.Table?.Rows || [];

      for (const row of rows) {
        const cells = this._rowToCells(row);
        const accountName = cells['AccountName'] || '';

        if (!accountName) continue;

        users.push({
          id: cells['UserProfile_GUID'] || accountName,
          displayName: cells['PreferredName'] || 'Unknown',
          jobTitle: cells['JobTitle'] || '',
          department: cells['Department'] || '',
          mail: cells['WorkEmail'] || '',
          officeLocation: cells['OfficeNumber'] || '',
          userPrincipalName: accountName,
          managerId: null,
          photo: cells['PictureURL'] || undefined
        });
      }

      startRow += pageSize;
    } while (startRow < totalRows);

    // Step 2: Fetch manager for each user via User Profile Service
    await this._fetchManagers(users);

    return users;
  }

  /**
   * Fetches the manager for each user using the PeopleManager REST API.
   * Manager info comes from the UserProfile 'Manager' property.
   */
  private async _fetchManagers(users: IOrgUser[]): Promise<void> {
    // Build a lookup map: accountName -> user
    const accountNameToUser = new Map<string, IOrgUser>();
    for (const user of users) {
      accountNameToUser.set(user.userPrincipalName.toLowerCase(), user);
    }

    for (const user of users) {
      try {
        const encodedAccount = encodeURIComponent(`i:0#.f|membership|${user.userPrincipalName}`);
        const profileUrl =
          `${this._siteUrl}/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)` +
          `?@v='${encodedAccount}'` +
          `&$select=UserProfileProperties`;

        const response: SPHttpClientResponse = await this._spHttpClient.get(
          profileUrl,
          SPHttpClient.configurations.v1
        );

        if (!response.ok) continue;

        const profileData = await response.json();
        const properties: any[] = profileData?.UserProfileProperties || [];

        const managerProp = properties.find(
          (p: any) => p.Key === 'Manager'
        );

        if (managerProp && managerProp.Value) {
          // Manager value is an account name - find the matching user
          const managerAccount = managerProp.Value.toLowerCase();
          const managerUser = accountNameToUser.get(managerAccount);
          if (managerUser) {
            user.managerId = managerUser.id;
          }
        }
      } catch {
        // No manager or error - leave managerId as null
      }
    }
  }

  /**
   * Converts a SharePoint Search row into a key-value map of cell values.
   */
  private _rowToCells(row: any): Record<string, string> {
    const cells: Record<string, string> = {};
    if (row.Cells) {
      for (const cell of row.Cells) {
        if (cell.Key && cell.Value) {
          cells[cell.Key] = cell.Value;
        }
      }
    }
    return cells;
  }
}
