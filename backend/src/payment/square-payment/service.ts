import { Client } from "square";
import {
  IPaymentModuleService,
  PaymentSessionDTO,
  PaymentDTO,
  CreatePaymentSessionDTO,
  UpdatePaymentSessionDTO,
  CreateCaptureDTO,
  CreateRefundDTO,
  Context,
  PaymentCollectionDTO,
  PaymentCollectionStatus,
  PaymentSessionStatus
} from "@medusajs/types";
import { Logger } from "@medusajs/types";

interface SquareOptions {
  isProduction: boolean;
  squareApiKey: string;
  locationId: string;
  applicationId: string;
}

class SquarePaymentService implements IPaymentModuleService {
  static identifier = "square";
  protected squareClient: Client;
  protected logger_: Logger;
  protected options_: SquareOptions;

  constructor(container: any, options: SquareOptions) {
    this.options_ = options;
    this.logger_ = container.logger;

    this.squareClient = new Client({
      environment: options.isProduction ? "production" : "sandbox",
      accessToken: options.squareApiKey,
    });
  }

  async createPaymentCollection(data: CreatePaymentCollectionDTO, sharedContext?: Context): Promise<PaymentCollectionDTO> {
    this.logger_.info("Creating Square payment collection");
    return {
      id: `sq_collection_${Date.now()}`,
      region_id: data.region_id,
      currency_code: data.currency_code,
      amount: data.amount,
      status: PaymentCollectionStatus.NOT_PAID,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      payment_sessions: [],
      payments: [],
      metadata: {},
      data: {
        application_id: this.options_.applicationId,
        location_id: this.options_.locationId
      }
    };
  }

  async createPaymentSession(paymentCollectionId: string, data: CreatePaymentSessionDTO, sharedContext?: Context): Promise<PaymentSessionDTO> {
    this.logger_.info(`Creating Square payment session for payment collection: ${paymentCollectionId}`);

    const now = new Date().toISOString();
    return {
      id: `sq_session_${Date.now()}`,
      payment_collection_id: paymentCollectionId,
      amount: data.amount,
      currency_code: data.currency_code,
      provider_id: "square",
      status: PaymentSessionStatus.PENDING,
      created_at: now,
      updated_at: now,
      data: {
        application_id: this.options_.applicationId,
        location_id: this.options_.locationId,
        client_secret: `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    };
  }

  async updatePaymentSession(data: UpdatePaymentSessionDTO, sharedContext?: Context): Promise<PaymentSessionDTO> {
    this.logger_.info(`Updating Square payment session: ${data.id}`);

    const now = new Date().toISOString();
    return {
      ...data,
      status: PaymentSessionStatus.PENDING,
      updated_at: now,
      data: {
        ...data.data,
        updated_at: now
      }
    };
  }

  async authorizePaymentSession(id: string, context: Record<string, unknown>, sharedContext?: Context): Promise<PaymentDTO> {
    this.logger_.info(`Authorizing Square payment session: ${id}`);

    try {
      if (context.source_id) {
        const response = await this.squareClient.payments.createPayment({
          sourceId: context.source_id as string,
          amountMoney: {
            amount: BigInt(this.toMinorUnit(context.amount as number)),
            currency: context.currency_code as string
          },
          locationId: this.options_.locationId,
          idempotencyKey: `${context.source_id}_${Date.now()}`
        });

        const now = new Date().toISOString();
        return {
          id: response.result.payment.id,
          amount: this.fromMinorUnit(Number(response.result.payment.amountMoney.amount)),
          currency_code: response.result.payment.amountMoney.currency,
          provider_id: "square",
          status: "authorized",
          data: {
            payment_id: response.result.payment.id,
            authorized_at: now,
            card_last4: response.result.payment.cardDetails?.last4
          },
          created_at: now,
          updated_at: now
        };
      }

      throw new Error("No source_id provided for payment authorization");
    } catch (error) {
      this.logger_.error(`Error authorizing Square payment: ${error.message}`);
      throw error;
    }
  }

  async capturePayment(data: CreateCaptureDTO, sharedContext?: Context): Promise<PaymentDTO> {
    this.logger_.info(`Capturing Square payment: ${data.payment_id}`);

    try {
      const response = await this.squareClient.payments.completePayment({
        paymentId: data.payment_id
      });

      const now = new Date().toISOString();
      return {
        id: response.result.payment.id,
        amount: this.fromMinorUnit(Number(response.result.payment.amountMoney.amount)),
        currency_code: response.result.payment.amountMoney.currency,
        provider_id: "square",
        status: "captured",
        data: {
          captured_at: now,
          card_last4: response.result.payment.cardDetails?.last4
        },
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      this.logger_.error(`Error capturing Square payment: ${error.message}`);
      throw error;
    }
  }

  async refundPayment(data: CreateRefundDTO, sharedContext?: Context): Promise<PaymentDTO> {
    this.logger_.info(`Refunding Square payment: ${data.payment_id}`);

    try {
      const response = await this.squareClient.refunds.refundPayment({
        paymentId: data.payment_id,
        amountMoney: {
          amount: BigInt(this.toMinorUnit(Number(data.amount))),
          currency: "USD" // Default to USD since currency is not in CreateRefundDTO
        },
        idempotencyKey: `refund_${data.payment_id}_${Date.now()}`
      });

      const now = new Date().toISOString();
      return {
        id: response.result.refund.id,
        amount: data.amount,
        currency_code: "USD", // Default to USD since currency is not in CreateRefundDTO
        provider_id: "square",
        status: "refunded",
        data: {
          refunded_at: response.result.refund.createdAt
        },
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      this.logger_.error(`Error refunding Square payment: ${error.message}`);
      throw error;
    }
  }

  async cancelPayment(paymentId: string, sharedContext?: Context): Promise<PaymentDTO> {
    this.logger_.info(`Canceling Square payment: ${paymentId}`);

    try {
      const response = await this.squareClient.payments.cancelPayment({
        paymentId
      });

      const now = new Date().toISOString();
      return {
        id: response.result.payment.id,
        amount: this.fromMinorUnit(Number(response.result.payment.amountMoney.amount)),
        currency_code: response.result.payment.amountMoney.currency,
        provider_id: "square",
        status: "canceled",
        data: {
          canceled_at: now
        },
        created_at: now,
        updated_at: now
      };
    } catch (error) {
      this.logger_.error(`Error canceling Square payment: ${error.message}`);
      throw error;
    }
  }

  async getPaymentSessionData(sessionData: PaymentSessionDTO): Promise<PaymentSessionDTO> {
    return sessionData;
  }

  async deletePaymentSession(id: string, sharedContext?: Context): Promise<void> {
    this.logger_.info(`Deleting Square payment session: ${id}`);
    // Square doesn't require explicit session deletion
  }

  private toMinorUnit(amount: number): number {
    return Math.round(amount * 100);
  }

  private fromMinorUnit(amount: number): number {
    return amount / 100;
  }
}

export default SquarePaymentService;
