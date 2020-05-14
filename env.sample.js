// Get these credentials from an AWS IAM account with an SNS write policy
exports.aws = {
    ID: "AWS_KEY_ID",
    KEY: "AWS_SECRET_KEY",
    // Choose your standard region that supports SNS
    REGION: "us-east-2",
    // Phone number to text when website changes
    PHONE: "+19876543210"
}

// Array of sites to check
exports.search = ["https://xkcd.com"]