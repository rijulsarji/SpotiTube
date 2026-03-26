import express, { Request, Response } from 'express';
import { db } from '../../../db';
import { N8N_URL } from '../../../config/env';

const router = express.Router();

router.post('/convert', async (req: Request, res: Response) => {
    const { spotifyUrl } = req.body;
    if (!spotifyUrl) {
        return res.status(400).json({ error: 'Spotify URL is required' });
    }

    try {
        const stmt = db.prepare(`INSERT INTO conversions (spotify_url, status) VALUES (?, ?)`);
        stmt.run([spotifyUrl, 'LOADING'], async function (err: any) {
            if (err) {
                console.error('Error saving conversion', err);
                return res.status(500).json({ error: 'Failed to initialize conversion' });
            }

            const conversionId = this.lastID; // The newly inserted ID

            // Trigger n8n async (don't wait for its long process to finish)
            const n8nWebhookUrl = `${N8N_URL}/webhook-test/f43ca30d-8641-4551-ad44-20dea0c38574`;
            fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: spotifyUrl, conversionId })
            }).catch(e => console.error('Error pinging n8n', e));

            // Return immediately with the ID so frontend can poll
            return res.json({ conversionId, status: 'LOADING' });
        });
    } catch (error) {
        console.error('Error in /convert:', error);
        return res.status(500).json({ error: 'Failed to process playlist conversion' });
    }
});

// GET /api/v1/spotitube/status/:id
router.get('/status/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    db.get(`SELECT * FROM conversions WHERE id = ?`, [id], (err, row: any) => {
        if (err || !row) return res.status(404).json({ error: 'Not found' });

        return res.json({
            status: row.status,
            youtubeUrl: row.youtube_url,
            songsConverted: row.songs_converted ? JSON.parse(row.songs_converted) : [],
            bonusTracks: row.bonus_tracks ? JSON.parse(row.bonus_tracks) : []
        });
    });
});

// POST /api/v1/spotitube/webhook/n8n-result
router.post('/webhook/n8n-result', (req: Request, res: Response) => {
    const { conversionId, youtubeUrl, songsConverted, bonusTracks, status } = req.body;

    if (!conversionId) return res.status(400).json({ error: 'conversionId required' });

    const finalStatus = status || 'COMPLETED'; // or FAILED
    const stmt = db.prepare(`UPDATE conversions SET youtube_url = ?, songs_converted = ?, bonus_tracks = ?, status = ? WHERE id = ?`);

    stmt.run([
        youtubeUrl || null,
        JSON.stringify(songsConverted || []),
        JSON.stringify(bonusTracks || []),
        finalStatus,
        conversionId
    ], function (err) {
        if (err) return res.status(500).json({ error: 'Failed to save webhook data' });
        return res.json({ success: true });
    });
});

// GET /api/v1/spotitube/analytics
router.get('/analytics', (req: Request, res: Response) => {
    db.get(`SELECT page_visits, convert_again_count FROM stats WHERE id = 1`, (err, statsRow: any) => {
        if (err || !statsRow) {
            return res.status(500).json({ error: 'Failed to fetch overall stats' });
        }

        db.get(`SELECT COUNT(*) as conversions_count FROM conversions`, (err2, conversionsRow: any) => {
            if (err2) {
                return res.status(500).json({ error: 'Failed to fetch conversions count' });
            }

            res.json({
                pageVisits: statsRow.page_visits,
                convertAgainCount: statsRow.convert_again_count,
                conversionsCount: conversionsRow.conversions_count || 0
            });
        });
    });
});

// POST /api/v1/spotitube/track
router.post('/track', (req: Request, res: Response) => {
    const { event } = req.body; // 'page_visit', 'convert_again', or 'convert_playlist'

    if (event === 'page_visit') {
        db.run(`UPDATE stats SET page_visits = page_visits + 1 WHERE id = 1`);
        return res.json({ success: true, event: 'page_visit' });
    } else if (event === 'convert_again') {
        db.run(`UPDATE stats SET convert_again_count = convert_again_count + 1 WHERE id = 1`);
        return res.json({ success: true, event: 'convert_again' });
    } else if (event === 'convert_playlist') {
        db.run(`UPDATE stats SET convert_playlist_count = convert_playlist_count + 1 WHERE id = 1`);
        return res.json({ success: true, event: 'convert_playlist' });
    }

    return res.status(400).json({ error: 'Invalid event type' });
});

export default router;
