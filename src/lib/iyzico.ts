import crypto from "crypto";

/**
 * iyzico Checkout Form (CF) entegrasyon yardımcıları.
 *
 * Bu modül `iyzipay` npm paketine ihtiyaç duymaz; iyzico HTTP API'sini saf fetch + HMAC ile
 * çağırır. Üretime almadan önce iyzico SANDBOX hesabı ile uçtan uca test edilmesi şarttır.
 *
 * Env değişkenleri:
 *   IYZICO_API_KEY         — iyzico panelinden API key
 *   IYZICO_SECRET_KEY      — iyzico panelinden Secret key
 *   IYZICO_BASE_URL        — `https://sandbox-api.iyzipay.com` (test) veya `https://api.iyzipay.com` (prod)
 *   PAYMENT_PROVIDER       — `iyzico` olarak ayarlandığında /api/checkout iyzico'ya yönlenir
 */

export type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
};

export function getIyzicoConfig(): IyzicoConfig | null {
  const apiKey = process.env.IYZICO_API_KEY?.trim();
  const secretKey = process.env.IYZICO_SECRET_KEY?.trim();
  const baseUrl = (process.env.IYZICO_BASE_URL?.trim() || "https://sandbox-api.iyzipay.com").replace(/\/$/, "");
  if (!apiKey || !secretKey) return null;
  return { apiKey, secretKey, baseUrl };
}

export function isIyzicoActive(): boolean {
  return process.env.PAYMENT_PROVIDER?.trim().toLowerCase() === "iyzico" && getIyzicoConfig() !== null;
}

/** Eski (PKI) auth — iyzico HTTP API'sinde Checkout Form için yeterli. */
function generateAuthHeader(config: IyzicoConfig, randomString: string, body: object): string {
  const pkiString = pkiStringify(body);
  const hashStr = config.apiKey + randomString + config.secretKey + pkiString;
  const hash = crypto.createHash("sha1").update(hashStr, "utf8").digest("base64");
  return `IYZWS ${config.apiKey}:${hash}`;
}

/** iyzico'nun PKI request stringifier'ı (resmi SDK ile birebir aynı format). */
function pkiStringify(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    const parts = value.map((v) => (typeof v === "object" ? `[${pkiStringify(v)}]` : String(v)));
    return `[${parts.join(", ")}]`;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const entries = Object.entries(obj).filter(([, v]) => v !== undefined && v !== null);
    return `[${entries.map(([k, v]) => `${k}=${typeof v === "object" ? pkiStringify(v) : String(v)}`).join(",")}]`;
  }
  return String(value);
}

export type IyzicoBuyer = {
  id: string;
  name: string;
  surname: string;
  email: string;
  identityNumber: string;
  registrationAddress: string;
  city: string;
  country: string;
  ip: string;
  gsmNumber?: string;
  zipCode?: string;
};

export type IyzicoAddress = {
  contactName: string;
  city: string;
  country: string;
  address: string;
  zipCode?: string;
};

export type IyzicoBasketItem = {
  id: string;
  name: string;
  category1: string;
  itemType: "PHYSICAL" | "VIRTUAL";
  /** İki ondalıklı, nokta ayraçlı string. Toplam = sum(items.price). */
  price: string;
};

export type CreateCheckoutFormInput = {
  conversationId: string;
  /** İki ondalıklı, nokta ayraçlı string. */
  price: string;
  paidPrice: string;
  currency: "TRY";
  basketId: string;
  callbackUrl: string;
  buyer: IyzicoBuyer;
  shippingAddress: IyzicoAddress;
  billingAddress: IyzicoAddress;
  basketItems: IyzicoBasketItem[];
};

export type CreateCheckoutFormResult =
  | {
      ok: true;
      token: string;
      paymentPageUrl: string;
      checkoutFormContent?: string;
    }
  | {
      ok: false;
      errorCode?: string;
      errorMessage: string;
    };

export async function createCheckoutFormToken(
  input: CreateCheckoutFormInput,
): Promise<CreateCheckoutFormResult> {
  const config = getIyzicoConfig();
  if (!config) {
    return { ok: false, errorMessage: "iyzico yapılandırılmadı (IYZICO_API_KEY/IYZICO_SECRET_KEY)." };
  }

  const body: Record<string, unknown> = {
    locale: "tr",
    conversationId: input.conversationId,
    price: input.price,
    paidPrice: input.paidPrice,
    currency: input.currency,
    basketId: input.basketId,
    paymentGroup: "PRODUCT",
    callbackUrl: input.callbackUrl,
    enabledInstallments: [2, 3, 6, 9],
    buyer: input.buyer,
    shippingAddress: input.shippingAddress,
    billingAddress: input.billingAddress,
    basketItems: input.basketItems,
  };

  const randomString = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const authorization = generateAuthHeader(config, randomString, body);

  try {
    const res = await fetch(`${config.baseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-iyzi-rnd": randomString,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as
      | {
          status?: string;
          token?: string;
          paymentPageUrl?: string;
          checkoutFormContent?: string;
          errorCode?: string;
          errorMessage?: string;
        }
      | null;

    if (!json) {
      return { ok: false, errorMessage: "iyzico yanıtı çözümlenemedi." };
    }
    if (json.status !== "success" || !json.token || !json.paymentPageUrl) {
      return {
        ok: false,
        errorCode: json.errorCode,
        errorMessage: json.errorMessage ?? "iyzico checkout formu oluşturulamadı.",
      };
    }
    return {
      ok: true,
      token: json.token,
      paymentPageUrl: json.paymentPageUrl,
      checkoutFormContent: json.checkoutFormContent,
    };
  } catch (err) {
    return { ok: false, errorMessage: (err as Error).message };
  }
}

export type RetrieveCheckoutFormResult =
  | {
      ok: true;
      paymentStatus: "SUCCESS" | "FAILURE" | string;
      paid: boolean;
      paymentId?: string;
      conversationId?: string;
      basketId?: string;
      price?: string;
      paidPrice?: string;
    }
  | {
      ok: false;
      errorCode?: string;
      errorMessage: string;
    };

/** Callback geldiğinde token ile sorgulayıp ödeme statüsünü doğrular. */
export async function retrieveCheckoutForm(token: string): Promise<RetrieveCheckoutFormResult> {
  const config = getIyzicoConfig();
  if (!config) {
    return { ok: false, errorMessage: "iyzico yapılandırılmadı." };
  }

  const body = { locale: "tr", token };
  const randomString = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
  const authorization = generateAuthHeader(config, randomString, body);

  try {
    const res = await fetch(`${config.baseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "x-iyzi-rnd": randomString,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => null)) as
      | {
          status?: string;
          paymentStatus?: string;
          paymentId?: string;
          conversationId?: string;
          basketId?: string;
          price?: string;
          paidPrice?: string;
          errorCode?: string;
          errorMessage?: string;
        }
      | null;

    if (!json || json.status !== "success") {
      return {
        ok: false,
        errorCode: json?.errorCode,
        errorMessage: json?.errorMessage ?? "iyzico ödeme detayı alınamadı.",
      };
    }
    return {
      ok: true,
      paymentStatus: json.paymentStatus ?? "UNKNOWN",
      paid: json.paymentStatus === "SUCCESS",
      paymentId: json.paymentId,
      conversationId: json.conversationId,
      basketId: json.basketId,
      price: json.price,
      paidPrice: json.paidPrice,
    };
  } catch (err) {
    return { ok: false, errorMessage: (err as Error).message };
  }
}
