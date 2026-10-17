export interface INotificationService {
  send(message: string): Promise<void>
}

/** Sends an animated GIF (by public URL) with an HTML caption. */
export interface IAnimationSender {
  sendAnimation(animationUrl: string, caption: string): Promise<void>
}
