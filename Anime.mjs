// test2.mjs
import { ANIME } from '@consumet/extensions';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec as execCallback, spawn } from 'child_process';

const exec = promisify(execCallback);

let downloadPath = '';

const getDownloadPath = async () => {
  if (!downloadPath) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Enter the download path:',
        default: process.cwd(),
      },
    ]);
    downloadPath = answers.path;
  }
  return downloadPath;
};

const sanitizeFilename = (filename) => {
  return filename.replace(/[<>:"/\\|?*]/g, '_'); // Replace invalid characters with underscores
};

const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const fetchEpisodeSourcesWithRetry = async (provider, episodeId, retries = 3, delay = 1000) => {
  let attempts = 0;
  while (attempts < retries) {
    try {
      const sources = await provider.fetchEpisodeSources(episodeId);
      return sources;
    } catch (error) {
      attempts++;
      if (attempts >= retries) {
        throw new Error(`Episode not found after ${retries} attempts. Last error: ${error.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const streamEpisode = async (consumet, episode, qualityIndex) => {
  const sources = await fetchEpisodeSourcesWithRetry(consumet, episode.id);
  if (!sources || sources.sources.length === 0) {
    console.error(`No sources found for episode ${episode.number}`);
    return;
  }

  const vlcCommand = `vlc --no-video-title-show "${sources.sources[qualityIndex].url}"`;

  console.log(`Streaming episode ${episode.number} with command: ${vlcCommand}`);

  try {
    // Execute VLC command using spawn
    const vlcProcess = spawn('vlc', ['--no-video-title-show', sources.sources[qualityIndex].url], {
      stdio: ['ignore', 'pipe', 'pipe'], // Ignore stdin, pipe stdout and stderr
    });

    // Log stdout if needed
    vlcProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    // Filter and handle stderr
    vlcProcess.stderr.on('data', (data) => {
      const stderrMessage = data.toString();
      // Check if it's a Direct3D11 error and ignore logging it
      if (!stderrMessage.includes('Direct3D11')) {
        console.error(`stderr: ${data}`);
      }
    });

    vlcProcess.on('close', (code) => {
      console.log(`VLC process exited with code ${code}`);
      if (process.stdin.isPaused()) {
        process.stdin.resume();
      }
    });

    vlcProcess.on('error', (err) => {
      console.error('Error with VLC process:', err);
      if (process.stdin.isPaused()) {
        process.stdin.resume();
      }
    });

    // Prompt for next action
    const { nextAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'nextAction',
        message: 'Do you want to continue with another action or quit?',
        choices: ['Continue with another action', 'Quit'],
      },
    ]);

    return nextAction;
  } catch (error) {
    console.error(`An error occurred while streaming the episode: ${error.message}`);
    if (process.stdin.isPaused()) {
      process.stdin.resume();
    }
  }
};

const downloadEpisode = async (consumet, episode, qualityIndex, downloadPath, animeTitle) => {
  const sources = await fetchEpisodeSourcesWithRetry(consumet, episode.id);
  if (!sources || sources.sources.length === 0) {
    console.error(`No sources found for episode ${episode.number}`);
    return;
  }

  const quality = ['360p', '480p', '720p', '1080p'][qualityIndex];
  const sanitizedAnimeTitle = sanitizeFilename(animeTitle);
  const animeFolder = path.join(downloadPath, sanitizedAnimeTitle);
  ensureDirectoryExists(animeFolder);
  const episodeFile = path.join(animeFolder, `episode-${episode.number}-${quality}.mp4`);

  const downloadCommand = `ffmpeg -i "${sources.sources[qualityIndex].url}" -c copy "${episodeFile}"`;
  console.log(`Downloading episode ${episode.number} with command: ${downloadCommand}`);

  try {
    const { stdout, stderr } = await exec(downloadCommand);
    console.log(`Downloaded episode ${episode.number} successfully.`);
  } catch (error) {
    console.error(`Error downloading episode: ${error.message}`);
  }

  if (process.stdin.isPaused()) {
    process.stdin.resume();
  }

  const { nextAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'nextAction',
      message: 'Do you want to continue with another action or quit?',
      choices: ['Continue with another action', 'Quit'],
    },
  ]);

  return nextAction;
};

const searchAnime = async () => {
  let previousStep = null;
  let currentStep = 'searchAnime';

  const stepHandlers = {
    searchAnime: async (state) => {
      const consumet = new ANIME.Gogoanime();
      const { keyword } = await inquirer.prompt([
        {
          type: 'input',
          name: 'keyword',
          message: 'Enter the keyword to search for anime:',
        },
      ]);

      let searchResults;
      try {
        searchResults = await consumet.search(keyword);
      } catch (error) {
        console.error('Failed to fetch search results. Please check your internet connection and try again.');
        return;
      }

      const choices = searchResults.results.map((anime) => ({
        name: anime.title,
        value: anime,
      }));
      choices.push({ name: 'Back', value: 'BACK' });

      const { chosenAnime } = await inquirer.prompt([
        {
          type: 'list',
          name: 'chosenAnime',
          message: 'Choose an anime from the list:',
          choices,
        },
      ]);

      if (chosenAnime === 'BACK') {
        return { nextStep: previousStep };
      }

      return { nextStep: 'chooseAction', chosenAnime, consumet };
    },

    chooseAction: async (state) => {
      const downloadPath = await getDownloadPath();
      const { chosenAnime, consumet } = state;

      let animeEpisodes;
      try {
        animeEpisodes = await consumet.fetchAnimeInfo(chosenAnime.id);
      } catch (error) {
        console.error('Failed to fetch anime info. Please check your internet connection and try again.');
        return;
      }

      const { episodeChoiceType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'episodeChoiceType',
          message: 'Do you want to download all episodes, a range, or a specific episode?',
          choices: ['All', 'Range', 'Specific', 'Back'],
        },
      ]);

      if (episodeChoiceType === 'Back') {
        return { nextStep: 'searchAnime' };
      }

      return { nextStep: episodeChoiceType, animeEpisodes, chosenAnime, consumet, downloadPath };
    },

    All: async (state) => {
      const { animeEpisodes, chosenAnime, consumet, downloadPath } = state;
      const episodesToProcess = animeEpisodes.episodes;

      const { quality } = await inquirer.prompt([
        {
          type: 'list',
          name: 'quality',
          message: 'Choose a quality to download/stream:',
          choices: ['360p', '480p', '720p', '1080p', 'Back'],
        },
      ]);
      const qualityIndex = ['360p', '480p', '720p', '1080p'].indexOf(quality);

      if (quality === 'Back') {
        return { nextStep: 'chooseAction' };
      }

      for (const episode of episodesToProcess) {
        await downloadEpisode(consumet, episode, qualityIndex, downloadPath, chosenAnime.title);
      }

      return { nextStep: 'searchAnime' };
    },

    Range: async (state) => {
      const { animeEpisodes, chosenAnime, consumet, downloadPath } = state;

      const { range } = await inquirer.prompt([
        {
          type: 'input',
          name: 'range',
          message: 'Enter the range of episodes (e.g., 1-5):',
        },
      ]);
      const [start, end] = range.split('-').map(Number);
      const episodesToProcess = animeEpisodes.episodes.slice(start - 1, end);

      const { quality } = await inquirer.prompt([
        {
          type: 'list',
          name: 'quality',
          message: 'Choose a quality to download/stream:',
          choices: ['360p', '480p', '720p', '1080p', 'Back'],
        },
      ]);
      const qualityIndex = ['360p', '480p', '720p', '1080p'].indexOf(quality);

      if (quality === 'Back') {
        return { nextStep: 'chooseAction' };
      }

      for (const episode of episodesToProcess) {
        await downloadEpisode(consumet, episode, qualityIndex, downloadPath, chosenAnime.title);
      }

      return { nextStep: 'searchAnime' };
    },

    Specific: async (state) => {
      const { animeEpisodes, chosenAnime, consumet, downloadPath } = state;

      const episodeChoices = animeEpisodes.episodes.map((episode) => ({
        name: `Episode ${episode.number}`,
        value: episode,
      }));
      episodeChoices.push({ name: 'Back', value: 'BACK' });

      const { chosenEpisode } = await inquirer.prompt([
        {
          type: 'list',
          name: 'chosenEpisode',
          message: 'Choose an episode from the list:',
          choices: episodeChoices,
        },
      ]);

      if (chosenEpisode === 'BACK') {
        return { nextStep: 'chooseAction', animeEpisodes, chosenAnime, consumet, downloadPath };
      }

      const { actionType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'actionType',
          message: `Do you want to download or stream Episode ${chosenEpisode.number}?`,
          choices: ['Download', 'Stream', 'Back'],
        },
      ]);

      if (actionType === 'Back') {
        return { nextStep: 'Specific', animeEpisodes, chosenAnime, consumet, downloadPath };
      }

      const { quality } = await inquirer.prompt([
        {
          type: 'list',
          name: 'quality',
          message: 'Choose a quality to download/stream:',
          choices: ['360p', '480p', '720p', '1080p', 'Back'],
        },
      ]);
      const qualityIndex = ['360p', '480p', '720p', '1080p'].indexOf(quality);

      if (quality === 'Back') {
        return { nextStep: 'Specific', animeEpisodes, chosenAnime, consumet, downloadPath };
      }

      if (actionType === 'Download') {
        await downloadEpisode(consumet, chosenEpisode, qualityIndex, downloadPath, chosenAnime.title);
      } else {
        const nextAction = await streamEpisode(consumet, chosenEpisode, qualityIndex);
        if (nextAction === 'Quit') {
          console.log('Exiting...');
          process.exit();
        }
      }

      return { nextStep: 'searchAnime' };
    },
  };

  let state = {};
  while (true) {
    const handler = stepHandlers[currentStep];
    const result = await handler(state);

    if (result && result.nextStep) {
      previousStep = currentStep;
      currentStep = result.nextStep;
      state = result;
    } else {
      break;
    }
  }
};

searchAnime().catch((error) => {
  console.error('An unexpected error occurred:', error);
});
