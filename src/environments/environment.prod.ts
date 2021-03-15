export const environment = {
  production: true,
  //baseApiUrl: 'http://localhost:44301',  // For connecting to server running elsewhere update the base API URL
  //serverUrl: 'https://localhost:44301',
  //baseApiUrl: 'http://pragmaticsoft-001-site1.dtempurl.com',  // For qa
  //serverUrl: 'http://pragmaticsoft-001-site1.dtempurl.com',
  baseApiUrl: 'http://leansyshost-001-site3.itempurl.com',
  serverUrl: 'http://leansyshost-001-site3.itempurl.com',
  oauth: {
    enabled: false,  // For connecting to Mifos X using OAuth2 Authentication change the value to true
    serverUrl: ''
  }
};
