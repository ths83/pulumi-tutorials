import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';

const test = docker.config.host;
console.log(test);

const stack = pulumi.getStack();

const backendImageName = 'backend';
const backend = new docker.Image('backend', {
    build: {
        context: `${process.cwd()}/app/backend`,
    },
    imageName: `${backendImageName}:${stack}`,
    skipPush: true,
});

// build our frontend image!
const frontendImageName = 'frontend';
const frontend = new docker.Image('frontend', {
    build: {
        context: `${process.cwd()}/app/frontend`,
    },
    imageName: `${frontendImageName}:${stack}`,
    skipPush: true,
});

// build our mongodb image!
const mongoImage = new docker.RemoteImage('mongo', {
    name: 'mongo:bionic',
});

