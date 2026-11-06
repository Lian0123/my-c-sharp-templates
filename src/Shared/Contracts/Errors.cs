namespace MicroserviceStarter.Contracts;

public sealed record ErrorDefinition(string Code, int Status, string Title);

/// <summary>所有公開 API 的錯誤格式；errorCode 為 HTTP 狀態碼加四位錯誤編號。</summary>
public sealed record ApiProblem(string Type, string Title, int Status, string Detail, string Instance,
    string ErrorCode, string TraceId, string Source, IDictionary<string, string[]>? Errors);

public static class Errors
{
    public static readonly ErrorDefinition Validation = new("4000001", 400, "輸入資料不正確");
    public static readonly ErrorDefinition Unauthenticated = new("4010001", 401, "請重新登入");
    public static readonly ErrorDefinition Forbidden = new("4030001", 403, "沒有執行此操作的權限");
    public static readonly ErrorDefinition NotFound = new("4040001", 404, "找不到資源");
    public static readonly ErrorDefinition MethodNotAllowed = new("4050001", 405, "不支援此 HTTP 方法");
    public static readonly ErrorDefinition Conflict = new("4090001", 409, "資料已變更或發生衝突");
    public static readonly ErrorDefinition TooLarge = new("4130001", 413, "檔案超過大小限制");
    public static readonly ErrorDefinition Unsupported = new("4150001", 415, "不支援此檔案或媒體格式");
    public static readonly ErrorDefinition RateLimited = new("4290001", 429, "操作過於頻繁，請稍後重試");
    public static readonly ErrorDefinition Unexpected = new("5000001", 500, "系統發生未預期錯誤");
    public static readonly ErrorDefinition Unavailable = new("5030001", 503, "相依服務暫時無法使用");
    public static readonly ErrorDefinition Credentials = new("4011001", 401, "帳號或密碼不正確");
    public static readonly ErrorDefinition EmailUnverified = new("4031001", 403, "請先驗證 Email");
    public static readonly ErrorDefinition EmailInUse = new("4091001", 409, "此 Email 已註冊");
    public static readonly ErrorDefinition InvalidToken = new("4001001", 400, "驗證連結無效或已過期");
    public static readonly ErrorDefinition LastAdmin = new("4091002", 409, "至少必須保留一位有效管理員");
    public static readonly ErrorDefinition AccountMissing = new("4042001", 404, "找不到會員資料");
    public static readonly ErrorDefinition RoomMissing = new("4043001", 404, "找不到聊天室");
    public static readonly ErrorDefinition InvalidRead = new("4003001", 400, "已讀位置超出訊息範圍");
    public static readonly ErrorDefinition AttachmentUnavailable = new("4093001", 409, "附件無法使用或已綁定其他訊息");
    public static readonly ErrorDefinition LastOwner = new("4093002", 409, "請先移轉群組擁有權");
    public static readonly ErrorDefinition Upstream = new("5024001", 502, "上游服務連線失敗");
    public static readonly ErrorDefinition Timeout = new("5044001", 504, "上游服務回應逾時");

    public static IReadOnlyList<ErrorDefinition> All => typeof(Errors).GetFields()
        .Where(f => f.FieldType == typeof(ErrorDefinition)).Select(f => (ErrorDefinition)f.GetValue(null)!).ToArray();

    public static ErrorDefinition ForStatus(int status) => All.FirstOrDefault(e => e.Status == status)
        ?? new(status + "0001", status, "要求未完成");
}

public sealed class AppException(ErrorDefinition error, string? detail = null,
    IDictionary<string, string[]>? fields = null) : Exception(detail ?? error.Title)
{
    public ErrorDefinition Error { get; } = error;
    public IDictionary<string, string[]>? Fields { get; } = fields;
}

public static class Guard
{
    public static string Text(string? value, string field, int max, int min = 1)
    {
        var text = value?.Trim() ?? "";
        if (text.EnumerateRunes().Count() < min || text.EnumerateRunes().Count() > max || text.Contains('\0'))
            throw new AppException(Errors.Validation, fields: new Dictionary<string, string[]> { [field] = [$"長度需介於 {min} 至 {max} 個字元"] });
        return text;
    }

    public static int PageSize(int value)
    {
        if (value is < 1 or > 100) throw new AppException(Errors.Validation, "每頁筆數必須介於 1 至 100");
        return value;
    }

    public static string Reason(string? reason) => Text(reason, "reason", 1000, 5);
}
