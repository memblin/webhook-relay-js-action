const core = require('@actions/core');
const github = require('@actions/github');
const crypto = require('crypto');
const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Default Environment Variables
const GITHUB_EVENT_PATH = process.env.GITHUB_EVENT_PATH || null;
const GITHUB_EVENT_NAME = process.env.GITHUB_EVENT_NAME || null;
const RUNNER_NAME = process.env.RUNNER_NAME || null;

// Provided by vars and secrets Context Variables
const WEBHOOK_ENDPOINT = process.env.WEBHOOK_ENDPOINT || null;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;

function getSignatures(payload, secret) {
  // Generate X-Hub-Signature
  const sha1Hash = crypto.createHmac('sha1', secret).update(payload).digest('hex');
  const sha1Signature = `sha1=${sha1Hash}`;

  // Generate X-Hub-Signature-256 value
  const sha256Hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const sha256Signature = `sha256=${sha256Hash}`;

  return { sha1Signature, sha256Signature };
}

async function main() {
  try {
    const payload = fs.readFileSync(GITHUB_EVENT_PATH, 'utf8');
    const payloadString = JSON.stringify(JSON.parse(payload), null, '');

    const { sha1Signature, sha256Signature } = getSignatures(payloadString, WEBHOOK_SECRET);

    // Set the headers
    const headers = {
      'Host': RUNNER_NAME,
      'User-Agent': 'WebHook-Relay-Action',
      'Content-Length': `${payloadString.length}`,
      'Accept': '*/*',
      'Content-Type': 'application/json',
      'X-Hub-Signature': sha1Signature,
      'X-Hub-Signature-256': sha256Signature,
      'X-GitHub-Delivery': `${uuidv4()}`,
      'X-GitHub-Event': GITHUB_EVENT_NAME,
    };

    // Make the POST request
    const response = await axios.post(WEBHOOK_ENDPOINT, payloadString, { headers });

    // Print the response
    console.log(response.status);
    console.log(response.data);

  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
