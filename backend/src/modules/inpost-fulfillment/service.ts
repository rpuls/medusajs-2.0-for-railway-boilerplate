import { MedusaService } from "@medusajs/framework/utils";
import { Logger } from "@medusajs/framework/types";
import { MedusaError } from "@medusajs/framework/utils";

type InjectedDependencies = {
  logger: Logger;
};

interface InPostServiceConfig {
  apiKey: string;
  organizationId: string;
  environment: "sandbox" | "production";
}

export interface InPostFulfillmentProviderOptions {
  api_key: string;
  organization_id: string;
  environment: "sandbox" | "production";
}

export interface InPostPoint {
  name: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    post_code: string;
    country_code: string;
  };
  location: {
    latitude: number;
    longitude: number;
  };
  type: string[];
  status: string;
  location_description: string;
  opening_hours: string;
  payment_available: boolean;
  payment_point_descr: string;
  partner_id: number;
  is_next: boolean;
  double_sided: boolean;
  image_url: string;
  location_date: string;
  functions: string[];
  partner: string;
  location_description_24: string;
  recommended: boolean;
  easy_access_zone: boolean;
  a2p: boolean;
  virtual: string;
  air_index_level: number;
}

export interface InPostParcel {
  template: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: {
    amount: number;
    unit: "g" | "kg";
  };
  receiver: {
    email: string;
    phone: string;
    name: string;
  };
  custom_attributes: {
    target_point: string;
    sending_method: string;
    service: string;
  };
}

export interface InPostShipmentStatus {
  status: string;
  datetime: string;
  name: string;
  description: string;
}

/**
 * InPost fulfillment provider service
 */
class InPostFulfillmentProviderService extends MedusaService({}) {
  static identifier = "inpost-fulfillment";

  protected readonly config_: InPostServiceConfig;
  protected readonly logger_: Logger;
  protected readonly apiBaseUrl: string;

  constructor(
    { logger }: InjectedDependencies,
    options: InPostFulfillmentProviderOptions
  ) {
    super(...arguments);

    this.logger_ = logger;
    this.config_ = {
      apiKey: options.api_key,
      organizationId: options.organization_id,
      environment: options.environment,
    };

    this.apiBaseUrl =
      this.config_.environment === "sandbox"
        ? "https://api-shipx-pl.easypack24.net"
        : "https://api-shipx-pl.easypack24.net";

    this.logger_.info(
      `InPost fulfillment provider initialized for ${this.config_.environment}`
    );
  }

