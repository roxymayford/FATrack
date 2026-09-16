declare module 'midtrans-client' {
  export interface SnapTransactionParameters {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      last_name?: string;
      email?: string;
      phone?: string;
    };
    item_details?: Array<{
      id: string;
      price: number;
      quantity: number;
      name: string;
    }>;
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
    [key: string]: any;
  }

  export interface SnapTransactionResponse {
    token: string;
    redirect_url: string;
  }

  export class Snap {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });

    createTransaction(parameter: SnapTransactionParameters): Promise<SnapTransactionResponse>;
    createTransactionToken(parameter: SnapTransactionParameters): Promise<string>;
    createTransactionRedirectUrl(parameter: SnapTransactionParameters): Promise<string>;
    transaction: {
      notification(notificationJson: any): Promise<any>;
      status(orderId: string): Promise<any>;
    };
  }

  export class CoreApi {
    constructor(options: {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    });
    transaction: {
      notification(notificationJson: any): Promise<any>;
      status(orderId: string): Promise<any>;
    };
  }
}
