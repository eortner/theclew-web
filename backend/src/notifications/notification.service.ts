import { prisma } from '../lib/prisma';
import { Prisma, NotificationType } from '@prisma/client';

interface CreateNotificationInput {
  userId:    string;
  type:      NotificationType;
  title:     string;
  body:      string;
  metadata?: Record<string, unknown>;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  await prisma.notification.create({
    data: {
      userId:   input.userId,
      type:     input.type,
      title:    input.title,
      body:     input.body,
      metadata: (input.metadata ?? {}) as Prisma.InputJsonValue,
    },
  });
}