import React, { useState, useEffect } from 'react';
import Navbar from '../Components/Navbar';

const HowToUse = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isVisible, setIsVisible] = useState({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.id]: entry.isIntersecting
          }));
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const workflowSteps = [
    {
      number: "1",
      title: "Login to Aras",
      description: "Enter your Aras Innovator credentials to access the system with secure authentication.",
      image: "/login.png",
      icon: "🔐",
      color: "from-yellow-400 to-orange-500"
    },
    {
      number: "2",
      title: "Open Parts ItemType",
      description: "Navigate to 'Design Parts' in the TOC panel to access your product database.",
      image: "/toc_parts.png",
      icon: "📁",
      color: "from-yellow-400 to-yellow-600"
    },
    {
      number: "3",
      title: "Search for Parts",
      description: "Use the grid filter or search bar to find specific parts by item number or classification.",
      image: "/search_part.png",
      icon: "🔍",
      color: "from-orange-400 to-yellow-500"
    },
    {
      number: "4",
      title: "View Part Form",
      description: "Click a part to open its details and view attributes like part number and classification.",
      image: "/part_form.png",
      icon: "📋",
      color: "from-yellow-500 to-amber-500"
    },
    {
      number: "5",
      title: "Check BOM Tab",
      description: "Go to the BOM tab to see related child parts using the 'Part BOM' relationship.",
      image: "/bom_tab.png",
      icon: "🔗",
      color: "from-amber-400 to-yellow-500"
    },
    {
      number: "6",
      title: "Generate & View Report",
      description: "Execute the recursive algorithm and view comprehensive classification summaries in HTML format.",
      image: "/images/how-to-use/report_output.png",
      icon: "📊",
      color: "from-yellow-400 to-orange-400"
    }
  ];

  const features = [
    {
      icon: "🔄",
      title: "Recursive Traversal",
      description: "Deep BOM analysis with intelligent cycle detection across all hierarchy levels"
    },
    {
      icon: "📊",
      title: "Smart Aggregation",
      description: "Automatic classification counting and comprehensive data summarization"
    },
    {
      icon: "⚡",
      title: "High Performance",
      description: "Optimized C# server-side algorithms designed for large-scale BOM structures"
    },
    {
      icon: "🎯",
      title: "AML Integration",
      description: "Native Aras queries with advanced relationship handling and data retrieval"
    }
  ];

  return (
    <div className="relative min-h-screen bg-gray-100 p-6">
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-100">
        <div className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-400">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-6 py-20 sm:py-32">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                How It Works
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-4xl mx-auto leading-relaxed mb-8">
                Discover how our <span className="font-semibold bg-white/20 px-3 py-1 rounded-full">Expanded BOM Report</span> system
                recursively analyzes part hierarchies and generates comprehensive classification summaries using Aras Innovator
              </p>
              <div className="flex justify-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-3">
                  <span className="text-white font-medium">Powered by Aras Innovator & C# Backend</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              Step-by-Step Process
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Follow this guided workflow to generate comprehensive BOM reports with detailed classification analysis
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {workflowSteps.map((step, index) => (
              <div
                key={step.number}
                id={`step-${index}`}
                data-animate
                className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 ${isVisible[`step-${index}`] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setActiveStep(index)}
              >
                <div className={`absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center shadow-lg z-10`}>
                  <span className="text-2xl font-bold text-white">{step.number}</span>
                </div>

                <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center bg-gradient-to-br from-yellow-100 to-orange-100">
                    <span className="text-6xl">{step.icon}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-3">
                    <span className="text-2xl">{step.icon}</span>
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className={`absolute inset-0 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 text-center mb-16">
              Data Flow Process
            </h2>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-4">
              {[
                { icon: "🎯", label: "Select Part", desc: "Choose target part" },
                { icon: "🔄", label: "Recursive Scan", desc: "Traverse BOM tree" },
                { icon: "📈", label: "Data Analysis", desc: "Process relationships" },
                { icon: "📋", label: "Generate Report", desc: "Create summary" }
              ].map((item, index) => (
                <React.Fragment key={index}>
                  <div className="flex flex-col items-center text-center group">
                    <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 mb-4">
                      <span className="text-3xl">{item.icon}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{item.label}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                  {index < 3 && (
                    <div className="hidden lg:block text-3xl text-yellow-500 mx-4">
                      →
                    </div>
                  )}
                  {index < 3 && (
                    <div className="lg:hidden text-3xl text-yellow-500 my-4 rotate-90">
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              🧠 Behind the Scenes
            </h2>
            <p className="text-xl text-gray-600">
              Advanced algorithms and intelligent data processing
            </p>
          </div>

          <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-12">
            <div className="bg-gray-800 px-6 py-4 flex items-center gap-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-gray-300 text-sm font-mono">BOMTraversal.cs - Recursive Algorithm</span>
            </div>

            <div className="p-6 overflow-x-auto">
              <pre className="text-gray-300 font-mono text-sm leading-relaxed">
                <code>
                  {`// Recursive BOM traversal with cycle detection
void CollectAllParts(Item part)
{
    if (part == null || part.isError()) return;

    string partId = part.getProperty("id");
    if (visited.Contains(partId)) return;
    visited.Add(partId);

    allParts.Add(part);
    part.fetchRelationships("Part BOM");
    Item bom = part.getRelationships("Part BOM");

    for (int i = 0; i < bom.getItemCount(); i++)
    {
        Item child = bom.getItemByIndex(i).getRelatedItem();
        CollectAllParts(child); // Recursive call
    }
}

// Summarize classifications
Dictionary<string, int> summary = new Dictionary<string, int>();
foreach (Item part in allParts)
{
    string classification = part.getProperty("classification", "Unclassified");
    if (!summary.ContainsKey(classification))
        summary[classification] = 0;
    summary[classification]++;
}`}
                </code>
              </pre>
            </div>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 group hover:border-yellow-200"
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>


          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              🔎 AML Query Structure
            </h3>

            <div className="bg-gray-900 rounded-xl overflow-hidden">
              <div className="bg-gray-800 px-6 py-3">
                <span className="text-gray-300 text-sm font-mono">query.aml - Data Retrieval</span>
              </div>
              <div className="p-6">
                <pre className="text-gray-300 font-mono text-sm leading-relaxed overflow-x-auto">
                  {`<Item type="Part" action="get">
  <item_number>YOUR_PART_NUMBER</item_number>
  <Relationships>
    <Item type="Part BOM" action="get">
      <related_id>
        <Item type="Part" action="get" />
      </related_id>
    </Item>
  </Relationships>
</Item>`}
                </pre>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-900 text-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-center mb-12">📝 Important Notes</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <span className="text-yellow-400 text-xl">💡</span>
                  <div>
                    <h4 className="font-semibold mb-2">Level Expansion</h4>
                    <p className="text-gray-300 text-sm">Level determines how deep the BOM is expanded (1, 2, 3...∞) with intelligent cycle detection.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <span className="text-yellow-400 text-xl">🔗</span>
                  <div>
                    <h4 className="font-semibold mb-2">Part Relationships</h4>
                    <p className="text-gray-300 text-sm">The "Part BOM" relationship connects parent and child parts throughout the hierarchy.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <span className="text-yellow-400 text-xl">👥</span>
                  <div>
                    <h4 className="font-semibold mb-2">User Access</h4>
                    <p className="text-gray-300 text-sm">This report works for all users with appropriate Aras Innovator permissions and access rights.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-white/5 rounded-lg backdrop-blur-sm">
                  <span className="text-yellow-400 text-xl">⚙️</span>
                  <div>
                    <h4 className="font-semibold mb-2">Backend Technology</h4>
                    <p className="text-gray-300 text-sm">The backend uses C# server-side methods with optimized recursive logic for performance.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToUse;