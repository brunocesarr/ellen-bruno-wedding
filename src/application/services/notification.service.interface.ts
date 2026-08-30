export interface INotificationService {
  send(message: string): Promise<void>
}
