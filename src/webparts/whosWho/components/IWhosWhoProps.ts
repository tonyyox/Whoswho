import { SPHttpClient } from '@microsoft/sp-http';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IWhosWhoProps {
  spHttpClient: SPHttpClient;
  siteUrl: string;
  title: string;
  displayMode: DisplayMode;
  onTitleUpdate: (value: string) => void;
}

export interface IOrgUser {
  id: string;
  displayName: string;
  jobTitle: string;
  department: string;
  mail: string;
  officeLocation: string;
  userPrincipalName: string;
  managerId: string | null;
  photo?: string;
}

export interface IOrgChartNode {
  id: string;
  parentId: string | null;
  displayName: string;
  jobTitle: string;
  department: string;
  mail: string;
  officeLocation: string;
  photo?: string;
}
