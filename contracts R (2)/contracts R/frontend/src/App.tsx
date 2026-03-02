import React, { useState, useEffect } from 'react';
// @ts-ignore
import { isConnected, requestAccess } from '@stellar/freighter-api';
import { Wallet, Gavel, Clock, Trophy, AlertCircle, RefreshCw } from 'lucide-react';

import AuctionLogin from './components/AuctionLogin';

// Types
interface Auction {
  itemName: string;
  startingPrice: number;
  highestBid: number;
  highestBidder: string | null;
  endTime: number;
  isActive: boolean;
}

interface AuctionEvent {
  id: string;
  type: 'INITIALIZED' | 'BID' | 'ENDED';
  message: string;
  timestamp: Date;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTransacting, setIsTransacting] = useState(false);

  // Auction State (Mocking Smart Contract State)
  const [auction, setAuction] = useState<Auction | null>(null);
  const [events, setEvents] = useState<AuctionEvent[]>([]);
  const [bidAmount, setBidAmount] = useState('');

  // Create Auction Form State
  const [itemName, setItemName] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [duration, setDuration] = useState('60'); // minutes

  // Connect Freighter Wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const connected = await isConnected();
      if (!connected) {
        alert("Freighter not installed");
        setIsConnecting(false);
        return;
      }

      const access = await requestAccess();
      if (access.error) {
        alert("User rejected or permission issue");
        return;
      }

      console.log("Wallet connected:", access.address);
      setAddress(access.address);
    } catch (e) {
      console.error("Wallet connection failed", e);
      alert("An unexpected error occurred while connecting the wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  const addEvent = (type: 'INITIALIZED' | 'BID' | 'ENDED', message: string) => {
    setEvents(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: new Date()
    }, ...prev]);
  };

  // Create Auction Implementation
  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setIsTransacting(true);
    // Simulate Blockchain Transaction Delay
    setTimeout(() => {
      const endTime = Date.now() + parseInt(duration) * 60 * 1000;
      setAuction({
        itemName,
        startingPrice: parseFloat(startPrice),
        highestBid: parseFloat(startPrice),
        highestBidder: null,
        endTime,
        isActive: true,
      });
      addEvent('INITIALIZED', `Auction started for ${itemName} at ${startPrice} XLM`);
      setIsTransacting(false);
    }, 1500);
  };

  // Place Bid Implementation
  const handleBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !auction || !auction.isActive) return;

    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid <= auction.highestBid) {
      alert("Bid must be higher than current highest bid");
      return;
    }

    setIsTransacting(true);

    // Simulate smart contract confirmation
    setTimeout(() => {
      setAuction(prev => prev ? {
        ...prev,
        highestBid: bid,
        highestBidder: address
      } : null);

      addEvent('BID', `New highest bid: ${bid} XLM by ${address.substring(0, 6)}...${address.substring(50)}`);
      setBidAmount('');
      setIsTransacting(false);
    }, 1200);
  };

  // Auto-end auction simulation
  useEffect(() => {
    if (!auction || !auction.isActive) return;

    const interval = setInterval(() => {
      if (Date.now() >= auction.endTime) {
        setAuction(prev => prev ? { ...prev, isActive: false } : null);
        addEvent('ENDED', `Auction ended! Winner: ${auction.highestBidder ? auction.highestBidder.substring(0, 6) + '...' : 'No bids'}`);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Format Time Remaining
  const getTimeRemaining = () => {
    if (!auction) return '';
    if (!auction.isActive) return 'Ended';

    const remaining = Math.max(0, auction.endTime - Date.now());
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m}m ${s}s`;
  };

  if (!isLoggedIn) {
    return <AuctionLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <Gavel size={32} />
          Real-Time Auction DApp
        </div>

        {address ? (
          <div className="status-badge">
            <Wallet size={16} />
            {address.substring(0, 6)}...{address.substring(50)}
          </div>
        ) : (
          <button onClick={connectWallet} disabled={isConnecting}>
            <Wallet size={18} />
            {isConnecting ? 'Connecting...' : 'Connect Freighter'}
          </button>
        )}
      </header>

      <main className="grid">
        {/* Left Column: Create Auction or Current Auction Details */}
        <div className="card">
          {!auction ? (
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
                <AlertCircle size={24} color="var(--primary)" />
                Create New Auction
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Deploy a new auction smart contract.
              </p>

              <form onSubmit={handleCreateAuction}>
                <div className="input-group">
                  <label>Item Name</label>
                  <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} required placeholder="e.g. Rare Soroban NFT" />
                </div>
                <div className="input-group">
                  <label>Starting Price (XLM)</label>
                  <input type="number" step="0.1" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} required placeholder="100" />
                </div>
                <div className="input-group">
                  <label>Duration (Minutes)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder="60" />
                </div>

                <button type="submit" disabled={!address || isTransacting} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
                  {isTransacting ? <RefreshCw className="real-time-indicator" style={{ animation: 'spin 1s linear infinite' }} /> : 'Deploy Auction Contract'}
                </button>
                {!address && <p style={{ color: '#f87171', fontSize: '0.875rem', textAlign: 'center', marginTop: '1rem' }}>Please connect wallet first</p>}
              </form>
            </div>
          ) : (
            <div className="auction-status">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{auction.itemName}</h2>
                <div className={`status-badge ${!auction.isActive ? 'ended' : ''}`}>
                  {auction.isActive ? (
                    <><div className="real-time-indicator" /> Live Auction</>
                  ) : 'Auction Ended'}
                </div>
              </div>

              <div className="grid" style={{ gap: '1rem' }}>
                <div className="stat-box">
                  <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Trophy size={16} /> Highest Bid
                  </div>
                  <div className="stat-value">{auction.highestBid} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>XLM</span></div>
                </div>
                <div className="stat-box">
                  <div className="stat-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={16} /> Time Remaining
                  </div>
                  <div className="stat-value" style={{ color: auction.isActive && auction.endTime - Date.now() < 60000 ? '#f87171' : 'white' }}>
                    {getTimeRemaining()}
                  </div>
                </div>
              </div>

              <div className="stat-box" style={{ padding: '1rem' }}>
                <div className="stat-label">Leading Bidder</div>
                <div style={{ fontFamily: 'monospace', color: auction.highestBidder ? '#4ade80' : 'var(--text-muted)' }}>
                  {auction.highestBidder || 'No bids yet'}
                </div>
              </div>

              {auction.isActive && (
                <form onSubmit={handleBid} className="bidding-section">
                  <input
                    type="number"
                    step="0.1"
                    placeholder={`Min bid: ${(auction.highestBid + 0.1).toFixed(1)}`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={!address || isTransacting}>
                    {isTransacting ? 'Confirming...' : 'Place Bid'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Live Event Log */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0 }}>
            <RefreshCw size={24} color="var(--primary)" />
            Real-Time Events
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Live contract updates listening to <code>soroban_events</code>
          </p>

          <div className="events-log" style={{ flex: 1 }}>
            {events.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0', fontStyle: 'italic' }}>
                Waiting for contract events...
              </div>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="event-item">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      backgroundColor: ev.type === 'INITIALIZED' ? 'rgba(56, 189, 248, 0.2)' : ev.type === 'BID' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)',
                      color: ev.type === 'INITIALIZED' ? '#38bdf8' : ev.type === 'BID' ? '#4ade80' : '#f87171'
                    }}>
                      {ev.type}
                    </span>
                    <span className="event-time">{ev.timestamp.toLocaleTimeString()}</span>
                  </div>
                  <div>{ev.message}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
