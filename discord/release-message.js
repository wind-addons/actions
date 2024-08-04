const releaseEvent = process.env.RELEASE_EVENT_JSON;
const repository = process.env.REPOSITORY_NAME;
const repositoryUrl = process.env.REPOSITORY_URL;
const discordWebHook = process.env.DISCORD_WEBHOOK;
const emoji = process.env.RELEASE_TITLE_EMOJI || '🚀';

if (!releaseEvent || !repository || !repositoryUrl || !discordWebHook) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const release = JSON.parse(releaseEvent);
const sections = release.body.split('\n\n');

const embed = {
  title: `${emoji} ${release.name}`,
  url: release.html_url,
  color: 39423,
  author: {
    name: repository,
    url: repositoryUrl,
    icon_url:
      'https://github.com/wind-addons/resources/blob/main/dist/icons/toolchains-logo.png?raw=true',
  },
  fields: [],
  footer: {
    text: release.author.name,
    icon_url: release.author.avatar_url,
  },
  timestamp: release.published_at,
};

for (var i = 0; i < sections.length; i++) {
  var section = sections[i];

  // Last line: Full Changelog
  if (section.startsWith('**Full Changelog**')) {
    embed.description = `[Full Changelog](${
      section.match(/https:\/\/\S+/)[0]
    })`;
    continue;
  }

  var lines = section.split('\n');
  var title = lines.shift().replace('##', '').trim();

  // Style list items
  var body = lines.map((line) => line.replace(/^\*/, '>')).join('\n');

  // Replace GitHub links with markdown links
  body = value.replace(
    /https:\/\/github.com\/fang2hou\/github-actions-test\/pull\/(\d+)/g,
    '[PR #$1]($&)'
  );

  // Replace GitHub usernames with markdown links
  body = value.replace(/@(\w+)/g, '[`@$1`](http://github.com/$1)');

  embed.fields.push({
    name: `${title}`,
    value: body,
  });
}

fetch(discordWebHook, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    embeds: [embed],
  }),
})
  .then((response) => {
    if (response.status !== 204) {
      throw new Error('Failed to send message');
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });

console.log('Message sent');
console.log('embed', embed);