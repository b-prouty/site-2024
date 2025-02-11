import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    try {
        const dataPath = path.join(process.cwd(), 'pages', 'api', 'brian_data.json');
        const jsonData = fs.readFileSync(dataPath, 'utf8');
        const data = JSON.parse(jsonData);
        res.status(200).json(data);
    } catch (error) {
        console.error('Error reading brian_data.json:', error);
        res.status(500).json({ error: 'Failed to load data' });
    }
} 