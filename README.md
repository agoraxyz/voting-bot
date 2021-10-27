# DC voting bot

A simple Discord bot for creating decentralized polls.

## Usage flow

1. Add the bot to your server with
   [this link](https://discord.com/api/oauth2/authorize?client_id=902873515680759808&permissions=8&scope=bot)
1. Use the `/whitelist` command to add the address of the ones you trust
   so they can create polls using the API
1. Create polls using the slash commands or the API

## Slash commands

This bot uses the new slash commands for the best user experience.

### Poll commands

- `/poll <subject> <[reaction]>` Create a poll with the given attributes.
- `/dmpoll` - Create a poll using direct messages.
- `/endpoll <ID>` - Close the poll with the given ID.

### Whitelist commands

- `/whitelistadd <[address]>` - Add (an) address(es) to the whitelist.
- `/whitelistrm <[address]>` - Remove (an) address(es) from the whitelist.

### Misc

- `/ping` - Replies with pong when the bot is available.

## Using the API

Base URL: `voting.guild.xyz`

The following API endpoints are available:

---

GET `/reacts/:id` - Get the count of all the valid reacts from a poll message

Params:

- `id` - the ID of the poll (number)

Return:

```json
[68, 5]
```

Example:

```bash
curl https://voting.guild.xyz/api/reacts/23 && echo
```

---

GET `/polls/list/:serverId` - Get the list of polls on a DC server

Params:

- `serverId` - the ID of the discord server (number)

Result:

```json
[
  {
    "channelId": "891903617860642175",
    "messageId": "901182353538737141",
    "reactions": ["🤩", "😴"],
    "ended": true,
    "results": [68, 5]
  }
]
```

Example:

```bash
curl https://voting.guild.xyz/api/polls/list/769189093557420619 && echo
```

---

GET `/channels/:userId` - Get the IDs of all the channels that both the given
user and the bot are members of

Params:

- `userId` - the userid of a Discord user (number)

Result:

```json
[
  "679189094017138750",
  "679197238790455337",
  "679197282641510400",
  "679197480742944779",
  "694903617830662174"
]
```

Example:

```bash
curl https://voting.guild.xyz/api/channels/690800923355730718 && echo
```

---

POST `/polls/create/:signed/:channelId/:content/:reactions` - Create a poll in
the specified channel with the given content and reactions. A message signed
with the user's wallet is used to authenticate the user.

Params:

```json
{
  "signed": "0x14280e5885a19f60e536de50097e96e3738c7acae4e9e62d67272d794b8127d31c03d9cd59781d4ee31fb4e1b893bd9b020ec67dfa65cfb51e2bdadbb1de26d91c",
  "channelId": "694903617830662174",
  "content": "Do you enjoy the presentation?\n(🤩 - yes / 😴 - no)",
  "reactions": ["🤩", "😴"]
}
```

- `signed` - the message "Please sign this message to verify your address"
  signed with [ethers-js](https://docs.ethers.io/v5/api/signer/#Signer-signMessage)
- `channelId` - the ID of the Discord channel (number)
- `content` - the content of the message
- `reactions` - array of emojies or Discord emote IDs

Result:

```json
true
```

Example:

```bash
curl -X POST https://voting.guild.xyz/api/polls/create \
  -H 'Content-Type: application/json' \
  -d '{
    "signed": "0x14280e5885a19f60e536de50097e96e3738c7acae4e9e62d67272d794b8127d31c03d9cd59781d4ee31fb4e1b893bd9b020ec67dfa65cfb51e2bdadbb1de26d91c",
    "channelId": "694903617830662174",
    "content": "Do you enjoy the presentation?\n(🤩 - yes / 😴 - no)",
    "reactions": ["🤩", "😴"]
  }'
```

---

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
