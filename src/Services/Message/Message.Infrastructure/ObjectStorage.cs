using System.Text;
using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Configuration;
using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Domain;
using SkiaSharp;

namespace MicroserviceStarter.Message.Infrastructure;

public interface IObjectStorage
{
    Task Put(string key, Stream stream, string type, CancellationToken ct);
    Task<Stream> Get(string key, CancellationToken ct);
    Task Delete(string key, CancellationToken ct);
}

public sealed class ObjectStorage(IAmazonS3 client, IConfiguration config) : IObjectStorage
{
    private string Bucket => config["S3:Bucket"] ?? "attachments";
    public async Task Put(string key, Stream stream, string type, CancellationToken ct)
    {
        try { await client.PutObjectAsync(new PutObjectRequest { BucketName = Bucket, Key = key, InputStream = stream, ContentType = type, AutoCloseStream = false }, ct); }
        catch (AmazonS3Exception) { throw new AppException(Errors.Unavailable, "附件儲存服務暫時無法使用"); }
    }
    public async Task<Stream> Get(string key, CancellationToken ct)
    {
        try { var response = await client.GetObjectAsync(Bucket, key, ct); return response.ResponseStream; }
        catch (AmazonS3Exception) { throw new AppException(Errors.Unavailable, "附件暫時無法下載"); }
    }
    public async Task Delete(string key, CancellationToken ct) { await client.DeleteObjectAsync(Bucket, key, ct); }
}

public static class AttachmentPolicy
{
    public static string Validate(string name, string declaredType, ReadOnlySpan<byte> bytes)
    {
        ChatRules.FileName(name);
        if (bytes.Length == 0) throw new AppException(Errors.Validation, "不可上傳空檔案");
        if (bytes.Length > ChatRules.MaxFileBytes) throw new AppException(Errors.TooLarge);
        var extension = Path.GetExtension(name).ToLowerInvariant();
        var type = extension switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            _ => throw new AppException(Errors.Unsupported)
        };
        if (declaredType.Split(';')[0].Trim().ToLowerInvariant() != type) throw new AppException(Errors.Unsupported, "副檔名與媒體格式不一致");
        if (type.StartsWith("image/", StringComparison.Ordinal))
        {
            using var data = SKData.CreateCopy(bytes);
            using var codec = SKCodec.Create(data);
            var expected = extension switch { ".png" => SKEncodedImageFormat.Png, ".webp" => SKEncodedImageFormat.Webp, _ => SKEncodedImageFormat.Jpeg };
            if (codec is null || codec.EncodedFormat != expected || codec.Info.Width is < 1 or > 8192 || codec.Info.Height is < 1 or > 8192
                || (long)codec.Info.Width * codec.Info.Height > 16_000_000) throw new AppException(Errors.Unsupported, "圖片無效或解析度過高");
            using var bitmap = new SKBitmap(codec.Info);
            if (codec.GetPixels(bitmap.Info, bitmap.GetPixels()) != SKCodecResult.Success) throw new AppException(Errors.Unsupported, "圖片內容不完整");
        }
        else if (type == "application/pdf")
        {
            if (!bytes.StartsWith("%PDF-"u8) || bytes.LastIndexOf("%%EOF"u8) < 0) throw new AppException(Errors.Unsupported, "PDF 內容不完整");
        }
        else
        {
            try { var text = new UTF8Encoding(false, true).GetString(bytes); if (text.Contains('\0')) throw new DecoderFallbackException(); }
            catch (DecoderFallbackException) { throw new AppException(Errors.Unsupported, "純文字必須使用 UTF-8 編碼"); }
        }
        return type;
    }
}
