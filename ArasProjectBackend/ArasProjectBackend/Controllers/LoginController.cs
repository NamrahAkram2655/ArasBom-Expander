using Aras.IOM;
using ArasProjectBackend.Models;
using ArasProjectBackend.Utils;
using Microsoft.AspNetCore.Mvc;

namespace ArasLoginAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LoginController : ControllerBase
    {
        [HttpPost]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            try
            {
                // 1. Create connection
                HttpServerConnection conn = IomFactory.CreateHttpServerConnection(
                    "https://aras33.xavor.com/InnovatorServer","ARAS-DB", request.Username, request.Password);

                // 2. Create Innovator object
                Innovator inn = IomFactory.CreateInnovator(conn);

                // 3. Authenticate
                Item loginResult = conn.Login();

                Console.WriteLine(loginResult.ToString());

                if (loginResult.isError())
                {
                    return Unauthorized(new
                    {
                        message = "Login failed",
                        error = loginResult.getErrorDetail()
                    });
                }

                string sessionId = Guid.NewGuid().ToString();
                SessionStore.UserSessions[sessionId] = conn;

          


                return Ok(new
                {
                    message = "Login successful",
                    sessionId,
                    userId = loginResult.getProperty("id"),
                    identity = loginResult.getProperty("identity_id"),
                    name = request.Username
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }
    }
}
