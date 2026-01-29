# GitHub Actions Deployment Guide

## Overview

This repository uses a reusable workflow pattern for deploying the Rootstock Collective Rewards Subgraph to different environments. All deployment logic is centralized in a single template workflow, and each environment has its own workflow file that calls the template with environment-specific configuration.

## Architecture

### Structure

```
.github/
├── workflows/
│   ├── deploy-template.yml                   # Reusable workflow template
│   ├── testnet.deploy.yml                    # Testnet environment workflow
│   ├── dao-qa.deploy.yml                     # DAO QA environment workflow
│   ├── cr-qa.deploy.yml                      # CR QA environment workflow
│   ├── release-candidate-testnet.deploy.yml  # RC Testnet workflow
│   ├── release-candidate-mainnet.deploy.yml  # RC Mainnet workflow
│   └── mainnet.deploy.yml                    # Mainnet (production) workflow
└── DEPLOYMENT.md                             # This file - deployment documentation
```

### How It Works

1. **Template Workflow** (`deploy-template.yml`): Contains all the deployment logic (build, codegen, deploy steps)
2. **Environment Workflows**: Each environment has a small workflow file that:
   - Defines environment-specific triggers
   - Calls the reusable template with environment-specific inputs (hardcoded values)
   - Inherits secrets from the repository
3. **Configuration Files**: Environment-specific JSON files in the root directory (e.g., `dev.json`, `mainnet.json`)

## Environment Configurations

| Environment | Name | Subgraph ID | Network | Graph URL |
|------------|------|-------------|---------|-----------|
| **testnet** | RootstockCollective Testnet | `rootstockcollective-collective-rewards-dev` | rootstock-testnet | https://api.studio.thegraph.com/deploy/ |
| **dao-qa** | RootstockCollective DAO QA | `rootstockcollective-collective-rewards-dao-qa` | rootstock-testnet | https://api.studio.thegraph.com/deploy/ |
| **cr-qa** | RootstockCollective CR QA | `rootstockcollective-collective-rewards-cr-qa` | rootstock-testnet | https://api.studio.thegraph.com/deploy/ |
| **release-candidate-testnet** | RootstockCollective Release Candidate Testnet | `rootstockcollective-collective-rewards-release-candidate-testnet` | rootstock-testnet | https://api.studio.thegraph.com/deploy/ |
| **release-candidate-mainnet** | RootstockCollective Release Candidate Mainnet | `rootstockcollective-collective-rewards-release-candidate-mainnet` | rootstock | https://api.studio.thegraph.com/deploy/ |
| **mainnet** | RootstockCollective Mainnet | `rootstockcollective-collective-rewards` | rootstock | https://api.studio.thegraph.com/deploy/ |

**Note:** The prepare script is automatically constructed as `prepare:<environment>` (e.g., `prepare:dev`, `prepare:mainnet`).

## Deployment Triggers

### Testnet Environment
- **Trigger**: Push to `main` branch (merge into main), Manual via `workflow_dispatch`
- **Workflow**: `testnet.deploy.yml`
- **Permissions**: `read-all` (read-only by default)

### DAO QA Environment
- **Trigger**: Manual only (`workflow_dispatch`)
- **Workflow**: `dao-qa.deploy.yml`
- **Permissions**: `read-all` (read-only by default)

### CR QA Environment
- **Trigger**: Manual only (`workflow_dispatch`)
- **Workflow**: `cr-qa.deploy.yml`
- **Permissions**: `read-all` (read-only by default)

### Release Candidate Environments
- **Trigger**: Push tags matching pattern `v[0-9]+.[0-9]+.[0-9]+-rc.[0-9]+` (e.g., `v1.2.3-rc.1`), Manual via `workflow_dispatch`
- **Workflows**: 
  - `release-candidate-testnet.deploy.yml`
  - `release-candidate-mainnet.deploy.yml`
- **Permissions**: `read-all` (read-only by default)

### Mainnet (Production)
- **Trigger**: 
  - GitHub Release `released` event
  - Manual via `workflow_dispatch`
- **Workflow**: `mainnet.deploy.yml`
- **Permissions**: `read-all` (read-only by default)

## Required Secrets

Each environment requires the following secrets configured in GitHub:

### Repository Secrets
- `GRAPH_DEPLOY_KEY`: The Graph Studio authentication key (used for `graph auth`)

### Environment Secrets
Secrets can also be configured per environment in GitHub Settings → Environments. Each environment workflow uses the corresponding GitHub environment for secrets.

