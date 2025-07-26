using Aras.IOM;

namespace ArasProjectBackend.Utils
{
    public static class SessionStore
    {
        public static Dictionary<string, HttpServerConnection> UserSessions = new();
    }
}