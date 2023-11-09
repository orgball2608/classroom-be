
# SET UP MAIN SERVICE

## Getting started

```bash

# 1. Clone the repository or click on "Use this template" button.

git  clone  https://quang2602@bitbucket.org/thiet-ke-nhanh/main-service.git

  

# 2. Enter your newly-cloned folder.

cd  main-service

  

# 3. Create Environment variables file.

cp  .env.example  .env

  

#4 Run prisma migrate reset

yarn  prisma  migrate  reset

  

# 3. Install dependencies. (Make sure yarn is installed: https://yarnpkg.com/lang/en/docs/install)

yarn

```

### Development

# 4. Run development server and open http://localhost:3001

```

yarn run start:dev

```
or
```

docker-compose up -d

```

# GIT RULES

## Git Flow Workflow

The Git Flow workflow consists of the following main branches and their purposes:

- `master`: Represents the stable production-ready code. Only merge releases into this branch.

- `develop`: Serves as the integration branch for ongoing development. Feature branches are merged into this branch.

- `feature`: Used to develop new features. Each feature should have its own branch branched off from `develop`.

- `release`: Created for preparing a new release. Bug fixes and last-minute changes can be made in this branch.

- `hotfix`: Created to quickly address critical issues in the production code. Branched off from `master`.

## Branches in Git Flow

In Git Flow, branches have specific naming conventions to indicate their purpose:

- Feature branch: `feature/<branch-name>`

- Release branch: `release/<version-number>`

- Hotfix branch: `hotfix/<branch-name>`

## Using Rebase in Git Flow

To incorporate rebase into the Git Flow workflow, follow these steps:

1. Start a new feature: Create a new feature branch from `develop`.

2. Work on the feature: Make commits to the feature branch as you develop the new feature.

3. Update the feature branch: Before completing the feature, rebase it onto the latest `develop` branch to incorporate the latest changes.

4. Resolve conflicts: If conflicts occur during the rebase process, resolve them by editing the conflicting files manually.

5. Complete the feature: Once the feature is complete and conflicts are resolved, merge the feature branch into `develop`.

6. Repeat the process: Continue working on new features or start a release/hotfix branch following the same principles.