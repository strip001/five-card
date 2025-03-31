import express from 'express';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// 启用 CORS 和 JSON 解析
app.use(cors());
app.use(express.json());

// 添加静态文件支持
app.use(express.static(path.join(__dirname, '../public')));

// 你原来的转换逻辑
async function convertMessage(keyword, apiKey) {
    if (!keyword.trim()) {
        return "请先输入关键词";
    }
    
    if (!apiKey.trim()) {
        return "请输入有效的API密钥";
    }
    
    const prompt = `用中文生成3个关于${keyword}的记忆点，要求：
    1. 每个记忆点用1个相关emoji开头
    2. 语言口语化，不超过20字
    3. 格式示例：
    🍃 光合作用需要光照
    💧 水分解产生氧气
    🌿 叶绿体是反应场所`;

    const headers = {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
    };
    
    const data = {
        "model": "deepseek-chat",
        "messages": [
            {"role": "system", "content": "你是一个帮助生成记忆卡片的助手"},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    };
    
    try {
        const response = await axios.post(DEEPSEEK_API_URL, data, { headers });
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('API调用错误:', error);
        return `生成失败：${error.message}`;
    }
}

// API 端点
app.post('/api/generate', async (req, res) => {
    const { keyword, apiKey } = req.body;
    try {
        const result = await convertMessage(keyword, apiKey);
        res.json({ result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 添加通配符路由，将所有未匹配的请求都指向 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});