import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  SearchBox as FluentSearchBox,
  ISearchBoxStyles
} from '@fluentui/react';
import { IOrgChartNode } from './IWhosWhoProps';
import styles from './WhosWho.module.scss';

export interface ISearchBoxProps {
  users: IOrgChartNode[];
  onUserSelected: (userId: string | null) => void;
}

interface ISearchResult {
  user: IOrgChartNode;
  matchText: string;
}

const searchBoxStyles: ISearchBoxStyles = {
  root: {
    width: 300,
    borderRadius: 4
  }
};

export const SearchBox: React.FC<ISearchBoxProps> = ({ users, onUserSelected }) => {
  const [searchText, setSearchText] = useState<string>('');
  const [showResults, setShowResults] = useState<boolean>(false);

  const searchResults: ISearchResult[] = useMemo(() => {
    if (!searchText || searchText.length < 2) return [];

    const query = searchText.toLowerCase();
    return users
      .filter((user) => {
        return (
          user.displayName.toLowerCase().includes(query) ||
          user.jobTitle.toLowerCase().includes(query) ||
          user.department.toLowerCase().includes(query) ||
          user.mail.toLowerCase().includes(query)
        );
      })
      .slice(0, 10)
      .map((user) => ({
        user,
        matchText: `${user.displayName} - ${user.jobTitle}`
      }));
  }, [searchText, users]);

  const handleSearchChange = useCallback((_: any, newValue?: string) => {
    setSearchText(newValue || '');
    setShowResults(true);
    if (!newValue) {
      onUserSelected(null);
    }
  }, [onUserSelected]);

  const handleResultClick = useCallback((user: IOrgChartNode) => {
    setSearchText(user.displayName);
    setShowResults(false);
    onUserSelected(user.id);
  }, [onUserSelected]);

  const handleClear = useCallback(() => {
    setSearchText('');
    setShowResults(false);
    onUserSelected(null);
  }, [onUserSelected]);

  return (
    <div className={styles.searchContainer}>
      <FluentSearchBox
        placeholder="Search by name, title, or department..."
        value={searchText}
        onChange={handleSearchChange}
        onClear={handleClear}
        styles={searchBoxStyles}
      />
      {showResults && searchResults.length > 0 && (
        <div className={styles.searchResults}>
          {searchResults.map((result) => (
            <button
              key={result.user.id}
              className={styles.searchResultItem}
              onClick={() => handleResultClick(result.user)}
              type="button"
            >
              <div className={styles.searchResultName}>
                {result.user.displayName}
              </div>
              <div className={styles.searchResultDetail}>
                {result.user.jobTitle}
                {result.user.department ? ` • ${result.user.department}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
