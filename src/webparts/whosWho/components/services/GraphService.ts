import { MSGraphClientV3 } from '@microsoft/sp-http';
import { IOrgUser } from '../IWhosWhoProps';

export class GraphService {
  private _graphClient: MSGraphClientV3;

  constructor(graphClient: MSGraphClientV3) {
    this._graphClient = graphClient;
  }

  /**
   * Fetches all users from Microsoft Graph with pagination support.
   * Retrieves user profiles and their manager relationships to build the org tree.
   */
  public async getAllUsersWithManagers(): Promise<IOrgUser[]> {
    const users: IOrgUser[] = [];
    const batchSize = 999;

    // Step 1: Fetch all users with basic profile info
    let nextLink: string | null = null;
    let endpoint = `/users?$select=id,displayName,jobTitle,department,mail,officeLocation,userPrincipalName&$top=${batchSize}&$filter=accountEnabled eq true`;

    do {
      const response: any = nextLink
        ? await this._graphClient.api(nextLink).get()
        : await this._graphClient.api(endpoint).get();

      if (response.value) {
        for (const user of response.value) {
          users.push({
            id: user.id,
            displayName: user.displayName || 'Unknown',
            jobTitle: user.jobTitle || '',
            department: user.department || '',
            mail: user.mail || '',
            officeLocation: user.officeLocation || '',
            userPrincipalName: user.userPrincipalName || '',
            managerId: null,
            photo: undefined
          });
        }
      }

      nextLink = response['@odata.nextLink'] || null;
    } while (nextLink);

    // Step 2: Fetch manager for each user using batch requests
    await this._fetchManagersBatched(users);

    // Step 3: Fetch photos for users (best-effort)
    await this._fetchPhotosBatched(users);

    return users;
  }

  /**
   * Fetches manager info for users using Graph batch API ($batch endpoint).
   * Processes in batches of 20 (Graph batch limit).
   */
  private async _fetchManagersBatched(users: IOrgUser[]): Promise<void> {
    const batchLimit = 20;

    for (let i = 0; i < users.length; i += batchLimit) {
      const batch = users.slice(i, i + batchLimit);
      const batchRequestBody = {
        requests: batch.map((user, index) => ({
          id: String(index),
          method: 'GET',
          url: `/users/${user.id}/manager?$select=id`
        }))
      };

      try {
        const batchResponse: any = await this._graphClient
          .api('/$batch')
          .post(batchRequestBody);

        if (batchResponse.responses) {
          for (const response of batchResponse.responses) {
            const idx = parseInt(response.id, 10);
            const user = batch[idx];
            if (user && response.status === 200 && response.body && response.body.id) {
              user.managerId = response.body.id;
            }
            // 404 = no manager (top-level person), which is expected
          }
        }
      } catch (err) {
        console.warn(`Batch manager fetch failed for batch starting at index ${i}:`, err);
        // Fall back to individual requests for this batch
        await this._fetchManagersIndividual(batch);
      }
    }
  }

  /**
   * Fallback: fetch managers one-by-one if batch request fails.
   */
  private async _fetchManagersIndividual(users: IOrgUser[]): Promise<void> {
    for (const user of users) {
      try {
        const manager: any = await this._graphClient
          .api(`/users/${user.id}/manager?$select=id`)
          .get();
        if (manager && manager.id) {
          user.managerId = manager.id;
        }
      } catch {
        // No manager or error - leave managerId as null
      }
    }
  }

  /**
   * Fetches user photos in batches. Photos are fetched as base64 data URLs.
   * Failures are silently ignored (users without photos get initials).
   */
  private async _fetchPhotosBatched(users: IOrgUser[]): Promise<void> {
    const batchLimit = 20;

    for (let i = 0; i < users.length; i += batchLimit) {
      const batch = users.slice(i, i + batchLimit);
      const batchRequestBody = {
        requests: batch.map((user, index) => ({
          id: String(index),
          method: 'GET',
          url: `/users/${user.id}/photo/$value`,
          headers: {
            'Content-Type': 'image/jpeg'
          }
        }))
      };

      try {
        const batchResponse: any = await this._graphClient
          .api('/$batch')
          .post(batchRequestBody);

        if (batchResponse.responses) {
          for (const response of batchResponse.responses) {
            const idx = parseInt(response.id, 10);
            const user = batch[idx];
            if (user && response.status === 200 && response.body) {
              user.photo = `data:image/jpeg;base64,${response.body}`;
            }
          }
        }
      } catch {
        // Photos are non-critical, silently skip on failure
      }
    }
  }
}
