import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { IWhosWhoProps, IOrgUser, IOrgChartNode } from './IWhosWhoProps';
import { PeopleService } from './services/GraphService';
import { OrgChart } from './OrgChart';
import { SearchBox } from './SearchBox';
import { Spinner, SpinnerSize, MessageBar, MessageBarType } from '@fluentui/react';
import styles from './WhosWho.module.scss';

const WhosWho: React.FC<IWhosWhoProps> = (props) => {
  const [users, setUsers] = useState<IOrgChartNode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedUserId, setHighlightedUserId] = useState<string | null>(null);

  const peopleService = React.useMemo(
    () => new PeopleService(props.spHttpClient, props.siteUrl),
    [props.spHttpClient, props.siteUrl]
  );

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const orgUsers: IOrgUser[] = await peopleService.getAllUsersWithManagers();

      const chartNodes: IOrgChartNode[] = orgUsers.map((user) => ({
        id: user.id,
        parentId: user.managerId,
        displayName: user.displayName,
        jobTitle: user.jobTitle || '',
        department: user.department || '',
        mail: user.mail || '',
        officeLocation: user.officeLocation || '',
        photo: user.photo
      }));

      setUsers(chartNodes);
    } catch (err) {
      console.error('Error loading org chart data:', err);
      setError('Failed to load organizational data. Please check permissions and try again.');
    } finally {
      setLoading(false);
    }
  }, [peopleService]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = useCallback((userId: string | null) => {
    setHighlightedUserId(userId);
  }, []);

  if (loading) {
    return (
      <div className={styles.whosWho}>
        <div className={styles.loadingContainer}>
          <Spinner size={SpinnerSize.large} label="Loading organizational data..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.whosWho}>
        <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
          {error}
        </MessageBar>
      </div>
    );
  }

  return (
    <div className={styles.whosWho}>
      <div className={styles.header}>
        <h2 className={styles.title}>{props.title}</h2>
        <SearchBox users={users} onUserSelected={handleSearch} />
      </div>
      <div className={styles.chartContainer}>
        <OrgChart data={users} highlightedUserId={highlightedUserId} />
      </div>
    </div>
  );
};

export default WhosWho;
