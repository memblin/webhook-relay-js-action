# Webhook Relay
 
This action was created to explore the idea of forwarding webhook event data from a self-hosted GitHub Action runner to an Atlantis server /events endpoint but could likely relay to any webhook endpoint that the self-hosted runner could reach via network.

Supports application/json encoded webhooks only.

## Inputs
 
### `WEBHOOK_ENDPOINT`

**Required** URL of the webhook endpoint to relay the event content to.

### `WEBHOOK_SECRET`

**Required** Webhook Secret used to create the `X-Hub-Signature` and `X-Hub-Signature-256` values.

*If your endpoint doesn't support validation this value may not matter but it's still required input.*

## Outputs

### `responseStatus`
 
The HTTP status code from the response from the WEBHOOK_ENDPOINT requests.
 
### `responseData`
 
The body of the response from the WEBHOOK_ENDPOINT request.
## Example usage

```yaml
uses: memblin/webhook-relay-js-action
with:
  WEBHOOK_PAYLOAD: {{ }}
  WEBHOOK_SECRET: {{ }}
```

## Build

```bash
# Compile the index.js
ncc build index.js

# Add changes, commit, tag, push
git add .
git commit -m 'commit_message'
git tag -a -m "tag_message" vX.Y.Z
git push --follow-tags
```
