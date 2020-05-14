const {exec} = require('child_process');
const env = require("./env");
const fs = require("fs");
const md5 = require("md5");

// Initialize AWS SDK and SNS
const AWS = require('aws-sdk');
AWS.config.update({
    "accessKeyId": env.aws.ID,
    "secretAccessKey": env.aws.KEY,
    "region": env.aws.REGION
});

let sns = new AWS.SNS({
    apiVersion: "2010-03-31"
});

const executionID = Math.random().toFixed(5).split(".")[1];
function log(message) {
    console.log(`[${executionID}] ${message}`);
}

log("execution begins : " + Date().toString());

for (let url of env.search) {
    const urlRepresentation = md5(url);
    if (fs.existsSync(`./${urlRepresentation}.hash`)) {
        const currentHash = fs.readFileSync(`./${urlRepresentation}.hash`).toString();
        exec(`curl '${url}' --output - | md5`, (_err, stdout, _stderr) => {
            if (stdout.trim() !== currentHash) {
                log(`DIFFERENCE FOUND IN ${url}!`);
                writeHash(url);
                sendMessage(url);
            } else {
                log(`No differences found in ${url}, continuing.`);
            }
        });
    } else {
        log(`Writing initial hash for ${url}.`);
        writeHash(url);
    }
}

function sendMessage(url) {
    // Set up and publish text message
    var params = {
        Message: `This website has changed! : ${url}`,
        PhoneNumber: env.aws.PHONE,
    };

    let p = sns.publish(params).promise();
    p.then(() => {
        log(`Text sent for ${url}!`);
    });
}

function writeHash(url) {
    exec(`curl '${url}' --output - | md5`, (_err, stdout, _stderr) => {
        fs.writeFileSync(`./${md5(url)}.hash`, stdout.trim());
    });
}
