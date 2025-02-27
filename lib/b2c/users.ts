import { BaseResponse, fetchConfig, request } from "../shared";

import {
  Attributes,
  CryptoWallet,
  Email,
  Name,
  PhoneNumber,
  User,
} from "./shared_b2c";

export type UserID = string;
export type UserMetadata = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface B2CUsersCreateRequest {
  email?: string;
  phone_number?: string;
  name?: Name;
  create_user_as_pending?: boolean;
  attributes?: Attributes;
  trusted_metadata?: UserMetadata;
  untrusted_metadata?: UserMetadata;
}

export interface B2CUsersCreateResponse extends BaseResponse {
  user_id: UserID;
  user: User;
  email_id: string;
  phone_id: string;
  status: string;
}

export type B2CUsersGetResponse = BaseResponse & User;

export enum UserSearchOperator {
  OR = "OR",
  AND = "AND",
}

export type UserSearchOperand =
  | {
      filter_name: "created_at_greater_than";
      // Timestamp in RFC 3339 Format
      filter_value: string;
    }
  | {
      filter_name: "created_at_less_than";
      // Timestamp in RFC 3339 Format
      filter_value: string;
    }
  | {
      filter_name: "created_at_between";
      filter_value: {
        // Timestamp in RFC 3339 Format
        greater_than: string;
        // Timestamp in RFC 3339 Format
        less_than: string;
      };
    }
  | {
      filter_name: "status";
      filter_value: "active" | "pending";
    }
  | {
      filter_name: "oauth_provider";
      filter_value: string[];
    }
  | {
      filter_name: "user_id";
      filter_value: string[];
    }
  | {
      filter_name: "full_name_fuzzy";
      filter_value: string;
    }
  | {
      filter_name: "phone_number";
      filter_value: string[];
    }
  | {
      filter_name: "phone_id";
      filter_value: string[];
    }
  | {
      filter_name: "phone_verified";
      filter_value: boolean;
    }
  | {
      filter_name: "phone_number_fuzzy";
      filter_value: string;
    }
  | {
      filter_name: "email_address";
      filter_value: string[];
    }
  | {
      filter_name: "email_id";
      filter_value: string[];
    }
  | {
      filter_name: "email_verified";
      filter_value: boolean;
    }
  | {
      filter_name: "email_address_fuzzy";
      filter_value: string;
    }
  | {
      filter_name: "webauthn_registration_verified";
      filter_value: boolean;
    }
  | {
      filter_name: "webauthn_registration_id";
      filter_value: string[];
    }
  | {
      filter_name: "crypto_wallet_id";
      filter_value: string[];
    }
  | {
      filter_name: "crypto_wallet_address";
      filter_value: string[];
    }
  | {
      filter_name: "crypto_wallet_verified";
      filter_value: boolean;
    }
  | {
      filter_name: "totp_id";
      filter_value: string[];
    }
  | {
      filter_name: "totp_verified";
      filter_value: boolean;
    }
  | {
      filter_name: "password_exists";
      filter_value: boolean;
    };

export interface B2CUsersSearchRequest {
  limit?: number;
  query?: {
    operator: UserSearchOperator;
    operands: UserSearchOperand[];
  };
  cursor?: string | null;
}

export interface B2CUsersSearchResponse extends BaseResponse {
  results: User[];
  results_metadata: {
    next_cursor: string | null;
    total: number;
  };
}

export interface B2CUsersUpdateRequest {
  name?: Name;
  trusted_metadata?: UserMetadata;
  untrusted_metadata?: UserMetadata;
  attributes?: Attributes;
}

export interface B2CUsersUpdateResponse extends BaseResponse {
  user_id: UserID;
  user: User;
  emails: Email[];
  phone_numbers: PhoneNumber[];
  crypto_wallets: CryptoWallet[];
}

export interface B2CUsersDeleteResponse extends BaseResponse {
  user_id: UserID;
}