  static validateOptions(options: Record<string, any>) {
    const requiredFields = ["api_key", "organization_id", "environment"];

    requiredFields.forEach((field) => {
      if (!options[field]) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `${field} is required in InPost fulfillment provider options`
        );
      }
    });

    if (!["sandbox", "production"].includes(options.environment)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'environment must be either "sandbox" or "production"'
      );
    }
  }

  // Core fulfillment methods that will be called by Medusa
  async getFulfillmentOptions() {
    return [
      {
        id: "inpost-locker",
        name: "InPost Locker",
        type: "shipping",
        description: "Delivery to InPost locker",
      },
      {
        id: "inpost-courier",
        name: "InPost Courier",
        type: "shipping",
        description: "InPost courier delivery",
      },
    ];
  }

  async validateFulfillmentData(optionData: any, data: any, cart: any) {
    if (optionData.id === "inpost-locker") {
      if (!data.locker_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Locker ID is required for InPost locker delivery"
        );
      }
    }
    return data;
  }

  async validateOption(data: any) {
    return true;
  }

  async canCalculate(data: any) {
    return true;
  }

  async calculatePrice(optionData: any, data: any, cart: any) {
    // Return prices in cents
    switch (optionData.id) {
      case "inpost-locker":
        return 999; // 9.99 EUR
      case "inpost-courier":
        return 1999; // 19.99 EUR
      default:
        return 0;
    }
  }

  async createFulfillment(
    data: any,
    items: any[],
    order: any,
    fulfillment: any
  ) {
    try {
      const shipmentData = this.prepareShipmentData(data, items, order);
      const shipment = await this.createInPostShipment(shipmentData);

      this.logger_.info(`InPost shipment created: ${shipment.id}`);

      return {
        shipment_id: shipment.id,
        tracking_number: shipment.tracking_number,
        status: shipment.status,
        data: shipment,
      };
    } catch (error) {
      this.logger_.error(
        `Failed to create InPost fulfillment: ${error.message}`
      );
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to create InPost fulfillment: ${error.message}`
      );
    }
  }

  async cancelFulfillment(fulfillment: any) {
    try {
      if (!fulfillment.shipment_id) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "No shipment ID found for cancellation"
        );
      }

      await this.cancelInPostShipment(fulfillment.shipment_id);
      this.logger_.info(
        `InPost shipment cancelled: ${fulfillment.shipment_id}`
      );

      return {
        ...fulfillment,
        status: "cancelled",
      };
    } catch (error) {
      this.logger_.error(
        `Failed to cancel InPost fulfillment: ${error.message}`
      );
      throw new MedusaError(
        MedusaError.Types.UNEXPECTED_STATE,
        `Failed to cancel InPost fulfillment: ${error.message}`
      );
    }
  }

  async createReturn(returnData: any) {
    return {};
  }

  async cancelReturn(returnData: any) {
    return returnData;
  }

  async getFulfillmentDocuments(data: any) {
    return {};
  }

  async getReturnDocuments(data: any) {
    return {};
  }

  async getShipmentDocuments(data: any) {
    return {};
  }

  async retrieveDocuments(fulfillmentData: any, documentType: string) {
    return {};
  }

  // InPost API methods
  private async createInPostShipment(data: InPostParcel): Promise<any> {
    const response = await fetch(
      `${this.apiBaseUrl}/v1/organizations/${this.config_.organizationId}/shipments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config_.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(
        `InPost API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  }

  private async cancelInPostShipment(shipmentId: string): Promise<void> {
    const response = await fetch(
      `${this.apiBaseUrl}/v1/organizations/${this.config_.organizationId}/shipments/${shipmentId}/cancel`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config_.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `InPost API error: ${response.status} ${response.statusText}`
      );
    }
  }

  private prepareShipmentData(
    data: any,
    items: any[],
    order: any
  ): InPostParcel {
    const shippingAddress = order.shipping_address;
    const customerEmail = order.email;

    return {
      template: "small",
      dimensions: {
        length: 100,
        width: 100,
        height: 100,
      },
      weight: {
        amount: 500,
        unit: "g",
      },
      receiver: {
        email: customerEmail,
        phone: shippingAddress?.phone || "",
        name: `${shippingAddress?.first_name} ${shippingAddress?.last_name}`,
      },
      custom_attributes: {
        target_point: data.locker_id || "",
        sending_method: "parcel_locker",
        service: "inpost_locker_standard",
      },
    };
  }

  // Public methods for API endpoints
  async getLockers(params: {
    latitude?: number;
    longitude?: number;
    city?: string;
    postcode?: string;
    country_code?: string;
    radius?: number;
    limit?: number;
  }): Promise<InPostPoint[]> {
    const queryParams = new URLSearchParams();

    if (params.latitude && params.longitude) {
      queryParams.append("latitude", params.latitude.toString());
      queryParams.append("longitude", params.longitude.toString());
    }

    if (params.city) queryParams.append("city", params.city);
    if (params.postcode) queryParams.append("postcode", params.postcode);
    if (params.country_code)
      queryParams.append("country_code", params.country_code);
    if (params.radius) queryParams.append("radius", params.radius.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${this.apiBaseUrl}/v1/points?${queryParams}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config_.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `InPost API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.items || [];
  }

  async getShipmentStatus(shipmentId: string): Promise<InPostShipmentStatus[]> {
    const response = await fetch(
      `${this.apiBaseUrl}/v1/organizations/${this.config_.organizationId}/shipments/${shipmentId}/tracking`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.config_.apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `InPost API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.tracking_events || [];
  }
}

export default InPostFulfillmentProviderService;
