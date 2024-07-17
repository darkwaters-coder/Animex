const axios = require()

/*
Using the example episode ID of 'spy-x-family-episode-1',
explicitly defining default server for demostrative purposes.
*/
const url = "https://api.consumet.org/movies/flixhq/watch";
const data = async () => {
 try {
 const { data } = await axios.get(url, { params: { episodeId: "10766", mediaId: "tv/watch-rick-and-morty-39480", server: "upcloud" } });
 return data;
 } catch (err) {
 throw new Error(err.message);
 }
};

console.log(data);
