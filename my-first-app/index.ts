import * as pulumi from '@pulumi/pulumi';
import * as docker from '@pulumi/docker';

// get configuration
const config = new pulumi.Config();
const frontendPort = config.requireNumber('frontend_port');
const backendPort = config.requireNumber('backend_port');
const mongoPort = config.requireNumber('mongo_port');
const mongoHost = config.require('mongo_host'); // Note that strings are the default, so it's not `config.requireString`, just `config.require`.
const database = config.require('database');
const nodeEnvironment = config.require('node_environment');

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

// create a network!
const network = new docker.Network('network', {
    name: `services-${stack}`,
});

// create the mongo container!
const mongoContainer = new docker.Container('mongoContainer', {
    image: mongoImage.repoDigest,
    name: `mongo-${stack}`,
    ports: [
        {
            internal: mongoPort,
            external: mongoPort,
        },
    ],
    networksAdvanced: [
        {
            name: network.name,
            aliases: ['mongo'],
        },
    ],
});

// create the backend container!
const backendContainer = new docker.Container('backendContainer', {
    name: `backend-${stack}`,
    image: backend.baseImageName,
    ports: [
        {
            internal: backendPort,
            external: backendPort,
        },
    ],
    envs: [
        `DATABASE_HOST=${mongoHost}`,
        `DATABASE_NAME=${database}`,
        `NODE_ENV=${nodeEnvironment}`,
    ],
    networksAdvanced: [
        {
            name: network.name,
        },
    ],
}, { dependsOn: [mongoContainer] });

const dataSeedContainer = new docker.Container('dataSeedContainer', {
    image: mongoImage.repoDigest,
    name: 'dataSeed',
    mustRun: false,
    rm: true,
    mounts: [
        {
            target: '/home/products.json',
            type: 'bind',
            source: `${process.cwd()}/products.json`,
        },
    ],
    command: [
        'sh',
        '-c',
        'mongoimport --host mongo --db cart --collection products --type json --file /home/products.json --jsonArray',
    ],
    networksAdvanced: [
        {
            name: network.name,
        },
    ],
});

// create the frontend container!
const frontendContainer = new docker.Container('frontendContainer', {
    image: frontend.baseImageName,
    name: `frontend-${stack}`,
    ports: [
        {
            internal: frontendPort,
            external: frontendPort,
        },
    ],
    envs: [
        `LISTEN_PORT=${frontendPort}`,
        `HTTP_PROXY=backend-${stack}:${backendPort}`,
    ],
    networksAdvanced: [
        {
            name: network.name,
        },
    ],
});