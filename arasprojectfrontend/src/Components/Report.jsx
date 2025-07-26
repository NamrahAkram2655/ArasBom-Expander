import React, { useState, useEffect, useMemo } from "react";
import { Search, X, ChevronRight, ChevronLeft } from "lucide-react";
import DummyWorkFlow from "./DummyWorkflow";

const Report = () => {
  // Mock navigation function for demo
  const navigate = (path) => console.log(`Navigate to: ${path}`);
  const [data, setData] = useState([]);
  const [partNumber, setPartNumber] = useState("");
  const [level, setLevel] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

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
  ];

  useEffect(() => {
    // Mock session check for demo
    const user = { sessionId: "demo-session" };
    if (!user?.sessionId) {
      setError("Session ID not found. Please login first.");
      navigate("/");
    }
  }, [navigate]);

  const handleFetch = async () => {
    setError("");
    setData([]);
    setLoading(true);

    // Mock user session for demo
    const user = { sessionId: "demo-session" };
    const sessionId = user?.sessionId;
    if (!sessionId) {
      setError("Session expired or not found. Please login again.");
      setLoading(false);
      navigate("/");
      return;
    }

    if (!partNumber) {
      setError("Please enter a Part Number.");
      setLoading(false);
      return;
    }

    try {
      // Mock API call for demo - using data similar to your actual Aras output
      const mockData = partNumber === "MP0101" ? [
        { level: 0, name: "Main Part MP0101", number: "MP0101", quantity: "1", revision: "A", state: "Released", type: "Assembly" },
        { level: 1, name: "Motor Part", number: "MP2942", quantity: "2", revision: "B", state: "Released", type: "Part" },
        { level: 2, name: "Motor Housing", number: "MP2667", quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Motor Shaft", number: "MP2322", quantity: "1", revision: "C", state: "Released", type: "Part" },
        { level: 2, name: "Motor Bearing", number: "MP2660", quantity: "2", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Motor Wire", number: "MP2939", quantity: "5", revision: "B", state: "Released", type: "Part" },
        { level: 3, name: "Wire Connector", number: "MP2347", quantity: "2", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Wire Insulation", number: "MP2685", quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Wire Core", number: "MP2940", quantity: "1", revision: "B", state: "Released", type: "Part" },
        { level: 3, name: "Terminal", number: "MP2295", quantity: "4", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Screw M4", number: "MP0370-004", quantity: "8", revision: "A", state: "Released", type: "Hardware" },
        { level: 3, name: "Washer", number: "MP0370-006", quantity: "8", revision: "A", state: "Released", type: "Hardware" },
        { level: 3, name: "Nut M4", number: "MP2728", quantity: "8", revision: "A", state: "Released", type: "Hardware" },
        { level: 3, name: "Bolt", number: "MP0370-008", quantity: "4", revision: "A", state: "Released", type: "Hardware" },
        { level: 1, name: "Control Unit", number: "MP2941", quantity: "1", revision: "A", state: "Released", type: "Assembly" },
        { level: 2, name: "PCB Board", number: "MP2194", quantity: "1", revision: "C", state: "Released", type: "Part" },
        { level: 2, name: "Processor", number: "MP2196", quantity: "1", revision: "B", state: "Released", type: "Part" },
        { level: 2, name: "Memory Chip", number: "MP2199-2", quantity: "2", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Capacitor", number: "MP2193", quantity: "15", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Resistor", number: "MP2198", quantity: "25", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "LED Indicator", number: "MP2195", quantity: "3", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Switch", number: "MP2965", quantity: "2", revision: "B", state: "Released", type: "Part" },
        { level: 3, name: "Button", number: "MP2964", quantity: "4", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Display", number: "MP2963", quantity: "1", revision: "C", state: "Released", type: "Part" },
        { level: 1, name: "Housing Assembly", number: "MP1872", quantity: "1", revision: "A", state: "Released", type: "Assembly" },
        { level: 2, name: "Front Cover", number: "MP2664", quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Back Cover", number: "MP2405", quantity: "1", revision: "B", state: "Released", type: "Part" },
        { level: 2, name: "Side Panel L", number: "MP1868", quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 2, name: "Side Panel R", number: "MP0370-007", quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Gasket", number: "MP2690", quantity: "4", revision: "A", state: "Released", type: "Part" },
        { level: 3, name: "Seal", number: "MP2453", quantity: "2", revision: "A", state: "Released", type: "Part" },
      ] : [
        { level: 0, name: "Sample Part", number: partNumber, quantity: "1", revision: "A", state: "Released", type: "Part" },
        { level: 1, name: "Child Component 1", number: "CH001", quantity: "2", revision: "B", state: "Released", type: "Part" },
        { level: 1, name: "Child Component 2", number: "CH002", quantity: "1", revision: "A", state: "Released", type: "Part" },
      ];

      // Apply level filter if specified
      const levelFilteredData = level !== "" ? 
        mockData.filter(item => item.level <= parseInt(level)) :
        mockData;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const formatted = levelFilteredData.map((item) => ({
        level: item.level,
        name: item.name,
        partNumber: item.number,
        quantity: item.quantity,
        revision: item.revision,
        state: item.state,
        type: item.type,
      }));

      if (formatted.length === 0) {
        setError("No parts found for the specified criteria.");
      } else {
        setData(formatted);
        setCurrentPage(1);
      } 
    } catch (err) {
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

    // Simple CSV generation without Papa.parse
    const headers = columns.map((col) => col.header).join(',');
    const csvData = data.map((row) =>
      columns.map((col) => `"${row[col.accessorKey] ?? ""}"`).join(',')
    ).join('\n');
    
    const csv = headers + '\n' + csvData;

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.setAttribute("download", "Expanded_BOM_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Helper function to get indentation based on level
  const getIndentationStyle = (level) => {
    return {
      paddingLeft: `${level * 20}px`,
    };
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
                      placeholder="Max Level (empty = all levels)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Leave level empty to show all levels, or enter a number to limit depth (e.g., 3)
                    </p>
                    {error && (
                      <p className="text-red-500 text-sm text-center">{error}</p>
                    )}
                    <button
                      onClick={async () => {
                        await handleFetch();
                        if (!error && partNumber) {
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
              {currentPageData.length > 0 ? (
                currentPageData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    className={`hover:bg-gray-50 ${row.level === 0 ? 'bg-blue-50 font-semibold' : ''}`}
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-b">
                      {row.level}
                    </td>
                    <td 
                      className="py-3 px-4 whitespace-nowrap text-sm text-gray-800 border-b"
                      style={getIndentationStyle(row.level)}
                    >
                      {row.level > 0 && '└─ '}{row.name}
                    </td>
                    {columns.slice(2).map((column) => (
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

        {/* Pagination */}
        {data.length > rowsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-4">
            <button
              className="text-gray-600 hover:text-yellow-600 disabled:opacity-50"
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              <ChevronLeft />
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="text-gray-600 hover:text-yellow-600 disabled:opacity-50"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              <ChevronRight />
            </button>
          </div>
        )}

        {data.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">BOM Summary:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Total parts found:</span> {data.length}
              </div>
              <div>
                <span className="font-medium">Max level:</span> {Math.max(...data.map(item => item.level))}
              </div>
              <div>
                <span className="font-medium">Root part:</span> {data.find(item => item.level === 0)?.partNumber}
              </div>
              <div>
                <span className="font-medium">Level distribution:</span>
                {Array.from(new Set(data.map(item => item.level))).sort().map(level => (
                  <span key={level} className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    L{level}: {data.filter(item => item.level === level).length}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <DummyWorkFlow reportData={data}/>
    </>
  );
};

export default Report;