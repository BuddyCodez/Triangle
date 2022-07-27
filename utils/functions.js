const Canvas = require("@napi-rs/canvas");
const { request } = require("undici");
const fs = require('fs');

module.exports = client => {

    client.groupBy = async (arr, property) => {
        return arr.reduce(function (memo, x) {
            if (!memo[x[property]]) {
                memo[x[property]] = [];
            }
            memo[x[property]].push(x);
            return memo;
        }, {});
    }

    client.genThankYouCard = async (path, user) => {
        // create a canvas context
        const canvas = Canvas.createCanvas(596, 420);
        const context = canvas.getContext("2d");

        // draw the background image
        const background = new Canvas.Image();
        background.src = fs.readFileSync(path);
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        // draw user avatar 32x32 bottom left
        const avatarURL = user.displayAvatarURL({ format: 'png' });
        const { body } = await request(avatarURL);
        const avatar = new Canvas.Image();
        avatar.src = Buffer.from(await body.arrayBuffer());

        // clip the avatar to a circular image
        context.beginPath();
        context.arc(canvas.width - (32 / 2) - 15 - (20 + 32), canvas.height - (32 / 2) - 15, 32 / 2, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        context.drawImage(avatar, canvas.width - (32) - 15 - (20 + 32), canvas.height - (32) - 15, 32, 32);

        //fs.writeFileSync('out.png', await canvas.encode('png'))

        return canvas.toBuffer('image/png');

    }

}