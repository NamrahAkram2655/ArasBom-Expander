using Aras.IOM;
using ArasProjectBackend.Models;
using ArasProjectBackend.Utils;
using Microsoft.AspNetCore.Mvc;
using ArasProjectBackend.Models;
using System.Collections.Generic;
using System;

namespace ArasLoginAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BomController : ControllerBase
    {
        [HttpPost]
        public IActionResult GetBom([FromBody] BomRequest request)
        {
            try
            {
                // Validate Authorization header and session
                string authHeader = Request.Headers["Authorization"];
                if (string.IsNullOrWhiteSpace(authHeader) || !authHeader.StartsWith("Bearer "))
                    return Unauthorized(new { message = "No session ID provided" });

                string sessionId = authHeader["Bearer ".Length..].Trim();
                if (!SessionStore.UserSessions.TryGetValue(sessionId, out var conn))
                    return Unauthorized(new { message = "Invalid session or expired" });

                var inn = IomFactory.CreateInnovator(conn);

                // 1. Get the Part by item_number to find the root part ID
                Item part = inn.newItem("Part", "get");
                part.setProperty("item_number", request.PartNumber);
                part.setAttribute("select", "id,name,item_number,major_rev,state,classification");
                Item result = part.apply();

                if (result.isError() || result.getItemCount() == 0)
                {
                    Console.WriteLine($"Error finding part: {result.getErrorDetail()}");
                    return NotFound(new { message = "Part not found or error retrieving it." });
                }

                string rootPartId = result.getItemByIndex(0).getID();
                var bomList = new List<object>();

                // Dictionary to store quantities for each part ID
                Dictionary<string, string> partQuantities = new Dictionary<string, string>();

                // Recursive function to collect parts with levels (similar to your Aras function)
                void CollectPartLevels(string partId, int level)
                {
                    // Get part details
                    Item partItem = inn.newItem("Part", "get");
                    partItem.setID(partId);
                    partItem.setAttribute("select", "item_number,name,major_rev,state,classification");
                    Item partResult = partItem.apply();

                    if (partResult.isError()) return;

                    string partNumber = partResult.getProperty("item_number", "(Unknown)");

                    // Add current part to the list
                    bomList.Add(new
                    {
                        Name = partResult.getProperty("name", "(Unknown)"),
                        Number = partNumber,
                        Quantity = partQuantities.ContainsKey(partId) ? partQuantities[partId] : "1",
                        Level = level,
                        Revision = partResult.getProperty("major_rev", ""),
                        State = partResult.getProperty("state", ""),
                        Type = partResult.getProperty("classification", "")
                    });

                    // Only continue if we haven't reached the requested level limit
                    if (request.Level == 0 || level < request.Level)
                    {
                        // Get child BOM lines
                        Item bomLines = inn.newItem("Part BOM", "get");
                        bomLines.setProperty("source_id", partId);
                        bomLines.setAttribute("select", "related_id,quantity");
                        Item bomResult = bomLines.apply();

                        if (!bomResult.isError())
                        {
                            for (int i = 0; i < bomResult.getItemCount(); i++)
                            {
                                Item bomLine = bomResult.getItemByIndex(i);
                                string childId = bomLine.getProperty("related_id");

                                if (!string.IsNullOrEmpty(childId))
                                {
                                    // Store the quantity for this child part
                                    string quantity = bomLine.getProperty("quantity", "1");
                                    partQuantities[childId] = quantity;
                                    CollectPartLevels(childId, level + 1);
                                }
                            }
                        }
                    }
                }

                // Start recursion from root part
                CollectPartLevels(rootPartId, 0);

                return Ok(bomList);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Server error in GetBom: {ex.Message}\n{ex.StackTrace}");
                return StatusCode(500, new { message = "Server error", error = ex.Message });
            }
        }


    }

    
}