// Keycloak Configuration
export const keycloakConfig = {
  url: 'http://localhost:9090',
  realm: 'event-ticket-platform',
  clientId: 'event-ticket-platform-app',
  redirectUri: 'http://localhost:5173/callback',
};

// Keycloak endpoints
export const keycloakEndpoints = {
  authorization: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`,
  token: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
  logout: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`,
  userInfo: `${keycloakConfig.url}/realms/${keycloakConfig.realm}/protocol/openid-connect/userinfo`,
};

