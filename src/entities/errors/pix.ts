export class PixError extends Error {
  constructor(message = 'Falha ao gerar o Pix') {
    super(message)
    this.name = 'PixError'
  }
}

export class InvalidPixCodeError extends Error {
  constructor(reason: string) {
    super(`Generated PIX code is invalid: ${reason}`)
    this.name = 'InvalidPixCodeError'
  }
}
