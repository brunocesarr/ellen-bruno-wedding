export class PixError extends Error {
  constructor(message = 'Falha ao gerar o Pix') {
    super(message)
    this.name = 'PixError'
  }
}
