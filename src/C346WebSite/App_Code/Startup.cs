using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(C346WebSite.Startup))]
namespace C346WebSite
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
