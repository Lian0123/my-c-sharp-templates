using System.Xml.Linq;

namespace MicroserviceStarter.Tests;

public class ArchitectureTests
{
    public static string Root
    {
        get
        {
            var dir = new DirectoryInfo(AppContext.BaseDirectory);
            while (dir is not null && !File.Exists(Path.Combine(dir.FullName, "global.json"))) dir = dir.Parent;
            return dir?.FullName ?? throw new InvalidOperationException("Repository root not found");
        }
    }
    [Fact]
    public void ServicesCannotReferenceEachOthersProjectsAndDomainCannotReferenceInfrastructure()
    {
        foreach (var service in new[] { "Auth", "Account", "Message" })
            foreach (var file in Directory.GetFiles(Path.Combine(Root, "src", "Services", service), "*.csproj", SearchOption.AllDirectories))
            {
                var refs = XDocument.Load(file).Descendants("ProjectReference").Select(x => Path.GetFullPath(Path.Combine(Path.GetDirectoryName(file)!, x.Attribute("Include")!.Value)));
                foreach (var reference in refs)
                {
                    Assert.DoesNotContain(new[] { "Auth", "Account", "Message" }.Where(x => x != service), other => reference.Contains($"Services/{other}/", StringComparison.Ordinal));
                    if (file.Contains(".Domain/", StringComparison.Ordinal)) Assert.Contains("Shared/Contracts", reference);
                    if (file.Contains(".Application/", StringComparison.Ordinal)) Assert.Contains(".Domain/", reference);
                }
            }
    }
}
