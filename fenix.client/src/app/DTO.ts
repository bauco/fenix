export interface IApiResponse<T>{
    success?: boolean;
    errors?: ErrorMessage[];
    hash?: string;
    data?: T;
    serverTime?: Date;
}
export interface IErrorMessage {
    code?: number;
    message?: string | undefined;
    description?: string | undefined;
    error?: APIErrors;
}
export enum APIErrors {
    Exeption = "Exeption",
    APIConnectionFailed = "APIConnectionFailed",
    ProxyConnectionFailed = "ProxyConnectionFailed",
    UserManagementError = "UserManagementError",
    InvalidLogin = "InvalidLogin",
    EntryAlreadyExists = "EntryAlreadyExists",
    InvalidArguments = "InvalidArguments",
}
export class ErrorMessage implements IErrorMessage {
    readonly code?: number;
    readonly message?: string | undefined;
    description?: string | undefined;
    error?: APIErrors;
  
    constructor(data?: IErrorMessage) {
        if (data) {
            for (var property in data) {
                if (data.hasOwnProperty(property))
                    (<any>this)[property] = (<any>data)[property];
            }
        }
    }
    init(_data?: any) {
        if (_data) {
            (<any>this).code = _data["code"];
            (<any>this).message = _data["message"];
            this.description = _data["description"];
            this.error = _data["error"];
        }
    }
  
    static fromJS(data: any): ErrorMessage {
        data = typeof data === 'object' ? data : {};
        let result = new ErrorMessage();
        result.init(data);
        return result;
    }
  
    toJSON(data?: any) {
        data = typeof data === 'object' ? data : {};
        data["code"] = this.code;
        data["message"] = this.message;
        data["description"] = this.description;
        data["error"] = this.error;
        return data;
    }
    toString(data?: any) {
        return data["code"] + "." + data["message"] + "." + data["description"] + "." + data["error"];
    }
}  
export interface ILogInRequest {
    email?: string | undefined;
    password?: string | undefined;
    version?: string | undefined;
}
export interface ILogInResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiry: Date;

}

export interface IRepository {
  id: number;
  full_name: string;
  owner: IOwner;
}
export interface IOwner {
  avatar_url: string;
}
export interface IBookmark {
  userId: number;
  gitHubResponseRepositoryId: number;
 }
