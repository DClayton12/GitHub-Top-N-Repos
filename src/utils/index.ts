import { DEFAULT_NUMBER_REPOS_TO_REPORT } from "../constants";
import { ApplicationMode } from "./repo-aggregator";

export function castUserInputOrDefaultNumberRepos(userInput: any): number{
    return (userInput && Number(userInput)) ? Number(userInput) : DEFAULT_NUMBER_REPOS_TO_REPORT;
}

export function parseUserMode(mode: any): ApplicationMode {
    let userMode: ApplicationMode;
    switch(mode){
        case 'stars':
        case 'forks':
        case 'prs':
        case 'prs/forks':
            userMode = mode;
            break;
        default:
            throw `Parameter mode (-m) must be specified as 'stars' | 'forks' | 'prs' | 'prs/forks'`;
    }
    return userMode;
}