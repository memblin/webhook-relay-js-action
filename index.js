const fs = require('fs');
const crypto = require('crypto');
const core = require('@actions/core');

async function main() {
  try {
    const endpoint = core.getInput('WEBHOOK_ENDPOINT', { required: true });
    const secret = core.getInput('WEBHOOK_SECRET', { required: true });

    const eventPath = process.env.GITHUB_EVENT_PATH;
    const eventName = process.env.GITHUB_EVENT_NAME || 'unknown';
    if (!eventPath) throw new Error('GITHUB_EVENT_PATH is not set');

    // Read the event file as raw bytes (NO utf8 flag)
    let bodyBuffer;
    try {
      bodyBuffer = fs.readFileSync(eventPath);
    } catch (fileError) {
      throw new Error(`Failed to read event file at ${eventPath}: ${fileError.message}`);
    }

    // Compute signatures over EXACT bytes that will be sent
    const sig256 = 'sha256=' + crypto.createHmac('sha256', Buffer.from(secret, 'utf-8'))
      .update(bodyBuffer)
      .digest('hex');
    const sig1 = 'sha1=' + crypto.createHmac('sha1', Buffer.from(secret, 'utf-8'))
      .update(bodyBuffer)
      .digest('hex');

    // Synthesize GitHub-ish delivery headers
    const delivery = crypto.randomUUID();
    const ua = 'GHA/webhook-relay-js-action';

    // POST raw bytes, do NOT stringify, do NOT mutate
    const res = await fetch(endpoint, {
      method: 'POST',
      body: bodyBuffer,
      headers: {
        // JSON, but no charset that might trigger a transcode
        'Content-Type': 'application/json',
        'X-GitHub-Event': eventName,
        'X-GitHub-Delivery': delivery,
        'X-Hub-Signature-256': sig256,
        'X-Hub-Signature': sig1,
        'User-Agent': ua
      }
    });

    const text = await res.text();
    core.setOutput('responseStatus', res.status);
    core.setOutput('responseData', text);

    // Diagnostics for when step debugging is on
    const debugOn = process.env.ACTIONS_STEP_DEBUG === 'true';
    if (!res.ok) {
      const sha256OfBody = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
      core.warning(
        `Relay failed: HTTP ${res.status}. Body SHA256: ${sha256OfBody}. ` +
        `X-Hub-Signature-256: ${sig256} X-Hub-Signature: ${sig1}`
      );
      if (debugOn) {
        core.debug(`First 256 bytes (hex): ${bodyBuffer.subarray(0, 256).toString('hex')}`);
        core.debug(`Receiver response body: ${text}`);
      }
      // Fail the workflow
      core.setFailed(`Webhook relay returned ${res.status}`);
    } else if (debugOn) {
      core.debug(`Relay OK: HTTP ${res.status} delivery=${delivery}`);
    }
  } catch (err) {
    core.setFailed(err.message || String(err));
  }
}

main();
