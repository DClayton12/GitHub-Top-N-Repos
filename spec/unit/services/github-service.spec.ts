import { use, expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { GitService, parsedLinkHeader } from '../../../src/services/github-service';
import { EXAMPLE_GITHUB_HEADER, TEST_GITHUB_ORG } from '../constants.spec';


use(sinonChai);

describe('Git - Service', async () => {
    const mySandbox = sinon.sandbox.create();
    
    let gitService: GitService;
    const testGitOrg = TEST_GITHUB_ORG;
    const exampleGitHubHeader = EXAMPLE_GITHUB_HEADER;
    
    before(async () => {
        gitService = GitService.createGitService(testGitOrg);
    });

    afterEach(() => {
        mySandbox.reset();
    });

    it('should have public functions accessible', () => {
        expect(gitService.getRepos).to.be.ok;
        expect(gitService.getReposAndCountStars).to.be.ok;
        expect(gitService.getReposAndCountForks).to.be.ok;
        expect(gitService.getReposAndCountPrs).to.be.ok;
    });

    it('should set gitHubOrg correctly', async () => {
        expect(gitService.gitOrg).to.be.ok;
        expect(gitService.gitOrg).to.eql('ExampleGitHubOrg');
    });

    it('should parse gitHubHeader and extract "next" link correctly', async () => {
        const parsedResult: parsedLinkHeader = gitService.parseLinkHeader(exampleGitHubHeader);
        
        expect(parsedResult).to.have.property('prev');
        expect(parsedResult['prev']).to.be.ok;
        expect(parsedResult['prev']).to.be.eql(`https://api.github.com/organizations/49071/repos?page=2`);

        expect(parsedResult).to.have.property('first');
        expect(parsedResult['first']).to.be.ok;
        expect(parsedResult['first']).to.be.eql(`https://api.github.com/organizations/49071/repos?page=1`);

        expect(parsedResult).to.have.property('last');
        expect(parsedResult['last']).to.be.ok;
        expect(parsedResult['last']).to.be.eql(`https://api.github.com/organizations/49071/repos?page=8`);

        expect(parsedResult).to.have.property('next');
        expect(parsedResult['next']).to.be.ok;
        expect(parsedResult['next']).to.be.eql(`https://api.github.com/organizations/49071/repos?page=4`);
    });
});