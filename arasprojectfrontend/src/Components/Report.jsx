import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ExportToCsv } from "export-to-csv-file";
import { Search, X } from "lucide-react";
import DummyWorkflow from "./DummyWorkflow";

const Report = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [partNumber, setPartNumber] = useState("");
  const [level, setLevel] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const columns = [
    { accessorKey: "level", header: "Level" },
    { accessorKey: "name", header: "Part Name" },
    { accessorKey: "partNumber", header: "Part Number" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "revision", header: "Revision" },
    { accessorKey: "state", header: "State" },
    { accessorKey: "type", header: "Type" },
  ];

  const csvOptions = {
    filename: "Expanded_BOM_Report",
    fieldSeparator: ",",
    quoteStrings: '"',
    decimalSeparator: ".",
    showLabels: true,
    useBom: true,
    headers: columns.map((c) => c.header),
  };

  const csvExporter = new ExportToCsv(csvOptions);

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

    if (!partNumber || level === "") {
      setError("Please enter both Part Number and Level.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bom`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionId}`,
          },
          body: JSON.stringify({
            partNumber,
            level: parseInt(level),
          }),
        }
      );

      if (!response.ok) {
        const errorRes = await response.json();
        throw new Error(errorRes.message || "Failed to fetch BOM data.");
      }

      const result = await response.json();

      if (!Array.isArray(result))
        throw new Error("Unexpected response format.");

      const formatted = result.map((item) => ({
        level: item.level ?? "",
        name: item.name ?? "",
        partNumber: item.number ?? "",
        quantity: item.quantity ?? "",
        revision: item.revision ?? "",
        state: item.state ?? "",
        type: item.type ?? "",
      }));

      setData(formatted);
    } catch (err) {
      setError(err.message || "Something went wrong while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (data.length > 0) csvExporter.generateCsv(data);
    else setError("No data to export!");
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    const sorted = [...data].sort((a, b) => {
      const aVal = a[sortConfig.key]?.toString().toLowerCase();
      const bVal = b[sortConfig.key]?.toString().toLowerCase();

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

  return (
    <>
      <div className="mt-4 p-2">
        <div className="my-6 max-w-4xl mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Expanded BOM Report
            </h2>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search for Part Number..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:border-yellow-500"
              onFocus={() => setShowModal(true)}
              readOnly
            />
            <Search
              className="absolute right-3 text-yellow-600 cursor-pointer"
              onClick={() => setShowModal(true)}
            />
          </div>

          {showModal && (
            <>
              <div
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40"
                onClick={() => setShowModal(false)}
              ></div>

              <div className="fixed inset-0 flex justify-center items-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-[90%] max-w-md relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                    onClick={() => setShowModal(false)}
                  >
                    <X size={20} />
                  </button>

                  <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
                    Enter Search Criteria
                  </h3>

                  <div className="space-y-4">
                    <input
                      type="text"
                      value={partNumber}
                      onChange={(e) => setPartNumber(e.target.value)}
                      placeholder="Part Number (e.g., MP0101)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />
                    <input
                      type="number"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      placeholder="Level (e.g., 1, 2, 3)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />
                    {error && (
                      <p className="text-red-500 text-sm text-center">
                        {error}
                      </p>
                    )}
                    <button
                      onClick={async () => {
                        await handleFetch();
                        if (!error && partNumber && level !== "") {
                          setShowModal(false);
                        }
                      }}
                      className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700 disabled:opacity-50"
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

        {error && <div className="text-red-500 mb-2 text-center">{error}</div>}

        {loading && (
          <div className="text-center mb-2">
            <p className="text-gray-600">Loading BOM data...</p>
          </div>
        )}

        <div className="flex justify-center mb-4">
          <button
            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            onClick={handleExport}
            disabled={data.length === 0}
          >
            Export to CSV
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.accessorKey}
                    onClick={() => handleSort(column.accessorKey)}
                    className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b cursor-pointer hover:text-yellow-600"
                  >
                    {column.header}
                    {sortConfig.key === column.accessorKey && (
                      <span className="ml-1">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={column.accessorKey}
                        className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-b"
                      >
                        {row[column.accessorKey] ?? ""}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-8 text-center text-gray-500"
                  >
                    No BOM data available. Please search for a part.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {data.length > 0 && <DummyWorkflow reportData={data} />}
    </>
  );
};

export default Report;
