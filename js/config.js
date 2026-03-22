var WhosWho = window.WhosWho || (window.WhosWho = {});

WhosWho.CONFIG = {
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
