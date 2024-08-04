// Load environment variables
const releaseEvent = process.env.RELEASE_EVENT_JSON;
const repository = process.env.REPOSITORY_NAME;
const discordWebHook = process.env.DISCORD_WEBHOOK;
const barImage = process.env.BAR_IMAGE;
const rocketImage = process.env.ROCKET_IMAGE;

if (!releaseEvent || !repository || !discordWebHook) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Construct the Discord message
const release = JSON.parse(releaseEvent);
const sections = release.body.split('\n\n');

const embed = {
  title: release.name,
  url: release.html_url,
  color: 39423,
  author: {
    name: repository,
    url: `https://github.com/${repository}`,
  },
  fields: [],
  footer: {
    text: release.author.login,
    icon_url: release.author.avatar_url,
  },
  timestamp: release.published_at,
};

// Add images if provided
if (rocketImage) embed.author.icon_url = rocketImage;
if (barImage) embed.image = { url: barImage };

for (var i = 0; i < sections.length; i++) {
  var section = sections[i];

  var lines = section.split('\n').filter((line) => line.trim() !== '');

  // Last line: Full Changelog
  if (lines[0].startsWith('**Full Changelog**')) {
    embed.description = `[Full Changelog](${
      lines[0].match(/https:\/\/\S+/)[0]
    })`;
    continue;
  }

  var title = lines.shift().replace('##', '').trim();

  // Style list items
  var body = lines.map((line) => line.replace(/^\*/, '>')).join('\n');

  // Replace GitHub links with markdown links
  body = body.replace(
    /https:\/\/github.com\/fang2hou\/github-actions-test\/pull\/(\d+)/g,
    '[PR #$1]($&)'
  );

  // Replace GitHub usernames with markdown links
  body = body.replace(/@(\w+)/g, '[`@$1`](https://github.com/$1)');

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
