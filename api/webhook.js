import { Client, validateSignature } from '@line/bot-sdk';

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const client = new Client(config);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const signature = req.headers['x-line-signature'];
    if (!signature) {
      return res.status(400).send('Bad Request');
    }

    const body = await readBody(req);
    const isValid = validateSignature(body, config.channelSecret, signature);
    if (!isValid) {
      return res.status(400).send('Invalid signature');
    }

    res.status(200).send('OK'); // ตอบกลับให้ LINE ทันที

    const events = JSON.parse(body).events || [];
    for (const event of events) {
      if (event.type === 'message' && event.message.type === 'text') {
        await client.replyMessage(event.replyToken, {
          type: 'text',
          text: 'คุณพิมพ์ว่า: ' + event.message.text
        });
      }
    }

  } else {
    // ถ้าไม่ใช่ POST method
    res.status(405).send('Method Not Allowed');
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', err => reject(err));
  });
}
