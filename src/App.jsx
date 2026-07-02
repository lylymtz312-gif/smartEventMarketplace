import React, { useState, useEffect, useRef } from 'react';

// --- INITIAL DATABASE WITH RELATIVE COORDINATES (MAPPING) ---
const INITIAL_PROV_DATABASE = [
  { id: 'p1', name: "Rentas Alianza S.A.", distanceKm: 3.4, mapX: 130, mapY: 90, availableTables: 15, initialStock: 15, priceTable: 150, priceChair: 15, contact: "alianza@rentas.com" },
  { id: 'p2', name: "Mobiliario Gourmet Premium", distanceKm: 12.1, mapX: 280, mapY: 50, availableTables: 80, initialStock: 80, priceTable: 210, priceChair: 22, contact: "gourmet@premium.com" },
  { id: 'p3', name: "Sillas y Mesas del Norte", distanceKm: 7.8, mapX: 70, mapY: 220, availableTables: 8, initialStock: 8, priceTable: 120, priceChair: 12, contact: "norte@sillas.com" }
];

export default function SmartVenueEcoDemo() {
  // --- DATA PERSISTENCE ---
  const [providers, setProviders] = useState(() => {
    const saved = localStorage.getItem('smart_venue_providers');
    return saved ? JSON.parse(saved) : INITIAL_PROV_DATABASE;
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('smart_venue_orders');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => { localStorage.setItem('smart_venue_providers', JSON.stringify(providers)); }, [providers]);
  useEffect(() => { localStorage.setItem('smart_venue_orders', JSON.stringify(orders)); }, [orders]);

  // --- UI CONTROL STATES ---
  const [currentView, setCurrentView] = useState('client');
  const [activeTab, setActiveTab] = useState('2d'); // '2d' or '3d'
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [eventDate, setEventDate] = useState('2026-08-22');
  const [locationName, setLocationName] = useState('Av. Juárez 42, Centro Histórico, CDMX');

  // --- FREE TEXT INPUT (CORE PROP) ---
  const [prompt, setPrompt] = useState('Elegant wedding for 100 people with a dance floor downtown');

  // --- ARCHITECTURAL LAYOUT ELEMENTS ---
  const [layoutElements, setLayoutElements] = useState([]);
  const [layoutType, setLayoutType] = useState('banquete');
  const [hasDanceFloor, setHasDanceFloor] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [cart, setCart] = useState(null);

  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState({ ai: false, pay: false });
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showProvidersList, setShowProvidersList] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  // ADMIN FORM STATES
  const [newProvName, setNewProvName] = useState('');
  const [newProvStock, setNewProvStock] = useState(30);
  const [newProvPriceT, setNewProvPriceT] = useState(130);
  const [newProvPriceC, setNewProvPriceC] = useState(12);
  const [newProvDist, setNewProvDist] = useState(5.0);
  const [newProvContact, setNewProvContact] = useState('');

  const ecoFriendlyProviderId = providers.length > 0
    ? providers.reduce((prev, curr) => prev.distanceKm < curr.distanceKm ? prev : curr).id
    : null;

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 4000); };

  const handleAdminToggle = () => {
    if (currentView === 'admin') {
      setCurrentView('client');
    } else {
      setShowLoginModal(true);
      setAuthError('');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'gemini2026') {
      setCurrentView('admin');
      setShowLoginModal(false);
      setUsername(''); setPassword('');
      showToast("🔒 Corporate Access Granted.");
    } else {
      setAuthError("Incorrect credentials. Try admin / gemini2026");
    }
  };

  // --- NATURAL LANGUAGE PARSING ENGINE (FREE TEXT TO LAYOUT) ---
  const parseTextToArchitecture = () => {
    if (!locationName) return alert("Please enter the address to calculate logistics coverage.");
    setStatus(prev => ({ ...prev, ai: true }));
    setCart(null); setSelectedProvider(null); setPaymentSuccess(false); setActiveReceipt(null);

    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();

      const matchPeople = lowerPrompt.match(/(\d+)/);
      let peopleCount = matchPeople ? parseInt(matchPeople[1], 10) : 80;

      let style = 'banquete';
      if (lowerPrompt.includes('conferencia') || lowerPrompt.includes('conference') || lowerPrompt.includes('auditorio') || lowerPrompt.includes('auditorium') || lowerPrompt.includes('curso') || lowerPrompt.includes('course') || lowerPrompt.includes('sillas solas') || lowerPrompt.includes('chairs only')) {
        style = 'auditorio';
      }
      setLayoutType(style);

      const danceFloorDetected = lowerPrompt.includes('pista') || lowerPrompt.includes('baile') || lowerPrompt.includes('dance') || lowerPrompt.includes('floor') || lowerPrompt.includes('escenario') || lowerPrompt.includes('stage');
      setHasDanceFloor(danceFloorDetected);

      generateLayoutCoordinates(peopleCount, style, danceFloorDetected);

      setStatus(prev => ({ ...prev, ai: false }));
      setShowProvidersList(true);
      showToast("🤖 AI: Free text interpreted and layout rendered.");
    }, 1000);
  };

  const generateLayoutCoordinates = (people, style, danceFloor) => {
    const elements = [];

    if (danceFloor) {
      elements.push({ id: 'dance-floor', type: 'zone', name: '💃 DANCE FLOOR / STAGE', x: 130, y: 90, width: 120, height: 70 });
    }

    if (style === 'banquete') {
      const tablesNeeded = Math.ceil(people / 10);
      let count = 0;
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 5; col++) {
          if (count >= tablesNeeded) break;
          const xPos = 25 + (col * 75);
          const yPos = 25 + (row * 65);

          if (danceFloor && xPos > 100 && xPos < 240 && yPos > 60 && yPos < 160) {
            continue;
          }

          elements.push({ id: `m-${count+1}`, type: 'table', number: count + 1, x: xPos, y: yPos });
          count++;
        }
      }
    } else {
      let chairCount = 0;
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 10; col++) {
          if (chairCount >= people) break;
          elements.push({
            id: `c-${chairCount+1}`,
            type: 'chair-only',
            number: chairCount + 1,
            x: 20 + (col * 35),
            y: 90 + (row * 35)
          });
          chairCount++;
        }
      }
    }
    setLayoutElements(elements);
  };

  // --- ITERATIVE CONTROLS ---
  const handleAddElementIterative = () => {
    if (layoutElements.length === 0) return;
    const nextNumber = layoutElements.filter(e => e.type === (layoutType === 'banquete' ? 'table' : 'chair-only')).length + 1;
    const newElement = {
      id: `m-${Date.now()}`,
      type: layoutType === 'banquete' ? 'table' : 'chair-only',
      number: nextNumber,
      x: 30 + Math.random() * 300,
      y: 30 + Math.random() * 180
    };
    const updated = [...layoutElements, newElement];
    setLayoutElements(updated);
    recalculateCartLive(updated);
    showToast("➕ Element added to structural layout.");
  };

  const handleClearZones = () => {
    const updated = layoutElements.filter(e => e.type !== 'zone');
    setLayoutElements(updated);
    setHasDanceFloor(false);
    recalculateCartLive(updated);
    showToast("🧹 Dance floor architecturally removed.");
  };

  const recalculateCartLive = (currentElements) => {
    if (!selectedProvider) return;
    const tablesCount = currentElements.filter(e => e.type === 'table').length;
    const chairsCount = layoutType === 'banquete' ? tablesCount * 10 : currentElements.filter(e => e.type === 'chair-only').length;

    const subtotal = (tablesCount * selectedProvider.priceTable) + (chairsCount * selectedProvider.priceChair);
    const delivery = selectedProvider.distanceKm * 25.0;
    const total = (subtotal + delivery) * 1.16;
    const commission = subtotal * 0.10;

    setCart({ tablesCount, chairsCount, subtotal, delivery, total, commission });
  };

  const handleSelectProvider = (prov) => {
    if (paymentSuccess) return;
    setSelectedProvider(prov);
    const tablesCount = layoutElements.filter(e => e.type === 'table').length;
    const chairsCount = layoutType === 'banquete' ? tablesCount * 10 : layoutElements.filter(e => e.type === 'chair-only').length;

    const subtotal = (tablesCount * prov.priceTable) + (chairsCount * prov.priceChair);
    const delivery = prov.distanceKm * 25.0;
    const total = (subtotal + delivery) * 1.16;
    const commission = subtotal * 0.10;

    setCart({ tablesCount, chairsCount, subtotal, delivery, total, commission });
  };

  const executeSimulatedPayment = () => {
    setStatus(prev => ({ ...prev, pay: true }));
    setTimeout(() => {
      const fakeStripeToken = `ch_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const rentedTables = cart.tablesCount;

      setProviders(prev => prev.map(p => {
        if (p.id === selectedProvider.id) return { ...p, availableTables: Math.max(0, p.availableTables - rentedTables) };
        return p;
      }));

      const ticket = {
        folioStripe: fakeStripeToken,
        fechaCompra: new Date().toLocaleDateString(),
        fechaEvento: eventDate,
        lugar: locationName,
        proveedor: selectedProvider.name,
        mesas: rentedTables,
        sillas: cart.chairsCount,
        costoPorMesa: selectedProvider.priceTable,
        costoPorSilla: selectedProvider.priceChair,
        flete: cart.delivery,
        total: cart.total,
        commissionEarned: cart.commission,
        status: "Dispatched / En Route"
      };

      setActiveReceipt(ticket);
      setOrders(prev => [ticket, ...prev]);
      setStatus(prev => ({ ...prev, pay: false }));
      setPaymentSuccess(true);
      showToast("💳 Payment processed and stock reserved.");
    }, 1200);
  };

  const registerNewProvider = (e) => {
    e.preventDefault();
    if (!newProvName || !newProvContact) return alert("Please fill out the required fields.");

    const randomX = Math.floor(40 + Math.random() * 300);
    const randomY = Math.floor(40 + Math.random() * 200);

    const newProv = {
      id: `p-${Date.now()}`,
      name: newProvName,
      distanceKm: parseFloat(newProvDist),
      mapX: randomX,
      mapY: randomY,
      availableTables: parseInt(newProvStock, 10),
      initialStock: parseInt(newProvStock, 10),
      priceTable: parseFloat(newProvPriceT),
      priceChair: parseFloat(newProvPriceC),
      contact: newProvContact
    };

    setProviders([...providers, newProv]);
    showToast(`🟢 Provider "${newProvName}" mapped successfully.`);
    setNewProvName(''); setNewProvContact('');
  };

  const downloadLayoutJSON = () => {
    const blob = new Blob([JSON.stringify({ project: "AI Blueprint", date: eventDate, elements: layoutElements }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Layout_${eventDate}.json`; a.click();
  };

  const downloadInvoiceXML = () => {
    if (!activeReceipt) return;
    const xmlStructure = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante Version="4.0" Folio="${activeReceipt.folioStripe}" Fecha="${activeReceipt.fechaCompra}">
  <cfdi:Conceptos>
    <cfdi:Concepto Cantidad="${activeReceipt.mesas}" Descripcion="RealTime Rented Tables" Importe="${(activeReceipt.mesas * activeReceipt.costoPorMesa).toFixed(2)}"/>
    <cfdi:Concepto Cantidad="${activeReceipt.sillas}" Descripcion="Ergonomic Chairs" Importe="${(activeReceipt.sillas * activeReceipt.costoPorSilla).toFixed(2)}"/>
  </cfdi:Conceptos>
</cfdi:Comprobante>`;
    const blob = new Blob([xmlStructure.trim()], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `Invoice_${activeReceipt.folioStripe}.xml`; a.click();
  };

  const countOrdersByDate = (targetDateStr) => orders.filter(o => o.fechaEvento === targetDateStr).length;
  const totalGMV = orders.reduce((sum, o) => sum + o.total, 0);
  const totalEarnings = orders.reduce((sum, o) => sum + o.commissionEarned, 0);

  return (
    <div style={{ padding: '20px', fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>

      <style>{`
        @media print {
          body { backgroundColor: #fff; padding: 0; }
          header, .no-print, button, input { display: none !important; }
          .print-container { width: 100% !important; border: none !important; boxShadow: none !important; }
        }
      `}</style>

      {toast && <div className="no-print" style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#2d3748', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: 9999 }}>{toast}</div>}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', padding: '25px', borderRadius: '10px', width: '320px' }}>
            <h4 style={{ margin: '0 0 15px 0' }}>Corporate Authentication</h4>
            <form onSubmit={handleLoginSubmit}>
              <input type="text" placeholder="Username (admin)" value={username} onChange={e => setUsername(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
              <input type="password" placeholder="Password (gemini2026)" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
              {authError && <p style={{ color: '#e53e3e', fontSize: '11px', margin: '0 0 10px 0' }}>{authError}</p>}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowLoginModal(false)} style={{ flex: 1, padding: '8px', background: '#edf2f7', border: 'none', borderRadius: '4px' }}>Close</button>
                <button type="submit" style={{ flex: 1, padding: '8px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px' }}>Login</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: '#fff', padding: '15px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', color: '#2d3748' }}>Smart event logistics marketplace AI</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#718096' }}>Free Text Parsing to Furniture Layout Blueprints in Real-Time</p>
        </div>
        <button onClick={handleAdminToggle} style={{ background: currentView === 'admin' ? '#feebc8' : '#ebf8ff', color: currentView === 'admin' ? '#c05621' : '#2b6cb0', border: 'none', padding: '10px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          {currentView === 'client' ? '🔒 Corporate / Admin Panel' : '🛒 Back to Canvas'}
        </button>
      </header>

      {currentView === 'client' && (
        <div>
          {/* FREE TEXT INPUT (NLP) */}
          <div className="no-print" style={{ background: '#fff', padding: '20px', borderRadius: '10px', marginBottom: '25px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📅 EVENT DATE</label>
                <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }} />
              </div>
              <div style={{ flex: '1', minWidth: '280px' }}>
                <label style={{ fontSize: '11px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>📍 GEOPOSITIONED VENUE / ADDRESS</label>
                <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '13px' }} />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#2b6cb0', display: 'block', marginBottom: '6px' }}>📝 ENTER REQUIREMENTS IN FREE TEXT:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input type="text" value={prompt} onChange={e => setPrompt(e.target.value)} style={{ flex: '1', padding: '12px', borderRadius: '8px', border: '2px solid #cbd5e0', fontSize: '14px' }} placeholder="e.g. Keynote speech for 60 people..." />
                <button onClick={parseTextToArchitecture} style={{ padding: '0 25px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {status.ai ? 'Interpreting...' : 'Generate Architectural Layout'}
                </button>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '11px', color: '#718096' }}>💡 Try typing keywords like <strong>"Wedding"</strong>, <strong>"Conference"</strong>, or <strong>"Dance floor"</strong> to see the automated structuring.</p>
            </div>
          </div>

          {/* TAB BUTTONS (2D CANVAS SELECTION vs 3D MODELER) */}
          <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <button 
              onClick={() => setActiveTab('2d')} 
              style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === '2d' ? '#2b6cb0' : '#edf2f7', color: activeTab === '2d' ? '#fff' : '#4a5568', transition: '0.3s' }}>
              📊 2D Layout Canvas View
            </button>
            <button 
              onClick={() => setActiveTab('3d')} 
              style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: activeTab === '3d' ? '#2b6cb0' : '#edf2f7', color: activeTab === '3d' ? '#fff' : '#4a5568', transition: '0.3s' }}>
              🧱 Interactive 3D Layout Generation
            </button>
          </div>

          {/* TAB RENDERING */}
          {activeTab === '2d' ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr', gap: '20px', alignItems: 'start' }}>
              {/* ORIGINAL 2D INTERACTIVE CANVAS */}
              <div className="print-container" style={{ background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '5px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '14px', color: '#2d3748' }}>📐 Generated Layout & Infrastructure (2D)</h3>
                    <span style={{ fontSize: '11px', color: '#718096' }}>Layout Style: <strong>{layoutType === 'banquete' ? 'BANQUET' : 'AUDITORIUM'}</strong></span>
                  </div>
                  {layoutElements.length > 0 && (
                    <div className="no-print" style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={handleAddElementIterative} style={{ background: '#ebf8ff', color: '#2b6cb0', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Add {layoutType === 'banquete' ? 'Table' : 'Chair'}</button>
                      {hasDanceFloor && <button onClick={handleClearZones} style={{ background: '#fff5f5', color: '#c53030', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>🧹 Remove Floor</button>}
                      <button onClick={downloadLayoutJSON} style={{ background: '#edf2f7', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>📥 JSON</button>
                    </div>
                  )}
                </div>

                <div style={{ width: '100%', height: '280px', background: '#f7fafc', border: '2px dashed #cbd5e0', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
                  {layoutElements.length === 0 && (
                    <div style={{ textAlign: 'center', paddingTop: '110px', color: '#a0aec0', fontSize: '13px' }}>The interactive architectural blueprint will be drawn here upon prompt submission.</div>
                  )}

                  {layoutElements.map(el => {
                    if (el.type === 'zone') {
                      return (
                        <div key={el.id} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: `${el.width}px`, height: `${el.height}px`, backgroundColor: '#e6fffa', border: '2px dashed #319795', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '10px', fontWeight: 'bold', color: '#234e52', zIndex: 1 }}>
                          {el.name}
                        </div>
                      );
                    }
                    if (el.type === 'table') {
                      return (
                        <div key={el.id} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: '42px', height: '42px', backgroundColor: '#4299e1', borderRadius: '50%', border: '2px solid #2b6cb0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '10px', fontWeight: 'bold', zIndex: 5, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                          T-{el.number}
                          <div style={{ position: 'absolute', width: '6px', height: '6px', background: '#4a5568', borderRadius: '50%', top: '-8px' }} />
                          <div style={{ position: 'absolute', width: '6px', height: '6px', background: '#4a5568', borderRadius: '50%', bottom: '-8px' }} />
                        </div>
                      );
                    }
                    return (
                      <div key={el.id} style={{ position: 'absolute', left: `${el.x}px`, top: `${el.y}px`, width: '18px', height: '18px', backgroundColor: '#ecc94b', border: '1px solid #d69e2e', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#744210', fontSize: '8px', fontWeight: 'bold' }}>
                        C{el.number}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ORIGINAL GEOSPATIAL RADAR */}
              <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#2d3748' }}>🗺️ SmartVenue Geospatial Radar</h3>
                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#718096' }}>Logistics routes and dispatch</p>

                <div style={{ position: 'relative', width: '100%', height: '280px', background: '#edf2f7', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <svg width="100%" height="100%" viewBox="0 0 400 260">
                    <line x1="100" y1="0" x2="100" y2="260" stroke="#fff" strokeWidth="2" strokeDasharray="4" />
                    <line x1="0" y1="130" x2="400" y2="130" stroke="#fff" strokeWidth="3" />
                    <circle cx="200" cy="130" r="90" fill="none" stroke="#4299e1" strokeWidth="1" strokeDasharray="5" opacity="0.4" />
                    <circle cx="200" cy="130" r="9" fill="#e53e3e" stroke="#fff" strokeWidth="2" />
                    <text x="212" y="134" fill="#2d3748" fontSize="10" fontWeight="bold">📍 Destination</text>

                    {showProvidersList && providers.map(p => {
                      const isSelected = selectedProvider?.id === p.id;
                      const isEco = p.id === ecoFriendlyProviderId;
                      return (
                        <g key={p.id}>
                          {isSelected && <line x1="200" y1="130" x2={p.mapX} y2={p.mapY} stroke="#38a169" strokeWidth="2" strokeDasharray="3" />}
                          <circle cx={p.mapX} cy={p.mapY} r={isSelected ? 8 : 6} fill={isEco ? '#38a169' : '#3182ce'} stroke="#fff" strokeWidth="1.5" />
                          <text x={p.mapX + 10} y={p.mapY + 4} fill="#4a5568" fontSize="9" fontWeight={isSelected ? "bold" : "normal"}>{p.name}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* ORIGINAL PROVIDER SELECTION */}
              <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '12px' }}>Logistics Partners within Range:</h4>
                  {showProvidersList && providers.map(p => {
                    const isEco = p.id === ecoFriendlyProviderId;
                    return (
                      <div key={p.id} onClick={() => handleSelectProvider(p)} style={{ padding: '8px', border: `2px solid ${selectedProvider?.id === p.id ? '#38a169' : '#e2e8f0'}`, borderRadius: '6px', marginBottom: '6px', cursor: 'pointer', backgroundColor: isEco ? '#f0fff4' : '#fff', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong>{p.name}</strong>
                          {isEco && <span style={{ background: '#c6f6d5', color: '#22543d', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>🌱 ECO</span>}
                        </div>
                        <div style={{ color: '#4a5568', margin: '4px 0', fontSize: '11px' }}>
                          📦 Warehouse Stock: <span style={{ color: p.availableTables > 0 ? '#2b6cb0' : '#e53e3e', fontWeight: 'bold' }}>{p.availableTables} tables avail.</span>
                        </div>
                        <span style={{ color: '#e53e3e' }}>Base Delivery: ${p.distanceKm * 25} MXN</span>
                      </div>
                    );
                  })}
                </div>

                {cart && (
                  <div style={{ background: '#fff', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <div style={{ fontSize: '11px', color: '#4a5568', marginBottom: '8px' }}>
                      <div>Infrastructure ({cart.tablesCount}T / {cart.chairsCount}C)</div>
                      <div>Integrated Freight: ${cart.delivery.toFixed(2)}</div>
                    </div>
                    <span style={{ fontSize: '13px', display: 'block', marginBottom: '10px' }}>Total Net inc. VAT: <strong>${cart.total.toFixed(2)} MXN</strong></span>
                    {!paymentSuccess && <button onClick={executeSimulatedPayment} style={{ width: '100%', padding: '10px', background: '#38a169', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>Pay and Reserve Stock</button>}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* --- 3D INTERACTIVE BLUEPRINT GENERATION TAB --- */
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <ThreeDPlannerTab layoutElements={layoutElements} layoutType={layoutType} hasDanceFloor={hasDanceFloor} />
            </div>
          )}

          {/* DETAILED RECEIPT */}
          {activeReceipt && (
            <div className="print-container" style={{ marginTop: '30px', background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #edf2f7', paddingBottom: '10px', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '14px', color: '#2d3748' }}>🧾 LOGISTICS RECEIPT & INVOICE</h3>
                <div className="no-print" style={{ display: 'flex', gap: '5px' }}>
                  <button onClick={downloadInvoiceXML} style={{ background: '#2b6cb0', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>📄 Download XML (Tax Authority)</button>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#4a5568' }}>
                <div><strong>Fiscal UUID:</strong> {activeReceipt.folioStripe}</div>
                <div><strong>Committed Event Date:</strong> {activeReceipt.fechaEvento}</div>
                <div><strong>Destination:</strong> {activeReceipt.lugar}</div>
                <div><strong>Assigned Logistics Operator:</strong> {activeReceipt.proveedor}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORIGINAL CORPORATE ADMINISTRATION PANEL */}
      {currentView === 'admin' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '20px', marginBottom: '25px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2b6cb0' }}>
              <span style={{ fontSize: '11px', color: '#718096' }}>NET COMMISSIONS RETAINED (10%)</span>
              <h2 style={{ margin: '5px 0 0 0' }}>${totalEarnings.toFixed(2)} MXN</h2>
            </div>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', borderLeft: '4px solid #2f855a' }}>
              <span style={{ fontSize: '11px', color: '#718096' }}>TRANSACTED MARKETPLACE GMV</span>
              <h2 style={{ margin: '5px 0 0 0' }}>${totalGMV.toFixed(2)} MXN</h2>
            </div>
            <div style={{ background: '#fff', padding: '15px', borderRadius: '10px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px' }}>📅 DYNAMIC SCHEDULED ROUTES (SELECTED: {eventDate})</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                <div style={{ padding: '6px', background: eventDate === '2026-08-15' ? '#ebf8ff' : '#edf2f7', borderRadius: '4px' }}><strong>Aug 15</strong><br />{countOrdersByDate('2026-08-15')} Route(s)</div>
                <div style={{ padding: '6px', background: eventDate === '2026-08-22' ? '#ebf8ff' : '#edf2f7', borderRadius: '4px' }}><strong>Aug 22</strong><br />{countOrdersByDate('2026-08-22')} Route(s)</div>
                <div style={{ padding: '6px', background: eventDate === '2026-08-29' ? '#ebf8ff' : '#edf2f7', borderRadius: '4px' }}><strong>Aug 29</strong><br />{countOrdersByDate('2026-08-29')} Route(s)</div>
                <div style={{ padding: '6px', background: eventDate === '2026-09-05' ? '#ebf8ff' : '#edf2f7', borderRadius: '4px' }}><strong>Sep 05</strong><br />{countOrdersByDate('2026-09-05')} Route(s)</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>📦 Suppliers Central Hub (Physical Inventory)</h3>
              <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #edf2f7', color: '#718096', textAlign: 'left' }}>
                    <th>Commercial Partner</th>
                    <th>Current Available Stock</th>
                    <th>Initial Total Capacity</th>
                    <th>Distance to Venue</th>
                  </tr>
                </thead>
                <tbody>
                  {providers.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '8px 0', fontWeight: '600' }}>{p.name} {p.id === ecoFriendlyProviderId ? '🌱' : ''}</td>
                      <td style={{ color: p.availableTables > 0 ? '#2f855a' : '#e53e3e', fontWeight: 'bold' }}>{p.availableTables} units</td>
                      <td style={{ color: '#718096' }}>{p.initialStock || p.availableTables} u.</td>
                      <td>{p.distanceKm} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#fff', padding: '20px', borderRadius: '10px' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>➕ Onboard New Logistics Partners</h3>
              <form onSubmit={registerNewProvider} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: 'bold' }}>Commercial Brand Name *</label>
                  <input type="text" value={newProvName} onChange={e => setNewProvName(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Table Inventory Stock</label>
                  <input type="number" value={newProvStock} onChange={e => setNewProvStock(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 'bold' }}>Venue Distance (km)</label>
                  <input type="number" step="0.1" value={newProvDist} onChange={e => setNewProvDist(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontWeight: 'bold' }}>Logistics Contact Email *</label>
                  <input type="email" value={newProvContact} onChange={e => setNewProvContact(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e0' }} required />
                </div>
                <button type="submit" style={{ gridColumn: 'span 2', padding: '8px', background: '#2b6cb0', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Map & Integrate Supplier</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- INTERNAL SUB-COMPONENT TO ENCAPSULATE THREE.JS INTERACTIVE 3D BLUEPRINT ---
function ThreeDPlannerTab({ layoutElements, layoutType, hasDanceFloor }) {
  const mountRef = useRef(null);
  
  // Local UI control variables inside the 3D Modeler
  const [salonWidth, setSalonWidth] = useState(20);
  const [salonLength, setSalonLength] = useState(20);
  const [danceWidth, setDanceWidth] = useState(6);
  const [danceLength, setDanceLength] = useState(6);
  const [tipoMesa, setTipoMesa] = useState('redonda');
  const [numTables, setNumTables] = useState(10);
  
  const [enableSonido, setEnableSonido] = useState(false);
  const [sonidoWidth, setSonidoWidth] = useState(4);
  const [sonidoLength, setSonidoLength] = useState(3);
  
  const [enableBrincolin, setEnableBrincolin] = useState(false);
  const [brincolinWidth, setBrincolinWidth] = useState(5);
  const [brincolinLength, setBrincolinLength] = useState(5);

  const [enableDulces, setEnableDulces] = useState(false);
  const [dulcesCantidad, setDulcesCantidad] = useState(1);

  const [distributionMsg, setDistributionMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(true);

  // Dynamically sync with formatting data returned from NLP prompt if it exists
  useEffect(() => {
    if (layoutElements && layoutElements.length > 0) {
      const tablesCount = layoutElements.filter(e => e.type === 'table').length;
      const chairsCount = layoutElements.filter(e => e.type === 'chair-only').length;
      
      if (layoutType === 'banquete' && tablesCount > 0) {
        setNumTables(tablesCount);
        setTipoMesa('redonda');
      } else if (layoutType === 'auditorio' && chairsCount > 0) {
        setNumTables(Math.ceil(chairsCount / 10));
        setTipoMesa('rectangular');
      }
    }
  }, [layoutElements, layoutType]);

  useEffect(() => {
    // Safely initialize 3D Engine into React LifeCycle
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xEEEEEE);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / 400, 0.1, 1000);
    camera.position.set(20, 25, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, 400);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;

    let objectsToDrag = [];
    const dragControls = new THREE.DragControls(objectsToDrag, camera, renderer.domElement);
    dragControls.addEventListener('dragstart', () => { controls.enabled = false; });
    dragControls.addEventListener('drag', (event) => { event.object.position.y = 0; });
    dragControls.addEventListener('dragend', () => { controls.enabled = true; });

    // --- SYNCHRONOUS SCENE CONSTRUCT ---
    const floorGeo = new THREE.PlaneGeometry(salonWidth, salonLength);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xDDDDDD, side: THREE.DoubleSide });
    const salonFloorMesh = new THREE.Mesh(floorGeo, floorMat);
    salonFloorMesh.rotation.x = Math.PI / 2;
    salonFloorMesh.receiveShadow = true;
    scene.add(salonFloorMesh);

    const gridHelper = new THREE.GridHelper(Math.max(salonWidth, salonLength), Math.max(salonWidth, salonLength), 0x999999, 0xCCCCCC);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // Dance floor
    const danceGeo = new THREE.PlaneGeometry(danceWidth, danceLength);
    const danceMat = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, side: THREE.DoubleSide, roughness: 0.3 });
    const danceFloorMesh = new THREE.Mesh(danceGeo, danceMat);
    danceFloorMesh.rotation.x = Math.PI / 2;
    danceFloorMesh.position.set(0, 0.02, 0);
    scene.add(danceFloorMesh);

    let reserved = [];
    reserved.push({ x: 0, z: 0, rX: danceWidth / 2 + 1, rZ: danceLength / 2 + 1 });

    // Main VIP / Honor Table
    const mesaPrincipalGroup = crearMesaRectangularRealista(3, 1.2, 0xFFD700, true);
    mesaPrincipalGroup.position.set(0, 0, -salonLength / 2 + 2);
    scene.add(mesaPrincipalGroup);
    objectsToDrag.push(mesaPrincipalGroup);
    reserved.push({ x: 0, z: -salonLength / 2 + 3.5, rX: 5, rZ: 4.5 });

    // Extra Add-ons (Sound, Bouncy Castle, Candy Bar)
    if (enableSonido) {
      const sonidoGroup = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(sonidoWidth, 2, sonidoLength), new THREE.MeshStandardMaterial({ color: 0x333333 }));
      box.position.y = 1;
      sonidoGroup.add(box);
      sonidoGroup.position.set(-salonWidth / 2 + sonidoWidth / 2 + 1, 0, -salonLength / 2 + sonidoLength / 2 + 1);
      scene.add(sonidoGroup);
      objectsToDrag.push(sonidoGroup);
      reserved.push({ x: sonidoGroup.position.x, z: sonidoGroup.position.z, rX: sonidoWidth / 2 + 1, rZ: sonidoLength / 2 + 1 });
    }

    if (enableBrincolin) {
      const brincolinGroup = new THREE.Group();
      const base = new THREE.Mesh(new THREE.BoxGeometry(brincolinWidth, 1.5, brincolinLength), new THREE.MeshStandardMaterial({ color: 0x009688 }));
      base.position.y = 0.75;
      brincolinGroup.add(base);
      brincolinGroup.position.set(salonWidth / 2 - brincolinWidth / 2 - 1, 0, salonLength / 2 - brincolinLength / 2 - 1);
      scene.add(brincolinGroup);
      objectsToDrag.push(brincolinGroup);
      reserved.push({ x: brincolinGroup.position.x, z: brincolinGroup.position.z, rX: brincolinWidth / 2 + 1, rZ: brincolinLength / 2 + 1 });
    }

    if (enableDulces) {
      const dulcesGroup = new THREE.Group();
      for (let i = 0; i < dulcesCantidad; i++) {
        const mDulce = crearMesaRectangularRealista(2.0, 1.0, 0xE91E63, false);
        mDulce.position.set(i * 2.2 - ((dulcesCantidad - 1) * 1.1), 0, 0);
        dulcesGroup.add(mDulce);
      }
      dulcesGroup.position.set(-salonWidth / 2 + 2.5, 0, 0);
      scene.add(dulcesGroup);
      objectsToDrag.push(dulcesGroup);
      reserved.push({ x: dulcesGroup.position.x, z: dulcesGroup.position.z, rX: (dulcesCantidad * 2.2) / 2 + 1, rZ: 2 });
    }

    // Spiral Packing Algorithm for Guest Tables
    let placed = 0;
    let attempts = 0;
    const maxAttempts = 1200;
    let tableFootprintRadius = tipoMesa === 'rectangular' ? 2.5 : (tipoMesa === 'cuadrada' ? 2.3 : 2.2);
    let ringRadius = Math.max(danceWidth, danceLength) / 2 + 2.5;

    while (placed < numTables && attempts < maxAttempts) {
      attempts++;
      let angle = (attempts * 0.4);
      let posX = Math.cos(angle) * ringRadius;
      let posZ = Math.sin(angle) * ringRadius;

      if (attempts % 40 === 0) ringRadius += 2.5;

      if (Math.abs(posX) > (salonWidth / 2 - tableFootprintRadius) || Math.abs(posZ) > (salonLength / 2 - tableFootprintRadius)) {
        continue;
      }

      let collides = false;
      for (let k = 0; k < reserved.length; k++) {
        let res = reserved[k];
        if (Math.abs(posX - res.x) < (tableFootprintRadius + res.rX) && Math.abs(posZ - res.z) < (tableFootprintRadius + res.rZ)) {
          collides = true;
          break;
        }
      }

      if (!collides) {
        let fullTableGroup = tipoMesa === 'rectangular' ? crearMesaRectangularRealista(2.4, 1.0, 0xFFFFFF, true) : (tipoMesa === 'cuadrada' ? crearMesaCuadradaConSillas() : crearMesaRedondaConSillas());
        fullTableGroup.position.set(posX, 0, posZ);
        scene.add(fullTableGroup);
        objectsToDrag.push(fullTableGroup);
        reserved.push({ x: posX, z: posZ, rX: tableFootprintRadius - 0.4, rZ: tableFootprintRadius - 0.4 });
        placed++;
      }
    }

    if (placed < numTables) {
      setIsSuccess(false);
      setDistributionMsg(`⚠️ OVERCAPACITY DETECTED - Insufficient space. Only ${placed} tables fit safely while ensuring clearance.`);
    } else {
      setIsSuccess(true);
      setDistributionMsg(`✅ SUCCESS - Optimal configuration generated without asset overlaps.`);
    }

    // Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Component Teardown Clean Up
    return () => {
      cancelAnimationFrame(animationFrameId);
      dragControls.dispose();
      controls.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [salonWidth, salonLength, danceWidth, danceLength, tipoMesa, numTables, enableSonido, sonidoWidth, sonidoLength, enableBrincolin, brincolinWidth, brincolinLength, enableDulces, dulcesCantidad]);

  // --- 3D VECTORIAL PRIMITIVE HELPERS ---
  function crearSillaTiffany() {
    const sillaGroup = new THREE.Group();
    const matSilla = new THREE.MeshStandardMaterial({ color: 0xD4AF37, roughness: 0.4 });
    const matCojin = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.8 });
    const pataGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.45, 4);
    [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].forEach(p => {
      const pata = new THREE.Mesh(pataGeo, matSilla); pata.position.set(p[0], 0.225, p[1]); sillaGroup.add(pata);
    });
    const asiento = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.05, 0.4), matCojin); asiento.position.y = 0.45; sillaGroup.add(asiento);
    const respL = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), matSilla); respL.position.set(-0.18, 0.7, -0.18); sillaGroup.add(respL);
    const respR = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.5, 4), matSilla); respR.position.set(0.18, 0.7, -0.18); sillaGroup.add(respR);
    const barraSup = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.04, 0.02), matSilla); barraSup.position.set(0, 0.9, -0.18); sillaGroup.add(barraSup);
    return sillaGroup;
  }

  function crearMesaRedondaConSillas() {
    const grupo = new THREE.Group();
    const mesa = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.05, 24), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
    mesa.position.y = 0.75; grupo.add(mesa);
    const pata = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 0.72, 8), new THREE.MeshStandardMaterial({ color: 0x333333 }));
    pata.position.y = 0.36; grupo.add(pata);
    for (let i = 0; i < 10; i++) {
      const ang = (i * Math.PI * 2) / 10;
      const silla = crearSillaTiffany();
      silla.position.set(Math.cos(ang) * 1.2, 0, Math.sin(ang) * 1.2);
      silla.rotation.y = -ang + Math.PI / 2;
      grupo.add(silla);
    }
    return grupo;
  }

  function crearMesaRectangularRealista(ancho, largo, colorHex, incluirSillas) {
    const grupo = new THREE.Group();
    const tablon = new THREE.Mesh(new THREE.BoxGeometry(ancho, 0.05, largo), new THREE.MeshStandardMaterial({ color: colorHex }));
    tablon.position.y = 0.75; grupo.add(tablon);
    [[-0.1, -0.1], [0.1, 0.1]].forEach(() => {
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.72, 4), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      p.position.set(ancho/2 - 0.1, 0.36, largo/2 - 0.1); grupo.add(p);
    });
    if (incluirSillas) {
      for (let i = 0; i < 4; i++) {
        const s = crearSillaTiffany(); s.position.set(-ancho / 2 + 0.4 + (i * (ancho - 0.8) / 3), 0, largo / 2 + 0.35); s.rotation.y = Math.PI; grupo.add(s);
      }
    }
    return grupo;
  }

  function crearMesaCuadradaConSillas() {
    const grupo = new THREE.Group();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 1.5), new THREE.MeshStandardMaterial({ color: 0xFFFFFF }));
    mesh.position.y = 0.75; grupo.add(mesh);
    for (let i = 0; i < 3; i++) {
      const s = crearSillaTiffany(); s.position.set(-0.45 + i * 0.45, 0, 1.5 / 2 + 0.3); s.rotation.y = Math.PI; grupo.add(s);
    }
    return grupo;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
      {/* 3D LATERAL SETTINGS SIDEBAR */}
      <div style={{ maxHeight: '450px', overflowY: 'auto', paddingRight: '10px', fontSize: '13px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>⚙️ Venue Settings</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px' }}>HALL DIMENSIONS (METERS)</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input type="number" value={salonWidth} onChange={e => setSalonWidth(parseFloat(e.target.value) || 10)} style={{ width: '50%', padding: '5px' }} placeholder="Width" />
            <input type="number" value={salonLength} onChange={e => setSalonLength(parseFloat(e.target.value) || 10)} style={{ width: '50%', padding: '5px' }} placeholder="Length" />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px' }}>DANCE FLOOR (METERS)</label>
          <div style={{ display: 'flex', gap: '5px' }}>
            <input type="number" value={danceWidth} onChange={e => setDanceWidth(parseFloat(e.target.value) || 2)} style={{ width: '50%', padding: '5px' }} />
            <input type="number" value={danceLength} onChange={e => setDanceLength(parseFloat(e.target.value) || 2)} style={{ width: '50%', padding: '5px' }} />
          </div>
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block', fontWeight: 'bold', fontSize: '11px' }}>GUEST ARRANGEMENT</label>
          <select value={tipoMesa} onChange={e => setTipoMesa(e.target.value)} style={{ width: '100%', padding: '5px', marginBottom: '5px' }}>
            <option value="redonda">Round (Ø 1.8m)</option>
            <option value="rectangular">Rectangular (2.4x1.0m)</option>
            <option value="cuadrada">Square (1.5x1.5m)</option>
          </select>
          <input type="number" value={numTables} onChange={e => setNumTables(parseInt(e.target.value) || 1)} style={{ width: '100%', padding: '5px' }} placeholder="Number of Tables" />
        </div>

        {/* PERIPHERAL VIEW CONTROLS */}
        <div style={{ borderTop: '1px solid #edf2f7', pt: '5px', marginTop: '10px' }}>
          <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold' }}>
            <input type="checkbox" checked={enableSonido} onChange={e => setEnableSonido(e.target.checked)} /> 🔊 Pro DJ & Sound Setup Space
          </label>
          <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginTop: '5px' }}>
            <input type="checkbox" checked={enableBrincolin} onChange={e => setEnableBrincolin(e.target.checked)} /> 🎪 Kids Inflatable / Bouncy Castle
          </label>
          <label style={{ fontSize: '12px', display: 'block', fontWeight: 'bold', marginTop: '5px' }}>
            <input type="checkbox" checked={enableDulces} onChange={e => setEnableDulces(e.target.checked)} /> 🧁 Structured Candy Bar Table
          </label>
        </div>

        <div style={{ marginTop: '15px', padding: '10px', borderRadius: '6px', fontSize: '11px', backgroundColor: isSuccess ? '#e6fffa' : '#fff5f5', color: isSuccess ? '#234e52' : '#9b2c2c', fontWeight: 'bold' }}>
          {distributionMsg}
        </div>
      </div>

      {/* THREE.JS CANVAS RENDER WRAPPER */}
      <div style={{ position: 'relative', border: '1px solid #cbd5e0', borderRadius: '8px', overflow: 'hidden' }}>
        <div ref={mountRef} style={{ width: '100%', height: '400px', background: '#eee' }}></div>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: '4px', fontSize: '10px', color: '#4a5568', pointerEvents: 'none' }}>
          实质 <strong>Left click + drag</strong> to rotate camera | <strong>Right click</strong> to pan viewport | <strong>Drag elements</strong> to re-locate them in real-time.
        </div>
      </div>
    </div>
  );
}