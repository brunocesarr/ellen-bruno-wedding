import {
  MercadoPagoConfig,
  Payment,
  Preference,
  WebhookSignatureValidator,
} from 'mercadopago'

import type {
  CardPayment,
  CreateCardPreferenceInput,
  ICardPaymentService,
} from '@/src/application/services/card-payment.service.interface'

export type MercadoPagoServiceConfig = {
  accessToken: string
  webhookSecret: string
  siteUrl: string
}

export class MercadoPagoService implements ICardPaymentService {
  private readonly client: MercadoPagoConfig
  private readonly webhookSecret: string
  private readonly notificationUrl: string

  constructor(config?: Partial<MercadoPagoServiceConfig>) {
    const accessToken =
      config?.accessToken ?? process.env.MERCADO_PAGO_ACCESS_TOKEN ?? ''
    if (!accessToken) {
      throw new Error('Pagamento por cartão indisponível no momento.')
    }

    const webhookSecret =
      config?.webhookSecret ?? process.env.MERCADO_PAGO_WEBHOOK_SECRET ?? ''
    if (!webhookSecret) {
      throw new Error('Pagamento por cartão indisponível no momento.')
    }

    const siteUrl =
      config?.siteUrl ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      'https://ellen-bruno-wedding.netlify.app'

    this.client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 },
    })
    this.webhookSecret = webhookSecret
    this.notificationUrl = `${siteUrl}/api/mercado-pago/webhook`
  }

  async createPreference(
    input: CreateCardPreferenceInput
  ): Promise<{ checkoutUrl: string }> {
    const preference = new Preference(this.client)

    const result = await preference.create({
      body: {
        items: [
          {
            id: input.giftId,
            title: input.description,
            quantity: 1,
            currency_id: 'BRL',
            unit_price: input.amount,
          },
        ],
        external_reference: input.contributionId,
        notification_url: this.notificationUrl,
        // Card only — PIX already has its own in-app flow, no need to
        // duplicate it on Mercado Pago's hosted page.
        payment_methods: {
          excluded_payment_types: [
            { id: 'ticket' },
            { id: 'bank_transfer' },
            { id: 'atm' },
          ],
        },
        // No pending/in_process limbo: every payment resolves straight to
        // approved or rejected, which is all confirmCardPaymentUseCase handles.
        binary_mode: true,
        metadata: {
          gift_id: input.giftId,
          guest_name: input.guestName,
          message: input.message ?? null,
        },
      },
    })

    const checkoutUrl = result.init_point ?? result.sandbox_init_point
    if (!checkoutUrl) {
      throw new Error('Mercado Pago não retornou uma URL de pagamento.')
    }

    return { checkoutUrl }
  }

  async getPayment(paymentId: string): Promise<CardPayment> {
    const result = await new Payment(this.client).get({ id: paymentId })

    const metadata = (result.metadata ?? {}) as Record<string, unknown>
    const str = (v: unknown): string | null =>
      typeof v === 'string' ? v : null

    return {
      id: String(result.id ?? paymentId),
      status: result.status ?? 'unknown',
      transactionAmount: result.transaction_amount ?? 0,
      externalReference: result.external_reference ?? null,
      giftId: str(metadata.gift_id),
      guestName: str(metadata.guest_name),
      message: str(metadata.message),
    }
  }

  verifyWebhookSignature(input: {
    signature: string | null
    requestId: string | null
    dataId: string | null
  }): void {
    WebhookSignatureValidator.validate({
      xSignature: input.signature,
      xRequestId: input.requestId,
      dataId: input.dataId,
      secret: this.webhookSecret,
    })
  }
}
