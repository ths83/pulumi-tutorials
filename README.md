# pulumi-tutorials

Tutorials from https://www.pulumi.com/learn

## Prerequisites

- Pulumi account https://app.pulumi.com/
- Pulumi CLI https://www.pulumi.com/docs/reference/cli/
- Access token https://www.pulumi.com/docs/intro/pulumi-service/accounts/#access-tokens
- Docker
- Npm v14+

> NOTE: If using an OSX with the M1 chip, please refer to [Docker on OSX M1](#docker-on-osx-m1).

### Docker on OSX M1

Using https://github.com/abiosoft/colima, you must update the pulumi docker host before running any command.

```bash
# Start Colima
colima start

# List docker context
docker context ls

# Copy/paste docker endpoint from colima context and set pulumi docker host
pulumi config set docker:host "unix://${HOME}/.colima/docker.sock"
```

_See https://www.pulumi.com/registry/packages/docker/installation-configuration/#configuring-the-provider_