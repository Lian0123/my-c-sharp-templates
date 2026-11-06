// Generated from the service OpenAPI document. Do not edit.
export interface paths {
    "/api/v1/auth/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 註冊並寄送驗證信 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RegisterRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 登入並建立 Session */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["LoginRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LoginResult"];
                    };
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 輪替 Refresh Token */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["LoginResult"];
                    };
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 登出並撤銷登入 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 驗證 Email */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["TokenRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/resend-verification": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 重寄驗證信 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EmailRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/forgot-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 寄送密碼重設信 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["EmailRequest"];
                };
            };
            responses: {
                /** @description Accepted */
                202: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/reset": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 重設密碼並撤銷所有登入 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ResetRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/me": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 查詢目前登入狀態 */
        get: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["Actor"];
                    };
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/admin/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 管理員列出帳號 */
        get: {
            parameters: {
                query?: {
                    limit?: number | string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["UserView"][];
                    };
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/admin/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 變更角色或停用帳號 */
        put: {
            parameters: {
                query?: never;
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["ManageUserRequest"];
                };
            };
            responses: {
                /** @description No Content */
                204: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content?: never;
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/auth/admin/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 查詢驗證服務稽核紀錄 */
        get: {
            parameters: {
                query?: {
                    limit?: number | string;
                };
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AuditView"][];
                    };
                };
                /** @description 4000001 輸入資料不正確；4001001 驗證連結無效或已過期；4003001 已讀位置超出訊息範圍 */
                400: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "輸入資料不正確",
                         *       "status": 400,
                         *       "detail": "輸入資料不正確",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4010001 請重新登入；4011001 帳號或密碼不正確 */
                401: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "請重新登入",
                         *       "status": 401,
                         *       "detail": "請重新登入",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4010001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4030001 沒有執行此操作的權限；4031001 請先驗證 Email */
                403: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "沒有執行此操作的權限",
                         *       "status": 403,
                         *       "detail": "沒有執行此操作的權限",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4040001 找不到資源；4042001 找不到會員資料；4043001 找不到聊天室 */
                404: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "找不到資源",
                         *       "status": 404,
                         *       "detail": "找不到資源",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4040001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4050001 不支援此 HTTP 方法 */
                405: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此 HTTP 方法",
                         *       "status": 405,
                         *       "detail": "不支援此 HTTP 方法",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4050001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4090001 資料已變更或發生衝突；4091001 此 Email 已註冊；4091002 至少必須保留一位有效管理員；4093001 附件無法使用或已綁定其他訊息；4093002 請先移轉群組擁有權 */
                409: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "資料已變更或發生衝突",
                         *       "status": 409,
                         *       "detail": "資料已變更或發生衝突",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4090001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4130001 檔案超過大小限制 */
                413: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "檔案超過大小限制",
                         *       "status": 413,
                         *       "detail": "檔案超過大小限制",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4130001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4150001 不支援此檔案或媒體格式 */
                415: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "不支援此檔案或媒體格式",
                         *       "status": 415,
                         *       "detail": "不支援此檔案或媒體格式",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4150001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 4290001 操作過於頻繁，請稍後重試 */
                429: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "操作過於頻繁，請稍後重試",
                         *       "status": 429,
                         *       "detail": "操作過於頻繁，請稍後重試",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "4290001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5000001 系統發生未預期錯誤 */
                500: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "系統發生未預期錯誤",
                         *       "status": 500,
                         *       "detail": "系統發生未預期錯誤",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5000001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5024001 上游服務連線失敗 */
                502: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務連線失敗",
                         *       "status": 502,
                         *       "detail": "上游服務連線失敗",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5024001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5030001 相依服務暫時無法使用 */
                503: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "相依服務暫時無法使用",
                         *       "status": 503,
                         *       "detail": "相依服務暫時無法使用",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5030001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
                /** @description 5044001 上游服務回應逾時 */
                504: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        /**
                         * @example {
                         *       "type": "about:blank",
                         *       "title": "上游服務回應逾時",
                         *       "status": 504,
                         *       "detail": "上游服務回應逾時",
                         *       "instance": "/api/v1/example",
                         *       "errorCode": "5044001",
                         *       "traceId": "0123456789abcdef0123456789abcdef",
                         *       "source": "Auth"
                         *     }
                         */
                        "application/problem+json": {
                            type: string;
                            title: string;
                            /** Format: int32 */
                            status: number | string;
                            detail: string;
                            instance: string;
                            errorCode: string;
                            traceId: string;
                            source: string;
                            errors?: null | {
                                [key: string]: string[];
                            };
                        };
                    };
                };
            };
        };
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        Actor: {
            /** Format: uuid */
            userId: string;
            /** Format: uuid */
            sessionId: string;
            /** Format: int64 */
            securityVersion: number | string;
            role: string;
            isAdmin: boolean;
        };
        AuditView: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            actorId: string;
            action: string;
            target: string;
            reason: string;
            /** Format: date-time */
            createdAt: string;
        };
        EmailRequest: {
            email: string;
        };
        LoginRequest: {
            email: string;
            password: string;
        };
        LoginResult: {
            accessToken: string;
            /** Format: int32 */
            expiresIn: number | string;
            csrfToken: string;
            user: components["schemas"]["UserView"];
        };
        ManageUserRequest: {
            role: string;
            active: boolean;
            reason: string;
        };
        ProblemDetails: {
            type?: null | string;
            title?: null | string;
            /** Format: int32 */
            status?: null | number | string;
            detail?: null | string;
            instance?: null | string;
        };
        RegisterRequest: {
            email: string;
            password: string;
            displayName: string;
        };
        ResetRequest: {
            token: string;
            password: string;
        };
        TokenRequest: {
            token: string;
        };
        UserView: {
            /** Format: uuid */
            id: string;
            email: string;
            displayName: string;
            role: string;
            active: boolean;
            emailVerified: boolean;
            /** Format: date-time */
            createdAt: string;
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export type operations = Record<string, never>;
