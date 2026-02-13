import { MSGraphClientV3 } from '@microsoft/sp-http';
import { DisplayMode } from '@microsoft/sp-core-library';

export interface IWhosWhoProps {
  graphClient: MSGraphClientV3;
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
