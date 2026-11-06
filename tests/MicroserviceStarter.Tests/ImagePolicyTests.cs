using MicroserviceStarter.Contracts;
using MicroserviceStarter.Message.Infrastructure;
using SkiaSharp;

namespace MicroserviceStarter.Tests;

public class ImagePolicyTests
{
    private static byte[] Image(SKEncodedImageFormat format, int width = 20, int height = 20)
    {
        using var bitmap = new SKBitmap(width, height);
        bitmap.Erase(SKColors.CornflowerBlue);
        using var image = SKImage.FromBitmap(bitmap); using var data = image.Encode(format, 90); return data.ToArray();
    }
    [Theory]
    [InlineData("a.jpg", "image/jpeg", SKEncodedImageFormat.Jpeg)]
    [InlineData("a.jpeg", "image/jpeg", SKEncodedImageFormat.Jpeg)]
    [InlineData("a.webp", "image/webp", SKEncodedImageFormat.Webp)]
    [InlineData("a.png", "image/png", SKEncodedImageFormat.Png)]
    public void ValidImagesDecodeAndMatchTheirDeclaredFormats(string name, string mime, SKEncodedImageFormat format) =>
        Assert.Equal(mime, AttachmentPolicy.Validate(name, mime, Image(format)));
    [Fact]
    public void ImageFormatSpoofingAndDecompressionBombDimensionsAreRejected()
    {
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.jpg", "image/jpeg", Image(SKEncodedImageFormat.Png)));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.png", "image/png", Image(SKEncodedImageFormat.Png, 8193, 1)));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.png", "image/png", Image(SKEncodedImageFormat.Png, 1, 8193)));
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.png", "image/png", Image(SKEncodedImageFormat.Png, 8000, 2001)));
        var jpeg = Image(SKEncodedImageFormat.Jpeg, 100, 100);
        Assert.Throws<AppException>(() => AttachmentPolicy.Validate("a.jpg", "image/jpeg", jpeg.AsSpan(0, jpeg.Length - 80)));
    }
}
