import * as yargs from 'yargs';

import { ApplicationMode, RepoCalculator } from './utils/repo-aggregator';
import { castUserInputOrDefaultNumberRepos, parseUserMode } from './utils/index';


async function main(){
    const argv = yargs
        .option("mode", {
            desribe: "Method to identify top repos. (mode, prs, prs/forks)",
            demandOption: true,
            alias: "m"
        })
        .option("gitHubOrganization", {
            desribe: "GitHub Organization to query Top N repos.",
            demandOption: true,
            alias: "o"
        })
        .option("numberRepos", {
            desribe: "Number of repos to report. Default = 2 repos",
            demandOption: false,
            alias: "N"
        })
        .help()
        .argv;

    const numberRepos: number = castUserInputOrDefaultNumberRepos(argv.numberRepos);
    const mode: ApplicationMode = parseUserMode(argv.mode);

    const repoCalculator = new RepoCalculator(argv.gitHubOrganization as string, mode, numberRepos);
    const topReposToReport: Array<string> = await repoCalculator.getTopRepos();
    
    console.log("~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~");
    console.log(` IN ORGANIZATION ${argv.gitHubOrganization}, THE TOP ${numberRepos} ARE `);
    console.log(` \n ${JSON.stringify(topReposToReport, null, 4)} \n `);
    console.log("~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~#~");

    return;
}

main();