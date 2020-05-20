const request = require("request");
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
    if (fs.existsSync(`./.${urlRepresentation}.site`)) {
        const oldSite = fs.readFileSync(`./.${urlRepresentation}.site`).toString();
        request(url, async (error, _res, newSite) => {
            if (error) {
                console.log(error);
                log(`Error pulling new data for ${url}, skipping.`);
                return;
            }

            let newHash = md5(newSite);
            let oldHash = md5(oldSite)
            if (newHash !==  oldHash) {
                log(`DIFFERENCE FOUND IN ${url}!`);
                log(newHash);
                log(oldHash);
                writeSiteFile(url, newSite);
                const pastebinURL = await new Promise((res, _rej) => {
                    request.post({url:'https://pastebin.com/api/api_post.php', form: {
                    api_option: "paste",
                    api_user_key: "",
                    api_paste_private: "0",
                    api_paste_name: `File Comparison for ${url}`,
                    api_paste_expire_date: "1W",
                    api_paste_format: "html5",
                    api_dev_key: env.pastebin,
                    api_paste_code: `Old file:\n\n${oldSite}\n\nNew file:\n\n${newSite}`
                    }}, function(err, _res, body) {
                        if (err) {
                            log("Pastebin error, skipping.");
                            res("N/A");
                        } else {
                            res(body);
                        }
                    });
                });

                log(pastebinURL);
                sendMessage(url, pastebinURL);
            } else {
                log(`No differences found in ${url}, continuing.`);
            }
        });
    } else {
        writeSiteFile(url);
    }
}

function sendMessage(url, pastebinURL) {
    // Set up and publish text message
    var params = {
        Message: `This website has changed (see changes at ${pastebinURL})! : ${url}`,
        PhoneNumber: env.aws.PHONE,
    };

    let p = sns.publish(params).promise();
    p.then(() => {
        log(`Text sent for ${url}!`);
    });
}

async function writeSiteFile(url, data) {
    if (!data) {
        log(`Writing initial site file for ${url}.`);
        data = await new Promise((res, rej) => {
            request(url, (error, _res, body) => {
                if (error) {
                    res(writeSiteFile(url));
                }

                res(body);
            });
        });
    }

    fs.writeFileSync(`./.${md5(url)}.site`, data);
}