**How to obtain Graph Studio credentials:**
1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Sign in with your GitHub account
3. Navigate to your profile settings
4. Generate a deploy key (this is what you use for `graph auth`)
5. Copy the key value

**How to configure in GitHub:**
1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add repository secret or environment-specific secret
4. Name: `GRAPH_DEPLOY_KEY`
5. Value: Paste your Graph Studio deploy key

**Note:** The `graph auth` command uses the deploy key to authenticate, and then `graph deploy` uses that authentication automatically. No additional access token is needed.

## Deployment Process

Each deployment follows the same process:

1. **Checkout code** - Gets the latest code from the repository
2. **Setup Node.js** - Installs Node.js 22 with npm caching
3. **Install dependencies** - Runs `npm ci` to install all dependencies
4. **Authenticate** - Authenticates with The Graph Studio using `GRAPH_DEPLOY_KEY`
5. **Prepare environment** - Runs the environment-specific prepare script (e.g., `prepare:dev`)
6. **Generate code** - Runs `codegen` to generate TypeScript types
7. **Build subgraph** - Compiles the subgraph
8. **Deploy** - Deploys to The Graph Studio with a version label
9. **Verify** - Confirms successful deployment

### Version Format

Deployments use the following version format depending on the trigger:

- **Release events**: Uses the release tag (e.g., `v1.0.0`)
- **Tag pushes**: Uses the tag name (e.g., `v1.0.0-rc.1`)
- **Other triggers**: Uses `{package.json version}-{commit-sha}` (e.g., `1.0.0-a1b2c3d`)

## Manual Deployment

All workflows support manual triggering via `workflow_dispatch`:

1. Go to the Actions tab in your GitHub repository
2. Select the workflow you want to run
3. Click "Run workflow"
4. Fill in any optional inputs
5. Click "Run workflow" to start

## Adding a New Environment

To add a new environment:

1. **Create configuration file** in the root directory (e.g., `new-env.json`):
   ```json
   {
       "network": "rootstock-testnet",
       "backersManager": {
           "address": "0x...",
           "startBlock": 1234567,
           "upgradeV2": 1234568,
           "upgradeV3": 1234569
       },
       "builderRegistry": {
           "address": "0x...",
           "startBlock": 1234567,
           "upgradeV3": 1234569
       },
       "rewardDistributor": {
           "address": "0x...",
           "startBlock": 1234567
       }
   }
   ```

2. **Add prepare script** to `package.json`:
   ```json
   "prepare:new-env": "mustache new-env.json subgraph.template.yaml > subgraph.yaml"
   ```

3. **Create workflow file** `.github/workflows/new-env.deploy.yml`:
   ```yaml
   name: Deploy Subgraph to New Env
   
   on:
     workflow_dispatch:
   
   # Declare default permissions as read only.
   permissions: read-all
   
   jobs:
     deploy:
       uses: ./.github/workflows/deploy-template.yml
       with:
         environment: new-env
         subgraphId: rootstockcollective-collective-rewards-new-env
         networkName: rootstock-testnet
         graphUrl: https://api.studio.thegraph.com/deploy/
         environmentName: new-env
       secrets: inherit
   ```

4. **Update this documentation** (add to the Environment Configurations table above)

## Troubleshooting

### Common Issues

1. **Authentication Error**
   - Ensure `GRAPH_DEPLOY_KEY` is correctly set
   - Verify the deploy key has the necessary permissions
   - Check that environment secrets are configured if using environment-specific secrets
   - Verify the deploy key is valid and not expired

2. **Build Failures**
   - Check that all dependencies are properly installed
   - Verify the GraphQL schema is valid
   - Ensure all required files are present
   - Check that the prepare script ran successfully

3. **Deployment Failures**
   - Verify the subgraph configuration is correct
   - Check that the target network is accessible
   - Ensure the subgraph name is unique
   - Verify the subgraph ID matches the environment

4. **Workflow Not Triggering**
   - Check branch/tag names match the trigger conditions
   - Verify the workflow file is in `.github/workflows/`
   - Check GitHub Actions permissions in repository settings

### Logs and Debugging

- Check the Actions tab in GitHub for detailed logs
- Each step in the workflow provides detailed output
- Failed deployments will show specific error messages
- The reusable template workflow shows which environment is being deployed

## Security Notes

- Never commit access tokens or sensitive configuration to the repository
- Use GitHub Secrets for all sensitive data
- Use environment-specific secrets when possible for better security isolation
- Regularly rotate access tokens
- Monitor deployment logs for any suspicious activity
- Review who has access to trigger production deployments

