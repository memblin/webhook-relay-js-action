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

With `WEBHOOK_ENDPOINT` defined as an Actions Variable and `WEBHOOK_SECRET` defined as an Actions Secret.

This implementation is successful at triggering Atlantis terraform operations in the lab.

```yaml
name: GitHub Webhook Relay - Action
run-name: ${{ github.actor }} triggered webhook-relay workflow
on:
  pull_request:
    types: [closed, edited, opened, reopened, synchronize]
  issue_comment:
    types: [created, edited]
jobs:
  Relay-Webhook:
    # This conditional stops Atlantis responses from re-triggering
    # a webhook relay. The runs will show up as skipped in the actions
    # pannel because they are issue_comment created event types but
    # we're skipping based on actor content.
    if: github.actor != 'atlantis-for-atlantis-tkclabs-io[bot]'
    runs-on: self-hosted
    steps:
      - name: Relay Webhook content
        id: relay-webhook
        uses: memblin/webhook-relay-js-action@v1.0.3
        with:
          WEBHOOK_ENDPOINT: ${{ vars.WEBHOOK_ENDPOINT }}
          WEBHOOK_SECRET: ${{ secrets.WEBHOOK_SECRET }}
      - name: Show Response Info
        run: |
          echo "HTTP Response Code, ${RESPONSE_CODE}"
          echo "HTTP Response Data, ${RESPONSE_DATA}"
        env: 
          RESPONSE_CODE: ${{ steps.relay-webhook.outputs.responseStatus }}
          RESPONSE_DATA: ${{ staps.relay-webhook.outputs.responseData }}
```

## Build and Release Notes

```bash
# Compile the index.js
ncc build index.js

# Add changes, commit, tag, push
git add .
git commit -m 'commit_message'
git tag -a -m "tag_message" vX.Y.Z
git push --follow-tags
```
