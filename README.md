# DC voting bot

A simple Discord bot for creating decentralized polls.

## Slash commands

This bot uses the new slash commands for the best user experience.

### Poll commands

- `/poll <subject> <reactions?>` Create a poll with the given attributes.
- `/dmpoll` - Create a poll using direct messages.
- `/closepoll <ID>` - Close the poll with the given ID.

### Whitelist commands

- `/whitelistadd` - Add (an) address(es) to the whitelist.
- `/whitelistrm` - Remove (an) address(es) from the whitelist.

### Misc

- `/ping` - Replies with pong when the bot is available.

## Using the API

The following API endpoints are available:

- `/reacts/:id` - Get the count of all the valid reacts from a poll message
- `/polls/list/:id` - Get the list of polls on a DC server
- `/channels/:userId` - Get all the channels that both the given user and the
  bot are members of
- `/polls/create/:signed/:channelId/:content/:reactions` - Create a poll in
  the specified channel with the given content and reactions. A message signed
  with the user's wallet is used to authenticate the user.

## Setting up locally

Install dependencies:

```bash
npm i
# or
yarn install
```

Create a new file called .env and add the following environment variables:

```txt
BOT_TOKEN=7812MjU5O7812jUz7812Nzg3.YQ10pw.8Ae7812uC4VS3v7812V9xq7812Y
```

Run the bot:

```bash
# for development:
npm run dev
# or
yarn dev

# for production:
npm run build && npm run prod
# or
yarn build && yarn prod
```
