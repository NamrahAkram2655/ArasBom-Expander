import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import DummyWorkflow from "./DummyWorkflow";
import Papa from "papaparse";

const Report = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [partNumber, setPartNumber] = useState("");
  const [level, setLevel] = useState("");
  const [maxLevels, setMaxLevels] = useState(3);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [apiEndpoint, setApiEndpoint] = useState("relations"); // 'basic' or 'relations'

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  const columns = [
    { accessorKey: "level", header: "Level" },
    { accessorKey: "name", header: "Part Name" },
    { accessorKey: "partNumber", header: "Part Number" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "revision", header: "Revision" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "type", header: "Type" },
    ...(apiEndpoint === "relations"
      ? [{ accessorKey: "parentPartNumber", header: "Parent Part" }]
      : []),
  ];

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;
    if (!sessionId) {
      setError("Session ID not found. Please login first.");
      navigate("/");
    }
  }, [navigate]);

  const handleFetch = async () => {
    setError("");
    setData([]);
    setLoading(true);

    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;
    if (!sessionId) {
      setError("Session expired or not found. Please login again.");
      setLoading(false);
      navigate("/");
      return;
    }

    if (!partNumber) {
      setError("Please enter Part Number.");
      setLoading(false);
      return;
    }

    // Validate level for basic endpoint
    if (apiEndpoint === "basic" && level === "") {
      setError("Please enter Level for basic BOM search.");
      setLoading(false);
      return;
    }

    try {
      let endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/bom`;
      let requestBody = {};

      if (apiEndpoint === "basic") {
        // Basic BOM endpoint
        requestBody = {
          partNumber: partNumber.trim(),
          level: parseInt(level),
        };
      } else {
        // Relations endpoint
        endpoint += "/relations";
        requestBody = {
          partNumber: partNumber.trim(),
          maxLevels: maxLevels,
        };
      }

      // console.log(`Calling ${endpoint} with:`, requestBody);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message || "Failed to fetch BOM data.");
      }

      const result = await response.json();
      // console.log("API Response:", result);
      // console.log("First item structure:", result[0]);

      if (!Array.isArray(result)) {
        throw new Error("Unexpected response format.");
      }

      let formatted = [];

      if (apiEndpoint === "basic") {
        // Format for basic BOM response
        formatted = result.map((item, index) => {
          // console.log(`Item ${index}:`, item);
          return {
            level: item.Level ?? item.level ?? "",
            name: item.Name ?? item.name ?? "",
            partNumber: item.Number ?? item.number ?? item.item_number ?? "",
            quantity: item.Quantity ?? item.quantity ?? "",
            revision: item.Revision ?? item.revision ?? item.major_rev ?? "",
            state: item.State ?? item.state ?? "",
            type: item.type ?? item.Type ?? item.classification ?? "",
          };
        });
      } else {
        // Format for relations BOM response
        formatted = result.map((item, index) => {
          // console.log(`Relations Item ${index}:`, item);
          return {
            level: item.Level ?? item.level ?? "",
            name: item.PartName ?? item.partName ?? item.name ?? "",
            partNumber: item.PartNumber ?? item.partNumber ?? item.number ?? "",
            quantity: item.Quantity ?? item.quantity ?? "",
            revision: item.Revision ?? item.revision ?? item.major_rev ?? "",
            state: item.State ?? item.state ?? "",
            type: item.Type ?? item.type ?? item.classification ?? "",
            parentPartNumber:
              item.ParentPartNumber ?? item.parentPartNumber ?? "",
          };
        });
      }

      setData(formatted);
      setCurrentPage(1);

      if (formatted.length === 0) {
        setError("No BOM data found for the given part number.");
      }
    } catch (err) {
      // console.error("Fetch error:", err);
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length === 0) {
      setError("No data to export!");
      return;
    }

    const exportColumns = columns.filter(
      (col) =>
        apiEndpoint === "basic" ||
        col.accessorKey !== "parentPartNumber" ||
        apiEndpoint === "relations"
    );

    const csv = Papa.unparse({
      fields: exportColumns.map((col) => col.header),
      data: data.map((row) =>
        exportColumns.map((col) => row[col.accessorKey] ?? "")
      ),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute(
      "download",
      `BOM_Report_${partNumber}_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]?.toString().toLowerCase() || "";
      const bVal = b[sortConfig.key]?.toString().toLowerCase() || "";

      if (sortConfig.key === "level") {
        // Numeric sort for level
        const aNum = parseInt(aVal) || 0;
        const bNum = parseInt(bVal) || 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [data, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const currentPageData = sortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  return (
    <>
      <div className="mt-2 sm:mt-4 p-2 min-h-screen">
        <div className="my-3 sm:my-6 max-w-4xl mx-auto px-2 sm:px-4">
          <div className="text-center mb-3 sm:mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              BOM Report
            </h2>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for Part Number..."
              className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-yellow-500"
              onFocus={() => setShowModal(true)}
              readOnly
            />
            <Search
              className="absolute right-3 text-yellow-600 cursor-pointer w-5 h-5 sm:w-6 sm:h-6"
              onClick={() => setShowModal(true)}
            />
          </div>

          {showModal && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="fixed inset-0 flex justify-center items-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    onClick={() => setShowModal(false)}
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center pr-6">
                    Enter Search Criteria
                  </h3>

                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                        BOM Type
                      </label>
                      <select
                        value={apiEndpoint}
                        onChange={(e) => setApiEndpoint(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      >
                        <option value="relations">
                          Relations (Recommended)
                        </option>
                        <option value="basic">Basic</option>
                      </select>
                    </div>

                    {/* Part Number Input */}
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="Part Number (e.g., MP0101)"
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />

                    {/* Conditional inputs based on endpoint */}
                    {apiEndpoint === "basic" ? (
                      <input
                        type="number"
                        value={level}
                        onChange={(e) => setLevel(1)}
                        placeholder="Level 1"
                        min="1"
                        max="1"
                        className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      />
                    ) : (
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Max Levels (1-3)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="3"
                          value={maxLevels}
                          onChange={(e) =>
                            setMaxLevels(parseInt(e.target.value) || 3)
                          }
                          className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                        />
                      </div>
                    )}

                    {/* Info box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3">
                      <div className="flex items-start">
                        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-xs text-blue-700">
                          {apiEndpoint === "relations"
                            ? "Relations mode provides hierarchical BOM data with parent-child relationships."
                            : "Basic mode"}
                        </div>
                      </div>
                    </div>

                    {error && (
                      <p className="text-red-500 text-xs sm:text-sm text-center">
                        {error}
                      </p>
                    )}

                    <button
                      onClick={async () => {
                        await handleFetch();
                        if (
                          !error &&
                          partNumber &&
                          (apiEndpoint === "relations" || level !== "")
                        ) {
                          setShowModal(false);
                        }
                      }}
                      className="w-full bg-yellow-600 text-white py-2 text-sm sm:text-base rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading}
                    >
                      {loading ? "Searching..." : "Search"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {error && (
          <div className="text-red-500 mb-2 text-center bg-red-50 border border-red-200 rounded-md p-2 mx-2 sm:mx-4 text-xs sm:text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center mb-2">
            <p className="text-gray-600 text-sm">Loading BOM data...</p>
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mt-2"></div>
          </div>
        )}

        <div className="flex justify-center mb-3 sm:mb-4 px-2">
          <button
            className="bg-green-600 text-white py-2 px-3 sm:px-4 text-xs sm:text-sm rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExport}
            disabled={data.length === 0}
          >
            Export to CSV ({data.length} records)
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md mx-2 sm:mx-0">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    onClick={() => handleSort(column.accessorKey)}
                    className="py-2 sm:py-3 px-2 sm:px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b cursor-pointer hover:text-yellow-600 select-none"
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{column.header}</span>
                      {sortConfig.key === column.accessorKey && (
                        <span className="ml-1 flex-shrink-0">
                          {sortConfig.direction === "asc" ? "▲" : "▼"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentPageData.length > 0 ? (
                currentPageData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className="py-2 sm:py-3 px-2 sm:px-4 text-xs sm:text-sm text-gray-800 border-b"
                      >
                        {column.accessorKey === "level" ? (
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {row[column.accessorKey] ?? ""}
                          </span>
                        ) : (
                          <div
                            className="truncate max-w-[100px] sm:max-w-none"
                            title={row[column.accessorKey] ?? ""}
                          >
                            {row[column.accessorKey] ?? ""}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-6 sm:py-8 text-center text-gray-500 text-sm"
                  >
                    {loading
                      ? "Loading..."
                      : "No BOM data available. Please search for a part."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data.length > rowsPerPage && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mt-3 sm:mt-4 px-2">
            <div className="flex items-center gap-4">
              <button
                className="text-gray-600 hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                onClick={handlePrev}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="text-gray-600 hover:text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
                onClick={handleNext}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <span className="text-gray-700 text-xs sm:text-sm text-center">
              Page {currentPage} of {totalPages} ({data.length} total records)
            </span>
          </div>
        )}
      </div>

      {data.length > 0 && <DummyWorkflow reportData={data} />}
    </>
  );
};

export default Report;
