# GitHub Top N Repos console program
by Darnel Clayton

## Getting Started
### System Requirements
* node >=8.9.1

### How to Intall
* `npm install`

### How to Compile
* `npm run compile`

### Run Tests
* `npm run ut`

### Parameters
* `-o` <Mandatory> GitHub Organization name.
* `-m` <Mandatory> Top Repos by Category <stars-forks-prs-prs/forks>.
* `-N` [Optional] Number top of report. If flag is not used, value `2` will be as defaut.

### How to Execute
* `node dist/src/index.js -o netflix -m stars`
* `node dist/src/index.js -o netflix -m prs -N 50`

### GitHub Top N Repos Solution

I chose to implement a couple classes to help me acheieve the task. The class `GitService` is a module which performs REST calls to GitHub's API asynchronously. 

While parsing the payload of getting an organization’s list of repos, this information is stored in a map where the key is the repo’s name and the value is an object of type `repoInfo`. Object `repoInfo` contains resource endpoints and numeric values(-1 if not available). The data-structure called `repoInfo` which contains repo values (star, fork, pr counts) and endpoints (star, fork, pr endpoints).

The other class is `RepoCalculator` and is composed of a private member `GitService` instance. Class `RepoCalculator `, which using processed repo information, sorts repos by run-time mode (stars, forks, prs, prs/forks) in decsending order. Next ` RepoCalculator` will reduce the result to only the specified number of Top Repos and return the top repos for reporting in the main function.


#### Improvements to Solution

There are a large number of asynchronous REST call to GitHub's API which are made per organization and per resource. It is likely the any user would like to query the same organization's repos by a different mode. Example, first - report top repos by forks, next - report top repos by prs/forks. Currently, the same amount of external calls will be performed the second report is triggered. 

To perform subsequent reports triggered for an organization's repos, this information may be cached. The next time a an organization is queried, all of its repo information may be instantly referred to. If necessary, it's data may be enriched with another repo aggregate value. Further, the cache may have documents stored as an JSON-like data structure where the key will be organization-ID, which will contain two members, a previous result(per mode) and a map of repo-ID which will contain a structure `repoInfo`. 

The cache will have a Least Recently Used eviction policy and have an appropriate Time To Live time threshold.

Example of document stored in cache.
```
{
    Org-ID : {
                previousResults: {
                    topStarRepoResult: [ repo1, repo2 ],
                    topPrs/ForksRepoResult: [ repo1, repo2 ]
                }
                repo-ID: {
                    stars: 120
                    forks: 140
                    prs: 200
                    ...
                }
            }
}

```