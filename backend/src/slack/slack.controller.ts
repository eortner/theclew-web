import { Request, Response } from 'express';

export function getSlackInviteUrl(req: Request, res: Response): void {
  const url = process.env.SLACK_INVITE_URL ?? null;
  res.json({ url });
}