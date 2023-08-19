# discord_bot_js
A discord bot specialised for my server

## Installation

### Set up the .env file
Please include a .env file in the root folder
Example:
```
// COMPULSORY
BOT_TOKEN = "Your bot token"
CLIENT_ID = "Your application id"
OPENWEATHER_API_KEY = "Your OpenWeather API key"
CONFIRMATION_EMOJI_ID = "✅"

// OPTIONAL
GUILD_ID = "Your guild's id"
FFMPEG_PATH = "Your ffmpeg path" // E.g. "D:/ffmpeg/bin"
DP_FORCE_YTDL_MOD = "@distube/ytdl-core"
```

### Set up the config files
You may modify the `config/config.json` as you wish. However, please do not modify anything in the `config/sv_config.json`, unless there is a new card pack released or you want to restrict the filter condition.

### Download FFMPEG to your machine
Please install FFMPEG to your machine locally, it is **NOT** recommended to use **`ffmpeg-static`** or anything similar, since they are not stable and may possibly cause some unexpected problems.
> Use `FFMPEG_PATH` environment variable to load ffmpeg from custom path if necessary.

## Micellanouse
1. This bot currently does not support sharding, so if this bot is in a total of 2000+ guilds, please add it yourself :)

2. Playing any Youtube audio actually violates the TOS of Discord API. Although this bot supports playing audios from Youtube, please do not do so to avoid any risk.

3. This bot may contain numerous bugs, please feel free to fix them.

