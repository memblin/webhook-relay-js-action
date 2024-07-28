# Atlantis Webhook Relay

This action was created to explore the idea of forwarding webhook event data from a GitHub Action runner to an Atlantis server.

## Inputs

### `webhook`

**Required** The name of the person to greet. Default `"World"`.

## Outputs

### `time`

The time we greeted you.

## Example usage

```yaml
uses: memblin/atlantis-webhook-relay-js-action
with:
  WEBHOOK_PAYLOAD: {{ }}
  WEBHOOK_SECRET: {{ }}
```
