const https = require('https');
const logger = require('../utils/logger');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'generativelanguage.googleapis.com';
const GEMINI_MODEL = 'gemini-1.5-flash';

function httpsPost(hostname, path, body) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(JSON.stringify(body), 'utf8');
    const options = {
      hostname,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': bodyBuf.length
      },
      timeout: 30000
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const data = Buffer.concat(chunks).toString('utf8');
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            reject(new Error(`Không parse được JSON từ Gemini: ${data.substring(0, 300)}`));
          }
        } else {
          logger.error(`Gemini HTTP ${res.statusCode}:`, data.substring(0, 500));
          reject(new Error(`Gemini API lỗi ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Gemini API timeout (30s)'));
    });
    req.on('error', (err) => {
      logger.error('Gemini request error:', err.message);
      reject(err);
    });
    req.write(bodyBuf);
    req.end();
  });
}

async function callGemini(parts) {
  const path = `/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const data = await httpsPost(GEMINI_API_URL, path, {
    contents: [{ parts }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
  });

  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

function parseGeminiResult(text) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : text;
    return JSON.parse(jsonStr.trim());
  } catch {
    logger.warn('Không parse được JSON từ Gemini, dùng regex fallback');
    const name = text.match(/(?:tên|name)[:\s]+([^\n,]+)/i)?.[1]?.trim() || 'Sản phẩm';
    const price = text.match(/(?:giá|price)[:\s]+([^\n,]+)/i)?.[1]?.trim() || null;
    const shopeeUrl = text.match(/https?:\/\/shopee\.vn[^\s"']*/)?.[0] || null;
    return { name, price, shopeeUrl, imageUrl: null };
  }
}

function fetchImageAsBase64(imageUrl) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(imageUrl);
    const mod = urlObj.protocol === 'https:' ? https : require('http');
    mod.get(imageUrl, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchImageAsBase64(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const mimeType = res.headers['content-type'] || 'image/jpeg';
        resolve({ base64: buf.toString('base64'), mimeType });
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function analyzeImageForProduct(imageUrl) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
  }

  logger.info('Fetching image from Cloudinary:', imageUrl);
  const { base64, mimeType } = await fetchImageAsBase64(imageUrl);
  logger.info(`Image fetched: ${mimeType}, size: ${Math.round(base64.length * 0.75 / 1024)}KB`);

  const prompt = `Bạn là trợ lý mua sắm thông minh. Hãy phân tích ảnh sản phẩm này và trả về JSON theo đúng format sau (không thêm text nào khác ngoài JSON):

{
  "name": "tên sản phẩm cụ thể bằng tiếng Việt",
  "price": "giá ước tính (VD: 150.000đ - 200.000đ)",
  "shopeeUrl": "https://shopee.vn/search?keyword=keyword+tiếng+Việt",
  "imageUrl": null
}

Đặt shopeeUrl là link tìm kiếm Shopee với keyword tiếng Việt phù hợp nhất.`;

  const parts = [
    { text: prompt },
    { inline_data: { mime_type: mimeType, data: base64 } }
  ];

  logger.info('Gemini: Phân tích ảnh sản phẩm...');
  const text = await callGemini(parts);
  logger.info('Gemini response (image):', text.substring(0, 200));

  const result = parseGeminiResult(text);
  result.imageUrl = imageUrl;
  return result;
}

async function analyzeShopeeUrl(shopeeUrl) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY chưa được cấu hình trong .env');
  }

  const prompt = `Đây là URL sản phẩm Shopee: ${shopeeUrl}

Từ URL này, hãy trích xuất thông tin và trả về JSON theo đúng format (không thêm text nào khác):

{
  "name": "tên sản phẩm từ URL (decode URL nếu cần)",
  "price": null,
  "shopeeUrl": "${shopeeUrl}",
  "imageUrl": null
}

Lưu ý: Chỉ trích xuất tên sản phẩm từ slug trong URL. Đặt price và imageUrl là null vì cần scrape trực tiếp.`;

  const parts = [{ text: prompt }];

  logger.info('Gemini: Phân tích Shopee URL...');
  const text = await callGemini(parts);
  logger.info('Gemini response (URL):', text.substring(0, 200));

  const result = parseGeminiResult(text);
  result.shopeeUrl = shopeeUrl;
  return result;
}

module.exports = { analyzeImageForProduct, analyzeShopeeUrl };
