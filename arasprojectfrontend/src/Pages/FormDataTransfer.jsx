import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Package,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle,
} from "lucide-react";
import Navbar from "../Components/Navbar";

const FormDataTransfer = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showParentForm, setShowParentForm] = useState(true);
  const [useExistingParent, setUseExistingParent] = useState(false);
  const [searchingParent, setSearchingParent] = useState(false);
  const [parentFound, setParentFound] = useState(false);

  // Parent part state
  const [parentPart, setParentPart] = useState({
    partNumber: "",
    name: "",
    revision: "",
    state: "Preliminary",
    type: "Component",
  });

  // Enhanced child part state structure
  const [children, setChildren] = useState([
    {
      partNumber: "",
      name: "",
      revision: "",
      state: "Preliminary",
      type: "Component",
      quantity: "1",
      useExisting: false,  
      found: false,        
      searching: false     
    },
  ]);

  // Predefined options
  const stateOptions = ["Preliminary", "Released", "Superseded", "Obsolete"];
  const typeOptions = ["Component", "Assembly", "Raw Material", "Standard"];

  useEffect(() => {
    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;
    if (!sessionId) {
      setError("Session ID not found. Please login first.");
      navigate("/");
    }
  }, [navigate]);

  const handleParentChange = (field, value) => {
    setParentPart(prev => ({
      ...prev,
      [field]: value
    }));
    setError("");
    
    if (field === "partNumber") {
      setParentFound(false);
    }
  };

  const searchParent = async () => {
    if (!parentPart.partNumber.trim()) {
      setError("Please enter a part number to search.");
      return;
    }

    setSearchingParent(true);
    setError("");
    setParentFound(false);

    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;

    if (!sessionId) {
      setError("Session expired or not found. Please login again.");
      setSearchingParent(false);
      navigate("/");
      return;
    }

    try {
      // Use your existing BOM API to search for the parent part
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bom/relations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          partNumber: parentPart.partNumber.trim(),
          maxLevels: 1,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          // Parent part found, populate details
          const foundPart = result[0];
          setParentPart(prev => ({
            ...prev,
            name: foundPart.partName || prev.name,
            revision: foundPart.revision || prev.revision,
            state: foundPart.state || prev.state,
            type: foundPart.type || prev.type,
          }));
          setParentFound(true);
        //   console.log(foundPart.partName, foundPart.revision, foundPart.state, foundPart.type);
          setSuccess(`Parent part found: ${foundPart.partName}`);
        } else {
          setParentFound(false);
          setError("Parent part not found. You can create a new one by filling in the details below.");
        }
      } else {
        setParentFound(false);
        setError("Parent part not found. You can create a new one by filling in the details below.");
      }
    } catch (err) {
      setParentFound(false);
      setError("Error searching for parent part. You can still create a new one.");
    } finally {
      setSearchingParent(false);
    }
  };

  // Enhanced child change handler
  const handleChildChange = (index, field, value) => {
    const updatedChildren = [...children];
    updatedChildren[index] = {
      ...updatedChildren[index],
      [field]: value
    };
    // Reset found status when part number changes
    if (field === "partNumber") {
      updatedChildren[index].found = false;
    }
    setChildren(updatedChildren);
    setError("");
  };

  // New function to search for existing child parts
  const searchChildPart = async (index) => {
    const child = children[index];
    if (!child.partNumber.trim()) {
      setError("Please enter a part number to search.");
      return;
    }
    const updatedChildren = [...children];
    updatedChildren[index].searching = true;
    updatedChildren[index].found = false;
    setChildren(updatedChildren);
    setError("");
    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;
    if (!sessionId) {
      setError("Session expired or not found. Please login again.");
      updatedChildren[index].searching = false;
      setChildren(updatedChildren);
      navigate("/");
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bom/relations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify({
          partNumber: child.partNumber.trim(),
          maxLevels: 1,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        if (result && result.length > 0) {
          const foundPart = result[0];
          updatedChildren[index] = {
            ...updatedChildren[index],
            name: foundPart.partName || updatedChildren[index].name,
            revision: foundPart.revision || updatedChildren[index].revision,
            state: foundPart.state || updatedChildren[index].state,
            type: foundPart.type || updatedChildren[index].type,
            found: true
          };
          setSuccess(`Child part ${index + 1} found: ${foundPart.partName}`);
        } else {
          updatedChildren[index].found = false;
          setError(`Child part ${index + 1} not found. You can create a new one by filling in the details.`);
        }
      } else {
        updatedChildren[index].found = false;
        setError(`Child part ${index + 1} not found. You can create a new one by filling in the details.`);
      }
    } catch (err) {
      updatedChildren[index].found = false;
      setError(`Error searching for child part ${index + 1}. You can still create a new one.`);
    } finally {
      updatedChildren[index].searching = false;
      setChildren(updatedChildren);
    }
  };

  // Enhanced addChild function
  const addChild = () => {
    setChildren(prev => [
      ...prev,
      {
        partNumber: "",
        name: "",
        revision: "",
        state: "Preliminary",
        type: "Component",
        quantity: "1",
        useExisting: false,  // Default to create new
        found: false,
        searching: false
      }
    ]);
  };

  const removeChild = (index) => {
    if (children.length > 1) {
      setChildren(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Enhanced validation function
  const validateForm = () => {
    // Validate parent part
    if (!parentPart.partNumber.trim()) {
      setError("Parent part number is required.");
      return false;
    }
    if (useExistingParent && !parentFound) {
      setError("Please search and verify the parent part exists, or switch to 'Create New Parent' mode.");
      return false;
    }
    if (!useExistingParent && !parentPart.name.trim()) {
      setError("Parent part name is required when creating a new parent.");
      return false;
    }
    // Validate children
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (!child.partNumber.trim()) {
        setError(`Child part ${i + 1}: Part number is required.`);
        return false;
      }
      // If using existing child and child not found/verified, show error
      if (child.useExisting && !child.found) {
        setError(`Child part ${i + 1}: Please search and verify the part exists, or switch to 'Create New' mode.`);
        return false;
      }
      // If creating new child, validate required fields
      if (!child.useExisting && !child.name.trim()) {
        setError(`Child part ${i + 1}: Part name is required when creating a new part.`);
        return false;
      }
      if (!child.quantity || parseFloat(child.quantity) <= 0) {
        setError(`Child part ${i + 1}: Valid quantity is required.`);
        return false;
      }
    }
    // Check for duplicate part numbers
    const allPartNumbers = [parentPart.partNumber, ...children.map(c => c.partNumber)];
    const uniquePartNumbers = new Set(allPartNumbers);
    if (allPartNumbers.length !== uniquePartNumbers.size) {
      setError("Duplicate part numbers found. Each part must have a unique part number.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const user = JSON.parse(sessionStorage.getItem("user"));
    const sessionId = user?.sessionId;

    if (!sessionId) {
      setError("Session expired or not found. Please login again.");
      setLoading(false);
      navigate("/");
      return;
    }

    try {
      const requestBody = {
        parentPart: {
          partNumber: parentPart.partNumber.trim(),
          name: parentPart.name.trim(),
          revision: parentPart.revision.trim() || "A",
          state: parentPart.state,
          type: parentPart.type,
        },
        children: children.map(child => ({
          partNumber: child.partNumber.trim(),
          name: child.name.trim(),
          revision: child.revision.trim() || "A",
          state: child.state,
          type: child.type,
          quantity: child.quantity,
        })),
      };

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bominsert`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionId}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to insert BOM data.");
      }

      setSuccess("BOM inserted successfully!");
      
      // Reset form
      setParentPart({
        partNumber: "",
        name: "",
        revision: "",
        state: "Preliminary",
        type: "Component",
      });
      setChildren([{
        partNumber: "",
        name: "",
        revision: "",
        state: "Preliminary",
        type: "Component",
        quantity: "1",
        useExisting: false,
        found: false,
        searching: false
      }]);
      setUseExistingParent(false);
      setParentFound(false);

    } catch (err) {
      setError(err.message || "Something went wrong while inserting BOM data.");
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setParentPart({
      partNumber: "",
      name: "",
      revision: "",
      state: "Preliminary",
      type: "Component",
    });
    setChildren([{
      partNumber: "",
      name: "",
      revision: "",
      state: "Preliminary",
      type: "Component",
      quantity: "1",
      useExisting: false,
      found: false,
      searching: false
    }]);
    setError("");
    setSuccess("");
    setUseExistingParent(false);
    setParentFound(false);
  };

  return (
    <div className="mt-2 sm:mt-4 p-2 min-h-screen bg-gray-50">
        <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-800 flex items-center justify-center gap-2">
            <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
            BOM Insert
          </h2>
          <p className="text-gray-600 mt-2">Create a new Bill of Materials structure</p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
            <p className="text-green-700 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Parent Part Section */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div 
            className="p-4 border-b border-gray-200 cursor-pointer flex items-center justify-between"
            onClick={() => setShowParentForm(!showParentForm)}
          >
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Parent Part
            </h3>
            {showParentForm ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          
          {showParentForm && (
            <div className="p-4 space-y-4">
              {/* Toggle for Use Existing vs Create New */}
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="parentMode"
                      checked={!useExistingParent}
                      onChange={() => {
                        setUseExistingParent(false);
                        setParentFound(false);
                        setSuccess("");
                        setError("");
                      }}
                      className="mr-2 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Create New Parent Part</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="parentMode"
                      checked={useExistingParent}
                      onChange={() => {
                        setUseExistingParent(true);
                        setParentFound(false);
                        setSuccess("");
                        setError("");
                      }}
                      className="mr-2 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Use Existing Parent Part</span>
                  </label>
                </div>
              </div>

              {/* Part Number with Search (for existing parent) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Part Number *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={parentPart.partNumber}
                    onChange={(e) => handleParentChange("partNumber", e.target.value)}
                    placeholder="e.g., MP0101"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                  />
                  {useExistingParent && (
                    <button
                      onClick={searchParent}
                      disabled={searchingParent || !parentPart.partNumber.trim()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {searchingParent ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      {searchingParent ? "Searching..." : "Search"}
                    </button>
                  )}
                </div>
                {useExistingParent && parentFound && (
                  <div className="mt-2 flex items-center text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Parent part found and loaded
                  </div>
                )}
              </div>

              {/* Conditional fields based on mode */}
              {!useExistingParent ? (
                // Create New Parent Mode - All fields editable
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Part Name *
                    </label>
                    <input
                      type="text"
                      value={parentPart.name}
                      onChange={(e) => handleParentChange("name", e.target.value)}
                      placeholder="e.g., Main Assembly"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Revision
                      </label>
                      <input
                        type="text"
                        value={parentPart.revision}
                        onChange={(e) => handleParentChange("revision", e.target.value)}
                        placeholder="A"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <select
                        value={parentPart.state}
                        onChange={(e) => handleParentChange("state", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      >
                        {stateOptions.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={parentPart.type}
                        onChange={(e) => handleParentChange("type", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      >
                        {typeOptions.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                parentFound && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h4 className="font-medium text-green-800 mb-2">Existing Parent Part Details:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-600">{parentPart.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Revision:</span>
                        <span className="ml-2 text-gray-600">{parentPart.revision || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">State:</span>
                        <span className="ml-2 text-gray-600">{parentPart.state || "N/A"}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <span className="ml-2 text-gray-600">{parentPart.type || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Children Parts Section */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Child Parts ({children.length})
            </h3>
            <button
              onClick={addChild}
              className="bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700 text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </button>
          </div>

          <div className="p-4 space-y-4">
            {children.map((child, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-4 relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-700">Child Part {index + 1}</h4>
                  {children.length > 1 && (
                    <button
                      onClick={() => removeChild(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {/* NEW: Toggle for Use Existing vs Create New Child */}
                <div className="bg-gray-50 rounded-md p-3 mb-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`childMode${index}`}
                        checked={!child.useExisting}
                        onChange={() => {
                          const updatedChildren = [...children];
                          updatedChildren[index] = {
                            ...updatedChildren[index],
                            useExisting: false,
                            found: false
                          };
                          setChildren(updatedChildren);
                          setError("");
                          setSuccess("");
                        }}
                        className="mr-2 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Create New</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name={`childMode${index}`}
                        checked={child.useExisting}
                        onChange={() => {
                          const updatedChildren = [...children];
                          updatedChildren[index] = {
                            ...updatedChildren[index],
                            useExisting: true,
                            found: false
                          };
                          setChildren(updatedChildren);
                          setError("");
                          setSuccess("");
                        }}
                        className="mr-2 text-yellow-600 focus:ring-yellow-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Use Existing</span>
                    </label>
                  </div>
                </div>
                {/* Part Number with Search (for existing child) */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Part Number *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={child.partNumber}
                      onChange={(e) => handleChildChange(index, "partNumber", e.target.value)}
                      placeholder="e.g., CP0101"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                    />
                    {child.useExisting && (
                      <button
                        onClick={() => searchChildPart(index)}
                        disabled={child.searching || !child.partNumber.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {child.searching ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Search className="w-4 h-4" />
                        )}
                        {child.searching ? "Searching..." : "Search"}
                      </button>
                    )}
                  </div>
                  {child.useExisting && child.found && (
                    <div className="mt-2 flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Child part found and loaded
                    </div>
                  )}
                </div>
                {/* Conditional fields based on mode */}
                {!child.useExisting ? (
                  // Create New Child Mode - All fields editable
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Part Name *
                      </label>
                      <input
                        type="text"
                        value={child.name}
                        onChange={(e) => handleChildChange(index, "name", e.target.value)}
                        placeholder="e.g., Component Part"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={child.quantity}
                          onChange={(e) => handleChildChange(index, "quantity", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Revision
                        </label>
                        <input
                          type="text"
                          value={child.revision}
                          onChange={(e) => handleChildChange(index, "revision", e.target.value)}
                          placeholder="A"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <select
                          value={child.state}
                          onChange={(e) => handleChildChange(index, "state", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                        >
                          {stateOptions.map(state => (
                            <option key={state} value={state}>{state}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={child.type}
                          onChange={(e) => handleChildChange(index, "type", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                        >
                          {typeOptions.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </>
                ) : (
                  // Use Existing Child Mode
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={child.quantity}
                        onChange={(e) => handleChildChange(index, "quantity", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-yellow-500"
                      />
                    </div>
                    {child.found && (
                      <div className="bg-green-50 border border-green-200 rounded-md p-4">
                        <h5 className="font-medium text-green-800 mb-2">Existing Child Part Details:</h5>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Name:</span>
                            <span className="ml-2 text-gray-600">{child.name || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Revision:</span>
                            <span className="ml-2 text-gray-600">{child.revision || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">State:</span>
                            <span className="ml-2 text-gray-600">{child.state || "N/A"}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Type:</span>
                            <span className="ml-2 text-gray-600">{child.type || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto bg-yellow-600 text-white px-6 py-3 rounded-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Inserting BOM...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Insert BOM
              </>
            )}
          </button>
          <button
            onClick={clearForm}
            disabled={loading}
            className="w-full sm:w-auto bg-gray-500 text-white px-6 py-3 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear Form
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="space-y-1 text-xs">
                <li>• <strong>Use Existing Parent:</strong> Search for and use an existing parent part (only adds new BOM relationships)</li>
                <li>• <strong>Create New Parent:</strong> Creates a new parent part with the specified details</li>
                <li>• All part numbers must be unique across parent and child parts</li>
                <li>• Required fields are marked with an asterisk (*)</li>
                <li>• If revision is not specified, it will default to "A"</li>
                <li>• At least one child part is required to create a BOM</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDataTransfer;