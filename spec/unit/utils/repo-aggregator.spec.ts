import { use, expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { RepoCalculator } from '../../../src/utils/repo-aggregator';
import { TEST_GITHUB_ORG, EXAMPLE_REPO_PAYLOAD } from '../constants.spec';

use(sinonChai);

describe('LogFileReporter', async () => {
    const mySandbox = sinon.sandbox.create();

    const testGitOrg = TEST_GITHUB_ORG;
    const exampleRepoPaylod = EXAMPLE_REPO_PAYLOAD;
    const numberTopRepos = 4; // 4 is the # of repos to report, Report no more than 4.
    const testMode = 'stars';
    
    let testAggregator: RepoCalculator;
    
    before(async () => {
        testAggregator = new RepoCalculator(testGitOrg, testMode, numberTopRepos)
    });

    afterEach(() => {        
        mySandbox.reset();
    });

    it('should have public functions accessible', () => {
        expect(testAggregator.getTopRepos).to.be.ok;
    });

    it('should ID top starred repos', async () => {

        const _calculateTopStars = ((repoInfoAndCounts: any): Array<string> => {
            const reposSortedDescending: Array<string> = 
            Object.keys(repoInfoAndCounts)
                .sort((repoA, repoB): number  => {
                    return repoInfoAndCounts[repoB].stars - repoInfoAndCounts[repoA].stars;
                });

            const topNRepos: Array<string> = reposSortedDescending.splice(0, numberTopRepos);        
            return topNRepos;
        });

        const result: Array<string> = _calculateTopStars(exampleRepoPaylod);           

        // Should include; Top 4 repos for stars
        expect(result).to.deep.include("netflix/mongoose-authz");
        expect(result).to.deep.include("netflix/mongoose-select-virtuals");
        expect(result).to.deep.include("netflix/styleguide");
        expect(result).to.deep.include("netflix/mosql");

        // Should NOT include; Least starred repo
        expect(result).to.not.deep.include("netflix/mongoose-populate-options");

        // Check order of top repos. DESC order

        expect(result).to.eql([ 'netflix/styleguide', // most stars
            'netflix/mongoose-select-virtuals', //2nd
            'netflix/mongoose-authz', // 3rd
            'netflix/mosql' ] // least stars (In Top 4 repos)
        ); 

    });
});