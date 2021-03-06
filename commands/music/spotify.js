const keysec = process.env;
const { Command, clie } = require("klasa");
const SpotifyWebApi = require("spotify-web-api-node");
const fs = require("fs");
let spotify_access_token = "at placeholder";
let spotify_access_time = "0";
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.spotify_client_id,
  clientSecret: process.env.spotify_client_secret
});
let spotify = spotifyApi;
spotifyApi.setAccessToken(spotify_access_token);
module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      name: "spotify",
      enabled: true,
      runIn: ["text", "dm"],
      aliases: ["spot", "s"],
      subcommands: true,
      usage: "<artist|playlist|album|t|p|a|track:default> (args:str) [...]",
      usageDelim: " ",
      description: "gets urbandictionary of word",
      extendedHelp: "No extended help available."
    });
  }

  async track(message, args) {
    let q = args.join();
    let hi = this.start();
    let market = "us";
    let searchTracks = async (message, args) => {
      spotifyApi.searchTracks(
        q,
        {
          limit: 1,
          offset: 0,
          market: `${market}`
        },
        function(err, data) {
          if (err) return searchTracks(message, args);
          let track = data;
          let explicit = "";
          if (track.body.tracks.items[0] == undefined) {
            console.log("nothing found");
            return global.resp.send("nothing found for " + q);
          }
          const explicitlet = data.body.tracks.items[0].explicit;
          if (explicitlet === true) {
            explicit = "  🅴";
          }
          return message.channel.send({
            embed: {
              title: `${track.body.tracks.items[0].name}${explicit}`,
              description: `by ${track.body.tracks.items[0].artists[0].name}\non ${track.body.tracks.items[0].album.name} \n[play on spotify >](https://open.spotify.com/go?uri=${track.body.tracks.items[0].uri})`,
              url: `https://open.spotify.com/go?uri=${track.body.tracks.items[0].uri}`,
              color: 2708478,
              footer: {
                text: "カンボット by kanbaru#8366 | powered by spotify web api "
              },
              thumbnail: {
                url: `${track.body.tracks.items[0].album.images[1].url}`
              }
            }
          });
        }
      );
    };
    searchTracks(message,args);
  }
  start() {
    let currentTime = new Date().getTime();
    if (spotify_access_token === "at placeholder") {
      spotifyApi.clientCredentialsGrant().then(
        function(data) {
          console.log(
            "The access token expires in " +
              data.body["expires_in"] +
              " minutes"
          );
          console.log("The access token is " + data.body["access_token"]);
          spotify_access_token = data.body["access_token"];
          spotifyApi.setAccessToken(data.body["access_token"]);
          spotify_access_time = currentTime + (data.body["expires_in"]*60000);
          spotify = spotifyApi;
          fs.writeFileSync(
            __dirname + "/token.json",
            JSON.stringify({
              AccessToken: data.body["access_token"],
              RefreshToken: data.body["refresh_token"],
              Time: spotify_access_time
            })
          );
          return data.body["access_token"];
        },
        function(err) {
          console.log(
            "Something went wrong when retrieving an access token",
            err
          );
        }
      );
    } else if (spotify_access_time < currentTime) {
      console.log(spotify_access_time, currentTime);
      let TokenData = JSON.parse(fs.readFileSync(__dirname + "/token.json"));
      spotifyApi.setRefreshToken(TokenData.RefreshToken);
      spotifyApi.refreshAccessToken().then(
        function(data) {
          console.log("The access token has been refreshed!");

          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body["access_token"]);
        },
        function(err) {
          console.log("Could not refresh access token", err);
        }
      );
    } else {
      console.log("token valid");
      console.log(spotify_access_time, currentTime);
    }
  }
};
