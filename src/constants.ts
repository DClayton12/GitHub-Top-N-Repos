export const DEFAULT_NUMBER_REPOS_TO_REPORT: number = 2;
export const BASE_URL = `https://api.github.com/`;

export const REPO_RESOURCE = `repos`;
export const PULLS_RESOURCE = `pulls`;
export const STARS_RESOURCE = `stargazers`;
export const FORKS_RESOURCE = `forks`;

export const PRS_QUERY_ALL = `?state=all`;
export const DEFAULT_REQUEST_SETTINGS = {
                                            method: 'GET',
                                            headers: {
                                                Accept: 'application/json',
                                                'Content-Type': 'application/json',
                                            }
                                        };