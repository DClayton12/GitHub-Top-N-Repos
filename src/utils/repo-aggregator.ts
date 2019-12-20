import { GitService } from "../services/github-service";

export type ApplicationMode = 'stars' | 'forks' | 'prs' | 'prs/forks';

export class RepoCalculator {
    private _mode: ApplicationMode;
    private _gitHubOrg: string;
    private _numberRepos: number;
    private _gitService: GitService;

    constructor(gitHubOrg: string, mode: ApplicationMode, numberRepos: number){
        this._gitHubOrg = gitHubOrg;
        this._mode = mode;
        this._numberRepos = numberRepos;
        this._gitService = GitService.createGitService(this._gitHubOrg);// new GitService(this._gitHubOrg);// init new git service
    }

    public async getTopRepos(){
        let result;
        switch(this._mode){
            case 'stars':
                result = await this._calculateTopStars();
                break;
            case 'forks':
                result = await this._calculateTopForks();
                break;
            case 'prs':
                result = await this._calculateTopPrs();
                break;
            case 'prs/forks':
                result = await this._calculateTopPrsByForks();
                break;
        }
        return result;
    }

    public async _calculateTopStars(): Promise<Array<string>>{
        const reposWithStarCounts: any = await this._gitService.getReposAndCountStars();
        const reposSortedDescending: Array<string> = 
                Object.keys(reposWithStarCounts)
                    .sort((repoA, repoB) => {
                        return reposWithStarCounts[repoB].stars - reposWithStarCounts[repoA].stars;
                    });
        const topNRepos = reposSortedDescending.splice(0, this._numberRepos);        
        return topNRepos;
    }

    private async _calculateTopForks(): Promise<Array<string>>{
        const reposWithForkCounts: any = await this._gitService.getReposAndCountForks();
        const reposSortedDescending: Array<string> = 
                Object.keys(reposWithForkCounts)
                    .sort((repoA, repoB) => {
                        return reposWithForkCounts[repoB].forks - reposWithForkCounts[repoA].forks;
                    });
        const topNRepos = reposSortedDescending.splice(0, this._numberRepos);
        return topNRepos;
    }

    private async _calculateTopPrs(): Promise<Array<string>>{
        const reposWithPullCounts: any = await this._gitService.getReposAndCountPrs();
        
        const reposSortedDescending: Array<string> = 
        Object.keys(reposWithPullCounts)
            .sort((repoA, repoB) => {
                return reposWithPullCounts[repoB].forks - reposWithPullCounts[repoA].forks;
            });

        const topNRepos = reposSortedDescending.splice(0, this._numberRepos);
        return topNRepos;
    }

    private async _calculateTopPrsByForks(): Promise<Array<string>>{
        const reposWithForkCounts: any = await this._gitService.getReposAndCountForks();
        const reposWithPRAndForkCounts: any = await this._gitService.getReposAndCountPrs(reposWithForkCounts);

        // Add new member to each repo datum, prsByForks = repo.prs/repos.
        Object.keys(reposWithPRAndForkCounts).forEach(repoDatumKey => {
            const numberPrs = reposWithPRAndForkCounts[repoDatumKey].prs ? reposWithPRAndForkCounts[repoDatumKey].prs : 0; 
            const numberForks = reposWithPRAndForkCounts[repoDatumKey].forks ? reposWithPRAndForkCounts[repoDatumKey].forks : 0; 

            let ratio: number;
            if ((numberPrs <= 0 && numberForks <= 0) || (numberPrs <= 0 && numberForks > 0)){
                ratio = 0;
            } else if (numberPrs > 0 && numberForks <= 0){
                ratio = 100;
            } else{
                ratio = (numberPrs * 100) / numberForks
            }
            reposWithPRAndForkCounts[repoDatumKey].contributionPercent = ratio;
        }); 

        const reposSortedDescending: Array<string> = 
        Object.keys(reposWithPRAndForkCounts)
            .sort((repoA, repoB) => {
                return reposWithPRAndForkCounts[repoB].contributionPercent - reposWithPRAndForkCounts[repoA].contributionPercent;
            });

        const topNRepos = reposSortedDescending.splice(0, this._numberRepos);
        return topNRepos;
    }
}