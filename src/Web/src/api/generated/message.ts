// Generated from the service OpenAPI document. Do not edit.
export interface paths {
    "/api/v1/chat/rooms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 列出我的聊天室、未讀及在線狀態 */
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
                        "application/json": components["schemas"]["RoomView"][];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
        /** 建立群組聊天室 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["RoomRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RoomView"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/direct": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 取得或建立一對一聊天室 */
        post: {
            parameters: {
                query?: never;
                header?: never;
                path?: never;
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["DirectRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["RoomView"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/rooms/{id}/messages": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 分頁讀取歷史訊息或重連補齊 */
        get: {
            parameters: {
                query?: {
                    before?: number | string;
                    after?: number | string;
                    limit?: number | string;
                    reason?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
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
                        "application/json": components["schemas"]["PageOfMessageView"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
        /** 傳送訊息，clientMessageId 提供冪等保護 */
        post: {
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
                    "application/json": components["schemas"]["SendRequest"];
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["MessageView"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/rooms/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 更新已讀位置 */
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
                    "application/json": components["schemas"]["ReadRequest"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/rooms/{id}/members": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 新增成員或修改成員角色 */
        put: {
            parameters: {
                query?: {
                    reason?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody: {
                content: {
                    "application/json": components["schemas"]["MemberRequest"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/rooms/{id}/members/{userId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 移除成員或退出群組 */
        delete: {
            parameters: {
                query?: {
                    reason?: string;
                };
                header?: never;
                path: {
                    id: string;
                    userId: string;
                };
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/rooms/{id}/owner": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        /** 移轉群組擁有權 */
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
                    "application/json": components["schemas"]["TransferRequest"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/rooms/{id}/attachments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** 上傳附件，每檔最多 20 MiB */
        post: {
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
                    "multipart/form-data": {
                        file: components["schemas"]["IFormFile"];
                    };
                };
            };
            responses: {
                /** @description OK */
                200: {
                    headers: {
                        [name: string]: unknown;
                    };
                    content: {
                        "application/json": components["schemas"]["AttachmentView"];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/attachments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 驗證權限後下載附件 */
        get: {
            parameters: {
                query?: {
                    reason?: string;
                };
                header?: never;
                path: {
                    id: string;
                };
                cookie?: never;
            };
            requestBody?: never;
            responses: {
                /** @description OK */
                200: {
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/admin/rooms": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 管理員列出聊天室 */
        get: {
            parameters: {
                query: {
                    reason: string;
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
                        "application/json": components["schemas"]["RoomView"][];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/admin/rooms/{id}/messages/{messageId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** 管理員移除訊息 */
        delete: {
            parameters: {
                query: {
                    reason: string;
                };
                header?: never;
                path: {
                    id: string;
                    messageId: string;
                };
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/v1/chat/admin/attachments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 管理員檢視附件 */
        get: {
            parameters: {
                query: {
                    reason: string;
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
                        "application/json": components["schemas"]["AttachmentView"][];
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
    "/api/v1/chat/admin/audit": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** 查詢聊天管理稽核紀錄 */
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
                         *       "source": "Message"
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
        AttachmentView: {
            /** Format: uuid */
            id: string;
            fileName: string;
            contentType: string;
            /** Format: int64 */
            size: number | string;
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
        DirectRequest: {
            /** Format: uuid */
            userId: string;
        };
        /** Format: binary */
        IFormFile: string;
        MemberRequest: {
            /** Format: uuid */
            userId: string;
            role: string;
        };
        MemberView: {
            /** Format: uuid */
            userId: string;
            displayName: string;
            role: string;
            /** Format: int64 */
            lastReadSequence: number | string;
            online: boolean;
        };
        MessageView: {
            /** Format: uuid */
            id: string;
            /** Format: uuid */
            clientMessageId: string;
            /** Format: uuid */
            senderId: string;
            senderName: string;
            /** Format: int64 */
            sequence: number | string;
            text: string;
            deleted: boolean;
            /** Format: date-time */
            createdAt: string;
            attachments: components["schemas"]["AttachmentView"][];
        };
        PageOfMessageView: {
            items: components["schemas"]["MessageView"][];
            nextCursor: null | string;
        };
        ReadRequest: {
            /** Format: int64 */
            sequence: number | string;
        };
        RoomRequest: {
            name: string;
            members: string[];
        };
        RoomView: {
            /** Format: uuid */
            id: string;
            name: string;
            kind: string;
            /** Format: int64 */
            lastSequence: number | string;
            /** Format: int64 */
            unreadCount: number | string;
            members: components["schemas"]["MemberView"][];
        };
        SendRequest: {
            /** Format: uuid */
            clientMessageId: string;
            text: null | string;
            attachmentIds: string[];
        };
        TransferRequest: {
            /** Format: uuid */
            userId: string;
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
