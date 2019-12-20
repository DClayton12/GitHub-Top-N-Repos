import { fetch } from 'cross-fetch';
import { BASE_URL, REPO_RESOURCE, DEFAULT_REQUEST_SETTINGS, PULLS_RESOURCE, PRS_QUERY_ALL } from '../constants';

export interface parsedLinkHeader {
    next?: string;
    prev?: string;
    last?: string;
    first?: string;
}

export interface repoInfo {
    stars: number;
    stargazers_url: string;
    forks: number;
    forks_url: string;
    prs: number;
    pullsUrl: string;
    full_name: string;
}

interface headerInfo {
    Accept: string;
    'Content-Type': string;
}

export interface RequestInit {
    method: string;
    headers: headerInfo;
}

export interface ResponseInfo {
    data: Array<any>;
    headers: any;

}

export type repoInfoContainer = Map<string, repoInfo>

export class GitService{
    private _baseOrgUrl: string;
    private _baseRepoUrl: string;
    public gitOrg: string;

    constructor(gitOrg: string){
        this.gitOrg = gitOrg;
        this._baseOrgUrl = `${BASE_URL}orgs/${this.gitOrg}/`;
        this._baseRepoUrl = `${this._baseOrgUrl}${REPO_RESOURCE}`;
    }

    public static createGitService(gitOrg: string): GitService {
        return new GitService(
            gitOrg
        );
    }
    
    public async getReposAndCountStars(){
        const allRepos: any = await this.getRepos();

        const repoNameKeys = Object.keys(allRepos);
        for(const repoNameKey of repoNameKeys){
            if(allRepos[repoNameKey].stars < 0){
                const currentRepoStarUrl: string = allRepos[repoNameKey].stargazersUrl;
                const { data } = await getGitInfo(currentRepoStarUrl, DEFAULT_REQUEST_SETTINGS);
                allRepos[repoNameKey].stars = data.length; 
            }
        }
        
        return allRepos;
    }

    public async getReposAndCountForks(){
        const allRepos: any = await this.getRepos();

        const repoNameKeys = Object.keys(allRepos);
        for(const repoNameKey of repoNameKeys){
            if(allRepos[repoNameKey].forks < 0){
                const currentRepoForkUrl: string = allRepos[repoNameKey].forkUrl;
                const { data } = await getGitInfo(currentRepoForkUrl, DEFAULT_REQUEST_SETTINGS);
                allRepos[repoNameKey].forks = data.length; 
            }
        }

        return allRepos;
    }

    public async getReposAndCountPrs(allRepos: any = null){
        if(!allRepos){
            allRepos = await this.getRepos();
        }
        
        const repoNameKeys = Object.keys(allRepos);
        for(const repoNameKey of repoNameKeys){
            if(allRepos[repoNameKey].prs < 0){
                const currentRepopullsUrl: string = allRepos[repoNameKey].pullsUrl;
                const { data } = await getGitInfo(currentRepopullsUrl, DEFAULT_REQUEST_SETTINGS);
                allRepos[repoNameKey].prs = data.length; 
            }
        }
        
        return allRepos;        
    }

    public async getRepos(){
        const url = this._baseRepoUrl;
        const allRepos = {};
       let gitResponse = await getGitInfo(url, DEFAULT_REQUEST_SETTINGS);

       let { data, headers } = gitResponse;
       this.processRepoData(data, allRepos);
       let nextLink = this._getNextLink(headers);

       while(nextLink){
           let nextData = null;
           let nextHeaders = null;
           let nextResponse = await getGitInfo(nextLink, DEFAULT_REQUEST_SETTINGS);
           nextData =  nextResponse.data;
           nextHeaders =  nextResponse.headers;

           nextLink = this._getNextLink(nextHeaders);
           this.processRepoData(nextData, allRepos);
       }
        return allRepos;
    }

    private _getNextLink(headers: any){
        const headerLinkInfo = headers ? headers.get('link') : null;
        if(!headerLinkInfo){ return null}
        const links: parsedLinkHeader = this.parseLinkHeader(headerLinkInfo);
        return (links['next'] ? links['next'] : null);
    }

    public parseLinkHeader(headerLinkInfo: string): parsedLinkHeader {
        let parsedLinks = headerLinkInfo.split(',');
        let links: any = {};
        // Parse to a named link for O(1) lookup. 
        for(let i = 0; i < parsedLinks.length; i++) {
            let section = parsedLinks[i].split(';');
            if (section.length !== 2) {
                throw new Error(`Unexpected error on split for ${parsedLinks} using ';'. `);
            }
            let url: string = section[0].replace(/<(.*)>/, '$1').trim();
            let name: string = section[1].replace(/rel="(.*)"/, '$1').trim();
            links[name] = url;
        }
        return links;
    }

    private processRepoData(repoData: Array<any>, allRepos: any){
        if(repoData && repoData.length > 0){
            for(const repoDatum of repoData){
                const forkUrl: string | null = repoDatum['forks_url'] ? repoDatum['forks_url'] : null;
                const repoForkCount: number = (repoDatum['forks_count'] || repoDatum['forks_count'] !== 0) ? repoDatum['forks_count'] : -1;
    
                const stargazersUrl: string | null = repoDatum['stargazers_url'] ? repoDatum['stargazers_url'] : null;
                const stargazersCount: number = (repoDatum['stargazers_count'] || repoDatum['stargazers_url'] !== 0) ? repoDatum['stargazers_count'] : -1;
    
                
                const pullsUrl: string = this._generatePullUrl(repoDatum.full_name);
    
                allRepos[repoDatum.full_name] = {
                    stars: stargazersCount,
                    stargazersUrl,
                    forks: repoForkCount,
                    forkUrl,
                    pullsUrl,
                    prs: -1,
                };
            }
        }
        return;
    }

    private _generatePullUrl(repoFullName: string): string {
        const pullUrl: string = `${BASE_URL}${REPO_RESOURCE}/${repoFullName}/${PULLS_RESOURCE}${PRS_QUERY_ALL}`;
        return pullUrl;
    }
}

export async function getGitInfo(url: string, settings: any) {
    try {
        const response = await fetch(url, settings);
        const headers = response.headers;
        const data = await response.json();
        return { data, headers };
    } catch (e) {
        return e;
    }    
}