export interface B2CUsersDeleteEmailResponse extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeletePhoneNumberResponse extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeleteWebAuthnRegistrationResponse
  extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeleteBiometricRegistrationResponse
  extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeleteTOTPResponse extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeleteCryptoWalletResponse extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeletePasswordResponse extends BaseResponse {
  user_id: UserID;
  user: User;
}

export interface B2CUsersDeleteOAuthUserRegistrationResponse
  extends BaseResponse {
  user_id: UserID;
  user: User;
}

enum mode {
  pending,
  inProgress,
  complete,
}

export class UserSearchIterator {
  private mode: mode;

  constructor(private client: Users, private data: B2CUsersSearchRequest) {
    this.mode = mode.pending;
  }

  async next(): Promise<User[]> {
    const res = await this.client.search(this.data);
    this.data = {
      ...this.data,
      cursor: res.results_metadata.next_cursor,
    };
    if (!this.data.cursor) {
      this.mode = mode.complete;
    } else {
      this.mode = mode.inProgress;
    }
    return res.results;
  }

  hasNext(): boolean {
    return this.mode !== mode.complete;
  }

  async *[Symbol.asyncIterator](): AsyncIterator<User[]> {
    while (this.hasNext()) {
      yield this.next();
    }
  }
}

export class Users {
  base_path = "users";
  private fetchConfig: fetchConfig;

  constructor(fetchConfig: fetchConfig) {
    this.fetchConfig = fetchConfig;
  }

  private endpoint(path: string): string {
    return `${this.base_path}/${path}`;
  }

  create(data: B2CUsersCreateRequest): Promise<B2CUsersCreateResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.base_path,
      data,
    });
  }

  get(userID: UserID): Promise<B2CUsersGetResponse> {
    return request(this.fetchConfig, {
      method: "GET",
      url: this.endpoint(userID),
    });
  }

  search(data: B2CUsersSearchRequest): Promise<B2CUsersSearchResponse> {
    return request(this.fetchConfig, {
      method: "POST",
      url: this.endpoint("search"),
      data,
    });
  }

  searchAll(data: B2CUsersSearchRequest): UserSearchIterator {
    return new UserSearchIterator(this, data);
  }

  update(
    userID: UserID,
    data: B2CUsersUpdateRequest
  ): Promise<B2CUsersUpdateResponse> {
    return request(this.fetchConfig, {
      method: "PUT",
      url: this.endpoint(userID),
      data,
    });
  }

  delete(userID: UserID): Promise<B2CUsersDeleteResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(userID),
    });
  }

  deleteEmail(emailID: string): Promise<B2CUsersDeleteEmailResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`emails/${emailID}`),
    });
  }

  deletePhoneNumber(
    phoneID: string
  ): Promise<B2CUsersDeletePhoneNumberResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`phone_numbers/${phoneID}`),
    });
  }

  deleteWebAuthnRegistration(
    webAuthnRegistrationID: string
  ): Promise<B2CUsersDeleteWebAuthnRegistrationResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`webauthn_registrations/${webAuthnRegistrationID}`),
    });
  }

  deleteBiometricRegistration(
    biometricRegistrationID: string
  ): Promise<B2CUsersDeleteBiometricRegistrationResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`biometric_registrations/${biometricRegistrationID}`),
    });
  }

  deleteTOTP(totpID: string): Promise<B2CUsersDeleteTOTPResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`totps/${totpID}`),
    });
  }

  deleteCryptoWallet(
    cryptoWalletID: string
  ): Promise<B2CUsersDeleteCryptoWalletResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`crypto_wallets/${cryptoWalletID}`),
    });
  }

  deletePassword(passwordID: string): Promise<B2CUsersDeletePasswordResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`passwords/${passwordID}`),
    });
  }

  deleteOAuthUserRegistration(
    oauthUserRegistrationID: string
  ): Promise<B2CUsersDeleteOAuthUserRegistrationResponse> {
    return request(this.fetchConfig, {
      method: "DELETE",
      url: this.endpoint(`oauth/${oauthUserRegistrationID}`),
    });
  }
}
